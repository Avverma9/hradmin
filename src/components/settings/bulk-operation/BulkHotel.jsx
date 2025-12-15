import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:5000/hotels/bulk";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const toStr = (v) => (v === undefined || v === null ? "" : String(v)).trim();
const toNum = (v, fallback = 0) => {
  const s = toStr(v);
  if (!s) return fallback;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const normalizeHeader = (s) =>
  toStr(s)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

const getCell = (row, aliases) => {
  const keys = Object.keys(row || {});
  for (const alias of aliases) {
    const target = normalizeHeader(alias);
    const found = keys.find((k) => normalizeHeader(k) === target);
    if (found) return row[found];
  }
  return undefined;
};

const splitCSV = (v) =>
  toStr(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const formatMs = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}h ${mm}m ${ss}s`;
  if (mm > 0) return `${mm}m ${ss}s`;
  return `${ss}s`;
};

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const postPayload = async (docs) => {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(docs));
  const res = await fetch(API_URL, { method: "POST", body: fd });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || data?.raw || `HTTP ${res.status}`);
  if (data && data.status === false) throw new Error(data.message || "Upload failed");
  return data;
};

const transformRow = (row, idx) => {
  const hotelId = toStr(getCell(row, ["Hotel ID", "HotelId"])) || "";
  const hotelName = toStr(getCell(row, ["Hotel Name", "Hotel Nar", "Hotel"])) || `Hotel ${idx + 1}`;
  const description = toStr(getCell(row, ["Description"])) || "Comfortable stay";
  const hotelOwnerName = toStr(getCell(row, ["Owner Name", "Owner Na"])) || "Owner";
  const state = toStr(getCell(row, ["State"])) || "State";
  const city = toStr(getCell(row, ["City"])) || "City";
  const destination = toStr(getCell(row, ["Destination"])) || city;
  const landmark = toStr(getCell(row, ["Landmark"])) || "Near main market";
  const pinCode = clamp(toNum(getCell(row, ["Pin Code", "Pincode", "Pin Codee"]), 0), 0, 99999999);

  const hotelCategory = toStr(getCell(row, ["Hotel Category", "Category"])) || "";
  const numRooms = clamp(toNum(getCell(row, ["NumRooms", "No of Rooms", "Total Rooms", "Total Room"]), 0), 0, 99999999);

  const latitude = toStr(getCell(row, ["Latitude"])) || "";
  const longitude = toStr(getCell(row, ["Longitude"])) || "";

  const reviews = clamp(toNum(getCell(row, ["Reviews", "Review Count"]), 0), 0, 99999999);
  const rating = clamp(toNum(getCell(row, ["Rating"]), 4.2), 0, 5);
  const starRating = toStr(getCell(row, ["Star Rating", "StarRating"])) || "2";

  const propertyTypeRaw = getCell(row, ["Property Type", "PropertyType"]);
  const propertyType = splitCSV(propertyTypeRaw || "Hotel");

  const contact = toNum(getCell(row, ["Hotel Contact", "Hotel Con", "Contact"]), 9999999999);
  const isAccepted = toStr(getCell(row, ["IsAccepted", "Accepted"])).toLowerCase() === "true";

  const salesManagerContact = toStr(getCell(row, ["Sales Manager Contact"])) || "";
  const generalManagerContact = toStr(getCell(row, ["General Manager Contact", "GM Contact"])) || "";
  const localId = toStr(getCell(row, ["LocalId"])) || "Accepted";
  const hotelEmail = toStr(getCell(row, ["Hotel Email", "Hotel Ema", "Email"])) || "";
  const customerWelcomeNote = toStr(getCell(row, ["Customer Welcome Note", "Welcome Note", "Welcome"])) || `Welcome to ${hotelName}.`;

  const amenitiesStr = getCell(row, ["Amenities", "Amenitie"]);
  const amenities = splitCSV(amenitiesStr || "Wi-Fi, Parking");

  const roomType = toStr(getCell(row, ["Room Type"])) || "Standard";
  const bedTypes = toStr(getCell(row, ["Bed Type", "BedTypes"])) || "Double";
  const roomPrice = clamp(toNum(getCell(row, ["Room Price", "Room Pric"]), 2000), 0, 99999999);
  const countRooms = clamp(toNum(getCell(row, ["Count Rooms", "Total Room", "Total Rooms"]), 5), 1, 99999999);

  const foodName = toStr(getCell(row, ["Food Name", "Food Nam"])) || "Veg Thali";
  const foodType = toStr(getCell(row, ["Food Type"])) || "Veg";
  const about = toStr(getCell(row, ["Food About", "Food Desc", "Food Description"])) || "Tasty & hygienic meals";
  const foodPrice = clamp(toNum(getCell(row, ["Food Price", "Food Pric"]), 250), 0, 99999999);

  const paymentMode = toStr(getCell(row, ["Payment", "Payment Mode"])) || "Both";

  const petsAllowed = toStr(getCell(row, ["Pets Allowed", "Pets Allow", "Pets"])) || "Not Allowed";
  const bachelorAllowed = toStr(getCell(row, ["Bachelor Allowed", "Bachelor"])) || "Not Allowed";
  const smokingAllowed = toStr(getCell(row, ["Smoking"])) || "Not Allowed";
  const alcoholAllowed = toStr(getCell(row, ["Alcohol"])) || "Not Allowed";
  const unmarriedCouplesAllowed = toStr(getCell(row, ["Unmarried Couples Allowed", "Unmarried Couple"])) || "Not Allowed";

  return {
    hotelId,
    hotelName,
    description,
    hotelOwnerName,
    destination,
    onFront: false,
    startDate: "",
    endDate: "",
    state,
    city,
    landmark,
    pinCode,
    hotelCategory,
    numRooms,
    latitude,
    longitude,
    reviews,
    rating,
    starRating,
    propertyType,
    contact,
    isAccepted,
    salesManagerContact,
    localId,
    hotelEmail,
    customerWelcomeNote,
    generalManagerContact,
    amenities,
    rooms: [{ type: roomType, bedTypes, price: roomPrice, countRooms }],
    foods: [{ name: foodName, foodType, about, price: foodPrice }],
    policies: { paymentMode, petsAllowed, bachelorAllowed, smokingAllowed, alcoholAllowed, unmarriedCouplesAllowed },
  };
};

const BulkHotel = () => {
  const [fileName, setFileName] = useState("");
  const [payload, setPayload] = useState([]);
  const [rawRows, setRawRows] = useState(0);

  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [lastError, setLastError] = useState("");

  const [stored, setStored] = useState(0);
  const [failed, setFailed] = useState(0);
  const [total, setTotal] = useState(0);

  const [etaMs, setEtaMs] = useState(0);
  const [avgMsPerItem, setAvgMsPerItem] = useState(250);
  const [progress, setProgress] = useState({ pct: 0, batch: 0, batches: 0 });

  const startedAtRef = useRef(0);
  const doneRef = useRef(0);
  const cancelledRef = useRef(false);

  const resetRun = () => {
    cancelledRef.current = false;
    startedAtRef.current = 0;
    doneRef.current = 0;
    setStored(0);
    setFailed(0);
    setTotal(0);
    setEtaMs(0);
    setAvgMsPerItem(250);
    setProgress({ pct: 0, batch: 0, batches: 0 });
    setLastError("");
  };

  const stats = useMemo(() => {
    const done = stored + failed;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return {
      rows: rawRows,
      ready: payload.length,
      stored,
      failed,
      total,
      pct,
      eta: formatMs(etaMs),
      avg: `${Math.round(avgMsPerItem)} ms/item`,
      batch: `${progress.batch}/${progress.batches}`,
    };
  }, [rawRows, payload.length, stored, failed, total, etaMs, avgMsPerItem, progress.batch, progress.batches]);

  const updateEta = () => {
    const done = doneRef.current;
    const elapsed = Date.now() - startedAtRef.current;
    const per = done > 0 ? elapsed / done : avgMsPerItem;
    const remaining = Math.max(0, total - done);
    setAvgMsPerItem(per);
    setEtaMs(remaining * per);
    setProgress((p) => ({ ...p, pct: total ? Math.round((done / total) * 100) : 0 }));
  };

  const incDone = (ok, fail) => {
    setStored((s) => s + ok);
    setFailed((f) => f + fail);
    doneRef.current += ok + fail;
    updateEta();
  };

  const cancel = () => {
    cancelledRef.current = true;
    toast("Upload cancellation requested", { icon: "⏸️" });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetRun();
    setStatus({ state: "parsing", msg: "Parsing Excel..." });
    setFileName(file.name);
    setPayload([]);
    setRawRows(0);

    const tId = toast.loading("Reading Excel file...");
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("No sheet found in Excel");
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const clean = (rows || []).filter((r) => Object.values(r || {}).some((v) => toStr(v) !== ""));
      const docs = clean.map((r, i) => transformRow(r, i));

      setRawRows(clean.length);
      setPayload(docs);
      setStatus({ state: "ready", msg: `Ready: ${docs.length} hotels` });
      toast.success(`Loaded ${docs.length} hotels`, { id: tId });
    } catch (err) {
      const msg = err?.message || "Failed to parse file";
      setLastError(msg);
      setStatus({ state: "error", msg: "Parse failed" });
      toast.error(msg, { id: tId });
    }
  };

  const upload = async () => {
    if (!payload.length) {
      toast.error("No data loaded. Please choose an Excel file first.");
      return;
    }

    resetRun();
    setStatus({ state: "uploading", msg: "Uploading..." });
    setTotal(payload.length);

    const BATCH_SIZE = 20;
    const batches = chunk(payload, BATCH_SIZE);
    setProgress({ pct: 0, batch: 0, batches: batches.length });
    startedAtRef.current = Date.now();

    const toastId = toast.loading("Uploading batches...");

    for (let i = 0; i < batches.length; i++) {
      if (cancelledRef.current) {
        setStatus({ state: "cancelled", msg: "Cancelled" });
        toast("Upload cancelled", { id: toastId, icon: "⛔" });
        return;
      }

      setProgress((p) => ({ ...p, batch: i + 1 }));
      toast.loading(`Uploading batch ${i + 1}/${batches.length}...`, { id: toastId });

      const batch = batches[i];

      try {
        const res = await postPayload(batch);
        const ok = clamp(toNum(res?.count, batch.length), 0, batch.length);
        incDone(ok, batch.length - ok);
      } catch (err) {
        const msg = err?.message || "Batch upload failed";
        setLastError(msg);

        for (let j = 0; j < batch.length; j++) {
          if (cancelledRef.current) {
            setStatus({ state: "cancelled", msg: "Cancelled" });
            toast("Upload cancelled", { id: toastId, icon: "⛔" });
            return;
          }
          try {
            const res = await postPayload(batch[j]);
            const ok = clamp(toNum(res?.count, 1), 0, 1);
            incDone(ok, 1 - ok);
          } catch (e2) {
            setLastError(e2?.message || msg);
            incDone(0, 1);
          }
        }
      }
    }

    setEtaMs(0);
    setProgress((p) => ({ ...p, pct: 100 }));
    setStatus({ state: "done", msg: "Completed" });
    toast.success(`Upload done. Stored ${stored + (total - (stored + failed))} / Failed ${failed}`, { id: toastId });
  };

  const canUpload = payload.length > 0 && status.state !== "uploading";

  return (
    <div style={styles.page}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: 12,
            background: "#111827",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          },
        }}
      />

      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Bulk Hotel Upload</div>
            <div style={styles.subtitle}>Upload Excel → Preview → Bulk insert to API</div>
          </div>

          <div style={styles.headerActions}>
            <Badge label={`API: ${API_URL}`} />
            <button style={{ ...styles.btn, ...styles.btnPrimary, ...(canUpload ? null : styles.btnDisabled) }} onClick={upload} disabled={!canUpload}>
              Start upload
            </button>
            <button style={{ ...styles.btn, ...styles.btnGhost, ...(status.state === "uploading" ? null : styles.btnDisabled) }} onClick={cancel} disabled={status.state !== "uploading"}>
              Cancel
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardTitle}>How this page works</div>
              <div style={styles.cardHint}>Quick guide</div>
            </div>

            <div style={styles.steps}>
              <div style={styles.stepRow}>
                <div style={styles.stepDot}>1</div>
                <div>
                  <div style={styles.stepTitle}>Choose Excel file</div>
                  <div style={styles.stepText}>First sheet will be read and converted to JSON rows.</div>
                </div>
              </div>

              <div style={styles.stepRow}>
                <div style={styles.stepDot}>2</div>
                <div>
                  <div style={styles.stepTitle}>Preview & auto-mapping</div>
                  <div style={styles.stepText}>Common header aliases are supported; missing keys will still be sent (backend fills defaults).</div>
                </div>
              </div>

              <div style={styles.stepRow}>
                <div style={styles.stepDot}>3</div>
                <div>
                  <div style={styles.stepTitle}>Start upload</div>
                  <div style={styles.stepText}>Uploads in small batches. If a batch fails, it retries item-by-item.</div>
                </div>
              </div>

              <div style={styles.stepRow}>
                <div style={styles.stepDot}>4</div>
                <div>
                  <div style={styles.stepTitle}>Live progress + ETA</div>
                  <div style={styles.stepText}>Shows stored/failed, progress bar and remaining time estimate.</div>
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.fileRow}>
              <label style={styles.fileLabel}>
                <input type="file" accept=".xlsx,.xls" onChange={handleFile} style={styles.fileInput} />
                <span style={styles.fileBtn}>Choose file</span>
              </label>
              <div style={styles.fileName}>{fileName || "No file selected"}</div>
            </div>

            {lastError ? <div style={styles.errorBox}>{lastError}</div> : null}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardTitle}>Upload status</div>
              <div style={styles.cardHint}>Real-time</div>
            </div>

            <div style={styles.statsRow}>
              <Stat label="Rows" value={stats.rows} />
              <Stat label="Ready" value={stats.ready} />
              <Stat label="Stored" value={stats.stored} />
              <Stat label="Failed" value={stats.failed} />
              <Stat label="Progress" value={`${stats.pct}%`} />
              <Stat label="ETA" value={stats.eta} />
            </div>

            <div style={styles.progressWrap}>
              <div style={styles.progressTop}>
                <div style={styles.kv}>
                  <span style={styles.k}>Status</span>
                  <span style={styles.v}>
                    {status.state}
                    {status.msg ? ` — ${status.msg}` : ""}
                  </span>
                </div>
                <div style={styles.kv}>
                  <span style={styles.k}>Batch</span>
                  <span style={styles.v}>{stats.batch}</span>
                </div>
                <div style={styles.kv}>
                  <span style={styles.k}>Avg</span>
                  <span style={styles.v}>{stats.avg}</span>
                </div>
              </div>

              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${stats.pct}%` }} />
              </div>
            </div>

            <div style={styles.tipBox}>
              Tip: If Excel columns are missing, backend will auto-fill defaults to avoid validation errors.
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHead}>
            <div style={styles.cardTitle}>Preview (first 10)</div>
            <div style={styles.cardHint}>What will be sent to server</div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>hotelName</Th>
                  <Th>state</Th>
                  <Th>city</Th>
                  <Th>pinCode</Th>
                  <Th>starRating</Th>
                  <Th>contact</Th>
                  <Th>rooms[0].type</Th>
                  <Th>foods[0].name</Th>
                </tr>
              </thead>
              <tbody>
                {payload.slice(0, 10).map((h, i) => (
                  <tr key={i} style={styles.tr}>
                    <Td>{i + 1}</Td>
                    <Td>{h.hotelName}</Td>
                    <Td>{h.state}</Td>
                    <Td>{h.city}</Td>
                    <Td>{h.pinCode}</Td>
                    <Td>{h.starRating}</Td>
                    <Td>{h.contact}</Td>
                    <Td>{h.rooms?.[0]?.type || ""}</Td>
                    <Td>{h.foods?.[0]?.name || ""}</Td>
                  </tr>
                ))}
                {payload.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={styles.empty}>
                      Choose an Excel file to see preview here.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.footerNote}>
          Uses react-hot-toast for notifications (Toaster + toast APIs). [web:137][web:141]
        </div>
      </div>
    </div>
  );
};

const Badge = ({ label }) => (
  <div style={styles.badge}>
    <span style={styles.badgeDot} />
    <span style={styles.badgeText}>{label}</span>
  </div>
);

const Stat = ({ label, value }) => (
  <div style={styles.stat}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value}</div>
  </div>
);

const Th = ({ children }) => <th style={styles.th}>{children}</th>;
const Td = ({ children }) => <td style={styles.td}>{children}</td>;

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 0% 0%, rgba(79,70,229,0.18), transparent 60%), radial-gradient(1200px 600px at 100% 0%, rgba(16,185,129,0.16), transparent 60%), #0b1220",
    padding: 24,
  },
  shell: {
    maxWidth: 1180,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#e5e7eb",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 900, letterSpacing: 0.2 },
  subtitle: { marginTop: 6, color: "rgba(229,231,235,0.75)", fontSize: 14 },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  grid: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, marginBottom: 14 },
  card: {
    background: "rgba(17,24,39,0.7)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(10px)",
  },
  cardHead: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 900, color: "#fff" },
  cardHint: { fontSize: 12, color: "rgba(229,231,235,0.6)" },

  steps: { display: "grid", gap: 10 },
  stepRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 10,
    background: "rgba(79,70,229,0.25)",
    border: "1px solid rgba(79,70,229,0.45)",
    color: "#c7d2fe",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  stepTitle: { fontWeight: 900, color: "#fff", fontSize: 13 },
  stepText: { marginTop: 2, fontSize: 12.5, color: "rgba(229,231,235,0.7)", lineHeight: 1.3 },

  divider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },

  fileRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  fileLabel: { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" },
  fileInput: { display: "none" },
  fileBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 800,
  },
  fileName: { color: "rgba(229,231,235,0.75)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 },

  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.12)",
    color: "#fecaca",
    fontWeight: 800,
    fontSize: 13,
  },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 },
  stat: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  statLabel: { fontSize: 12, color: "rgba(229,231,235,0.65)" },
  statValue: { marginTop: 4, fontSize: 18, fontWeight: 900, color: "#fff" },

  progressWrap: { marginTop: 14 },
  progressTop: { display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr", gap: 10, marginBottom: 10 },
  kv: { display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
  k: { fontSize: 12, color: "rgba(229,231,235,0.65)" },
  v: { fontSize: 12.5, color: "#fff", fontWeight: 800 },

  progressBar: { height: 12, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(79,70,229,1), rgba(16,185,129,1))",
    transition: "width 180ms linear",
  },

  tipBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: "rgba(16,185,129,0.10)",
    border: "1px solid rgba(16,185,129,0.25)",
    color: "rgba(209,250,229,0.9)",
    fontSize: 12.5,
    lineHeight: 1.35,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
  },
  badgeDot: { width: 8, height: 8, borderRadius: 999, background: "#22c55e", boxShadow: "0 0 0 4px rgba(34,197,94,0.12)" },
  badgeText: { fontSize: 12, color: "rgba(229,231,235,0.8)", fontWeight: 800 },

  btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", fontWeight: 900, cursor: "pointer" },
  btnPrimary: { background: "linear-gradient(90deg, #4f46e5, #22c55e)", color: "#0b1220" },
  btnGhost: { background: "rgba(255,255,255,0.06)", color: "#fff" },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    color: "rgba(229,231,235,0.75)",
    fontWeight: 900,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
  },
  tr: { background: "rgba(255,255,255,0.02)" },
  td: { padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#fff", whiteSpace: "nowrap" },
  empty: { textAlign: "center", padding: 18, color: "rgba(229,231,235,0.65)" },

  footerNote: { marginTop: 12, textAlign: "center", fontSize: 12, color: "rgba(229,231,235,0.55)" },
};

export default BulkHotel;

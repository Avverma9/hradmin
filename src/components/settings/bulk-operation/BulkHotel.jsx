import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import { localUrl as API_URL } from "../../../../utils/util";

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
  const res = await fetch(`${API_URL}/hotels/bulk`, { method: "POST", body: fd });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || data?.raw || `HTTP ${res.status}`);
  if (data && data.status === false) throw new Error(data.message || "Upload failed");
  return data;
};

const tryParse = (val) => {
  try {
    const parsed = JSON.parse(val);
    return (typeof parsed === 'object' && parsed !== null) ? parsed : null;
  } catch {
    return null;
  }
};

const transformRow = (row, idx) => {
  const hotelId = toStr(getCell(row, ["Hotel ID", "HotelId", "hotelId"])) || "";
  const hotelName = toStr(getCell(row, ["Hotel Name", "Hotel Nar", "Hotel", "Name", "Property Name", "hotelName"])) || "";
  const description = toStr(getCell(row, ["Description", "description"])) || "Comfortable stay";
  const hotelOwnerName = toStr(getCell(row, ["Owner Name", "Owner Na", "hotelOwnerName"])) || "Owner";
  const state = toStr(getCell(row, ["State", "state"])) || "State";
  const city = toStr(getCell(row, ["City", "city"])) || "City";
  const destination = toStr(getCell(row, ["Destination", "destination"])) || city;
  const landmark = toStr(getCell(row, ["Landmark", "landmark"])) || "Near main market";
  const pinCode = clamp(toNum(getCell(row, ["Pin Code", "Pincode", "Pin Codee", "pinCode"]), 0), 0, 99999999);

  const hotelCategory = toStr(getCell(row, ["Hotel Category", "Category", "hotelCategory"])) || "";
  const numRooms = clamp(toNum(getCell(row, ["NumRooms", "No of Rooms", "Total Rooms", "Total Room", "numRooms"]), 0), 0, 99999999);

  const latitude = toStr(getCell(row, ["Latitude", "latitude"])) || "";
  const longitude = toStr(getCell(row, ["Longitude", "longitude"])) || "";

  const reviews = clamp(toNum(getCell(row, ["Reviews", "Review Count", "reviewCount", "reviews"]), 0), 0, 99999999);
  const rating = clamp(toNum(getCell(row, ["Rating", "rating"]), 4.2), 0, 5);
  const starRating = toStr(getCell(row, ["Star Rating", "StarRating", "starRating"])) || "2";

  const propertyTypeRaw = getCell(row, ["Property Type", "PropertyType", "propertyType"]);
  const propertyType = tryParse(propertyTypeRaw) || splitCSV(propertyTypeRaw || "Hotel");

  const contact = toNum(getCell(row, ["Hotel Contact", "Hotel Con", "Contact", "contact"]), 9999999999);
  const isAccepted = toStr(getCell(row, ["IsAccepted", "Accepted", "isAccepted"])).toLowerCase() === "true";

  const salesManagerContact = toStr(getCell(row, ["Sales Manager Contact", "salesManagerContact"])) || "";
  const generalManagerContact = toStr(getCell(row, ["General Manager Contact", "GM Contact", "generalManagerContact"])) || "";
  const localId = toStr(getCell(row, ["LocalId", "localId"])) || "Accepted";
  const hotelEmail = toStr(getCell(row, ["Hotel Email", "Hotel Ema", "Email", "hotelEmail"])) || "";
  const customerWelcomeNote = toStr(getCell(row, ["Customer Welcome Note", "Welcome Note", "Welcome", "customerWelcomeNote"])) || `Welcome to ${hotelName}.`;

  const amenitiesRaw = getCell(row, ["Amenities", "Amenitie", "amenities"]);
  const amenities = tryParse(amenitiesRaw) || splitCSV(amenitiesRaw || "Wi-Fi, Parking");

  const imagesRaw = getCell(row, ["Images", "images"]);
  const images = tryParse(imagesRaw) || [];

  const roomType = toStr(getCell(row, ["Room Type"])) || "Standard";
  const bedTypes = toStr(getCell(row, ["Bed Type", "BedTypes"])) || "Double";
  const roomPrice = clamp(toNum(getCell(row, ["Room Price", "Room Pric"]), 2000), 0, 99999999);
  const countRooms = clamp(toNum(getCell(row, ["Count Rooms", "Total Room", "Total Rooms"]), 5), 1, 99999999);
  
  const roomsRaw = getCell(row, ["rooms", "Rooms"]);
  const rooms = tryParse(roomsRaw) || [{ type: roomType, bedTypes, price: roomPrice, countRooms }];

  const foodName = toStr(getCell(row, ["Food Name", "Food Nam"])) || "Veg Thali";
  const foodType = toStr(getCell(row, ["Food Type"])) || "Veg";
  const about = toStr(getCell(row, ["Food About", "Food Desc", "Food Description"])) || "Tasty & hygienic meals";
  const foodPrice = clamp(toNum(getCell(row, ["Food Price", "Food Pric"]), 250), 0, 99999999);

  const foodsRaw = getCell(row, ["foods", "Foods"]);
  const foods = tryParse(foodsRaw) || [{ name: foodName, foodType, about, price: foodPrice }];

  const paymentMode = toStr(getCell(row, ["Payment", "Payment Mode"])) || "Both";
  const petsAllowed = toStr(getCell(row, ["Pets Allowed", "Pets Allow", "Pets"])) || "Not Allowed";
  const bachelorAllowed = toStr(getCell(row, ["Bachelor Allowed", "Bachelor"])) || "Not Allowed";
  const smokingAllowed = toStr(getCell(row, ["Smoking"])) || "Not Allowed";
  const alcoholAllowed = toStr(getCell(row, ["Alcohol"])) || "Not Allowed";
  const unmarriedCouplesAllowed = toStr(getCell(row, ["Unmarried Couples Allowed", "Unmarried Couple"])) || "Not Allowed";

  const policiesRaw = getCell(row, ["policies", "Policies"]);
  const policies = tryParse(policiesRaw) || { paymentMode, petsAllowed, bachelorAllowed, smokingAllowed, alcoholAllowed, unmarriedCouplesAllowed };

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
    images,
    rooms,
    foods,
    policies,
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
            background: "#fff",
            color: "#111827",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            border: "1px solid #e5e7eb",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Bulk Hotel Upload</div>
            <div style={styles.subtitle}>Upload Excel → Preview → Bulk insert</div>
          </div>

          <div style={styles.headerActions}>
            <button style={{ ...styles.btn, ...styles.btnPrimary, ...(canUpload ? {} : styles.btnDisabled) }} onClick={upload} disabled={!canUpload}>
              Start Upload
            </button>
            <button style={{ ...styles.btn, ...styles.btnGhost, ...(status.state === "uploading" ? {} : styles.btnDisabled) }} onClick={cancel} disabled={status.state !== "uploading"}>
              Cancel
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardTitle}>How it works</div>
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
                  <div style={styles.stepText}>Common header aliases are supported; missing keys get default values.</div>
                </div>
              </div>

              <div style={styles.stepRow}>
                <div style={styles.stepDot}>3</div>
                <div>
                  <div style={styles.stepTitle}>Start upload</div>
                  <div style={styles.stepText}>Uploads in batches (20 items). If batch fails, retries item-by-item.</div>
                </div>
              </div>

              <div style={styles.stepRow}>
                <div style={styles.stepDot}>4</div>
                <div>
                  <div style={styles.stepTitle}>Live progress + ETA</div>
                  <div style={styles.stepText}>Shows stored/failed count, progress bar & time estimate.</div>
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.fileRow}>
              <label style={styles.fileLabel}>
                <input type="file" accept=".xlsx,.xls" onChange={handleFile} style={styles.fileInput} />
                <span style={styles.fileBtn}>Choose Excel</span>
              </label>
              <div style={styles.fileName}>{fileName || "No file selected"}</div>
            </div>

            {lastError ? <div style={styles.errorBox}>{lastError}</div> : null}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardTitle}>Upload Status</div>
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

            <div style={styles.tipBox}>💡 Backend auto-fills missing values to avoid validation errors.</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHead}>
            <div style={styles.cardTitle}>Preview (first 10 rows)</div>
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
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
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
                      Choose an Excel file to preview.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    background: "#f9fafb",
    padding: 24,
  },
  shell: {
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 900, color: "#111827" },
  subtitle: { marginTop: 6, color: "#6b7280", fontSize: 14 },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  grid: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 16 },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  cardHead: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 14 },
  cardTitle: { fontSize: 17, fontWeight: 900, color: "#111827" },

  steps: { display: "grid", gap: 12 },
  stepRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: "#4f46e5",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 13,
    flex: "0 0 auto",
  },
  stepTitle: { fontWeight: 800, color: "#111827", fontSize: 14 },
  stepText: { marginTop: 3, fontSize: 13, color: "#6b7280", lineHeight: 1.4 },

  divider: { height: 1, background: "#e5e7eb", margin: "16px 0" },

  fileRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" },
  fileLabel: { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" },
  fileInput: { display: "none" },
  fileBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 800,
    fontSize: 14,
  },
  fileName: { color: "#6b7280", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 },

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #fca5a5",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 700,
    fontSize: 13,
  },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  stat: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  statLabel: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  statValue: { marginTop: 5, fontSize: 19, fontWeight: 900, color: "#111827" },

  progressWrap: { marginTop: 16 },
  progressTop: { display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr", gap: 12, marginBottom: 12 },
  kv: { display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderRadius: 12, background: "#f9fafb", border: "1px solid #e5e7eb" },
  k: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  v: { fontSize: 13, color: "#111827", fontWeight: 800 },

  progressBar: { height: 14, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #4f46e5, #10b981)",
    transition: "width 180ms linear",
  },

  tipBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    fontSize: 13,
    lineHeight: 1.4,
    fontWeight: 600,
  },

  btn: { padding: "10px 16px", borderRadius: 12, border: "1px solid #d1d5db", fontWeight: 900, fontSize: 14, cursor: "pointer" },
  btnPrimary: { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  btnGhost: { background: "#fff", color: "#111827" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    color: "#6b7280",
    fontWeight: 800,
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    background: "#f9fafb",
  },
  trEven: { background: "#f9fafb" },
  td: { padding: "12px 10px", borderBottom: "1px solid #e5e7eb", color: "#111827", whiteSpace: "nowrap" },
  empty: { textAlign: "center", padding: 20, color: "#9ca3af" },
};

export default BulkHotel;

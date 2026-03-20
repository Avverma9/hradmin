import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BadgeDollarSign, CalendarDays, ChevronRight, Edit3, Hash,
  Loader2, Plus, RefreshCw, Trash2, X, CheckCircle2,
  AlertCircle, BedDouble, Building2, Search,
} from 'lucide-react';
import {
  setMonthlyPrice,
  getMonthlyPricesByHotel,
  updateMonthlyPrice,
  deleteMonthlyPrice,
  deleteAllMonthlyPricesByHotel,
  clearMonthlyError,
  clearMonthlySuccess,
} from '../../../redux/slices/admin/monthly';

/* ── Helpers ───────────────────────────────────────────── */
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const today = () => new Date().toISOString().split('T')[0];
const nextMonthEnd = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().split('T')[0];
};

/* ── Skeleton Row ──────────────────────────────────────── */
const Skeleton = () => (
  <tr className="animate-pulse border-b border-zinc-100 bg-white">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-6 py-5">
        <div className={`h-4 rounded-md bg-zinc-100 ${i === 2 ? 'w-2/3' : 'w-full'}`} />
      </td>
    ))}
  </tr>
);

/* ── Price Form Modal ──────────────────────────────────── */
function PriceModal({ mode, entry, hotelId, onClose, onSave, saving }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    roomId:     entry?.roomId    || '',
    startDate:  entry?.startDate ? entry.startDate.split('T')[0] : today(),
    endDate:    entry?.endDate   ? entry.endDate.split('T')[0]   : nextMonthEnd(),
    monthPrice: entry?.monthPrice || '',
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(isEdit ? {} : { roomId: form.roomId }),
      startDate:  form.startDate,
      endDate:    form.endDate,
      monthPrice: Number(form.monthPrice),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl shadow-zinc-900/20 animate-in zoom-in-95 duration-200 overflow-hidden">

        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 bg-zinc-50/50">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">
              {isEdit ? 'Edit Entry' : 'New Entry'}
            </p>
            <h2 className="text-lg font-black text-zinc-900">
              {isEdit ? 'Update Monthly Price' : 'Set Monthly Price'}
            </h2>
            {isEdit && entry?.roomId && (
              <span className="text-xs font-semibold text-zinc-400">Room: {entry.roomId}</span>
            )}
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400">Room ID</label>
              <div className="relative">
                <BedDouble size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  value={form.roomId}
                  onChange={set('roomId')}
                  placeholder="e.g. ROOM-001"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-zinc-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 placeholder:text-zinc-400"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400">Start Date</label>
              <input
                required type="date"
                value={form.startDate}
                onChange={set('startDate')}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400">End Date</label>
              <input
                required type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={set('endDate')}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400">Monthly Price (₹)</label>
            <div className="relative">
              <BadgeDollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                required type="number" min="0"
                value={form.monthPrice}
                onChange={set('monthPrice')}
                placeholder="e.g. 25000"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-zinc-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 placeholder:text-zinc-400"
              />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
              : <><CheckCircle2 size={16} /> {isEdit ? 'Update Price' : 'Set Price'}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Delete All Confirm ────────────────────────────────── */
function DeleteAllConfirm({ hotelId, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-zinc-900/20 text-center animate-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50 mb-5">
          <Trash2 size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-black text-zinc-900">Delete All Prices?</h2>
        <p className="mt-2 text-sm font-medium text-zinc-500 mb-8">
          All monthly price entries for hotel <span className="font-bold text-zinc-800">{hotelId}</span> will be permanently deleted.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Yes, Delete All</>}
          </button>
          <button onClick={onClose} disabled={loading}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function MonthlyPrice() {
  const dispatch = useDispatch();
  const { prices, loading, saving, error, success } = useSelector((s) => s.monthly);

  const [hotelId, setHotelId] = useState('');
  const [searchedHotelId, setSearchedHotelId] = useState('');

  const [addModal,      setAddModal]      = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const loadPrices = () => {
    if (searchedHotelId.trim()) {
      dispatch(getMonthlyPricesByHotel(searchedHotelId.trim()));
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearMonthlySuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!hotelId.trim()) return;
    setSearchedHotelId(hotelId.trim());
    dispatch(getMonthlyPricesByHotel(hotelId.trim()));
  };

  const handleAdd = (data) => {
    dispatch(setMonthlyPrice({ hotelId: searchedHotelId, roomId: data.roomId, data: { startDate: data.startDate, endDate: data.endDate, monthPrice: data.monthPrice } }))
      .unwrap()
      .then(() => setAddModal(false))
      .catch(() => {});
  };

  const handleEdit = (data) => {
    dispatch(updateMonthlyPrice({ id: editTarget._id, data }))
      .unwrap()
      .then(() => setEditTarget(null))
      .catch(() => {});
  };

  const handleDelete = (id) => {
    dispatch(deleteMonthlyPrice(id));
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllMonthlyPricesByHotel(searchedHotelId))
      .unwrap()
      .then(() => setDeleteAllOpen(false))
      .catch(() => {});
  };

  /* ── Stats ───────────────────────────────────────────── */
  const stats = useMemo(() => {
    if (!prices.length) return null;
    const total  = prices.length;
    const avgPrice = Math.round(prices.reduce((a, p) => a + (p.monthPrice || 0), 0) / total);
    const maxPrice = Math.max(...prices.map((p) => p.monthPrice || 0));
    const minPrice = Math.min(...prices.map((p) => p.monthPrice || 0));
    return { total, avgPrice, maxPrice, minPrice };
  }, [prices]);

  return (
    <div className="min-h-screen bg-zinc-50/50 px-4 py-8 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-[1400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <BadgeDollarSign size={18} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Admin Panel</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">Monthly Pricing</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">
              Set and manage monthly room price overrides per hotel.
            </p>
          </div>
          {searchedHotelId && (
            <div className="flex items-center gap-3">
              <button
                onClick={loadPrices}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
              </button>
              <button
                onClick={() => setAddModal(true)}
                className="flex h-12 items-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={18} /> Add Price
              </button>
              {prices.length > 0 && (
                <button
                  onClick={() => setDeleteAllOpen(true)}
                  className="flex h-12 items-center gap-2 rounded-2xl bg-red-50 px-5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 size={16} /> Delete All
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Search Bar ──────────────────────────────── */}
        <form onSubmit={handleSearch} className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
                placeholder="Enter Hotel ID to load prices..."
                className="w-full rounded-2xl border-none bg-zinc-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-zinc-800 outline-none focus:bg-zinc-100 placeholder:text-zinc-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !hotelId.trim()}
              className="flex h-[52px] items-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Load Prices
            </button>
          </div>
        </form>

        {/* ── Toast Messages ───────────────────────────── */}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 animate-in fade-in">
            <CheckCircle2 size={18} className="shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {typeof error === 'string' ? error : error?.error || 'Something went wrong.'}
            </div>
            <button onClick={() => dispatch(clearMonthlyError())}><X size={16} /></button>
          </div>
        )}

        {/* ── Stats Grid ───────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Total Entries', stats.total,              'text-zinc-900',    'bg-white',       'border-zinc-200'],
              ['Avg Price',     fmtCurrency(stats.avgPrice), 'text-blue-700',  'bg-blue-50',    'border-blue-100'],
              ['Highest',       fmtCurrency(stats.maxPrice), 'text-emerald-700','bg-emerald-50','border-emerald-100'],
              ['Lowest',        fmtCurrency(stats.minPrice), 'text-amber-700', 'bg-amber-50',   'border-amber-100'],
            ].map(([label, val, text, bg, border]) => (
              <div key={label} className={`rounded-3xl border ${border} ${bg} p-5 shadow-sm`}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                <p className={`text-2xl font-black ${text}`}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ────────────────────────────────────── */}
        {searchedHotelId ? (
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40">
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {['#', 'Room ID', 'Room Type', 'Start Date', 'End Date', 'Monthly Price', 'Actions'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-6 py-4 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                  ) : prices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 ring-8 ring-zinc-50/50">
                            <BadgeDollarSign size={32} className="text-zinc-300" />
                          </div>
                          <h3 className="text-lg font-black text-zinc-900">No Price Entries</h3>
                          <p className="mt-1 text-sm font-medium text-zinc-500 max-w-sm">
                            No monthly prices found for hotel <span className="font-bold text-zinc-800">{searchedHotelId}</span>.
                          </p>
                          <button
                            onClick={() => setAddModal(true)}
                            className="mt-6 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-zinc-800 transition-all hover:-translate-y-0.5"
                          >
                            Add First Entry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    prices.map((p, idx) => (
                      <tr key={p._id || idx} className="group transition-colors hover:bg-zinc-50/80">
                        <td className="px-6 py-5">
                          <span className="text-xs font-black text-zinc-300">{String(idx + 1).padStart(2, '0')}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 w-max">
                            <Hash size={12} className="text-zinc-400" />
                            <span className="font-mono text-[11px] font-bold text-zinc-700">{p.roomId || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-zinc-800">{p.roomType || <span className="text-zinc-400 font-medium">—</span>}</p>
                            {p.roomBedType && (
                              <p className="text-xs font-medium text-zinc-400">{p.roomBedType}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                            <CalendarDays size={13} className="text-zinc-400" />
                            {fmt(p.startDate)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                            <CalendarDays size={13} className="text-zinc-400" />
                            {fmt(p.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-base font-black text-emerald-700">{fmtCurrency(p.monthPrice)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditTarget(p)}
                              title="Edit"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 active:scale-95"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              title="Delete"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && prices.length > 0 && (
              <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {prices.length} Entr{prices.length !== 1 ? 'ies' : 'y'} — Hotel {searchedHotelId}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Empty / initial state */
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-white py-24 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 mb-5 ring-8 ring-zinc-50/50">
              <BadgeDollarSign size={32} className="text-zinc-300" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">Enter a Hotel ID</h3>
            <p className="mt-1 text-sm font-medium text-zinc-400 max-w-sm mx-auto">
              Type a hotel ID in the search bar above and click "Load Prices" to manage monthly pricing.
            </p>
          </div>
        )}

      </div>

      {/* ── Modals ────────────────────────────────────── */}
      {addModal && (
        <PriceModal
          mode="add"
          hotelId={searchedHotelId}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
          saving={saving}
        />
      )}

      {editTarget && (
        <PriceModal
          mode="edit"
          entry={editTarget}
          hotelId={searchedHotelId}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
          saving={saving}
        />
      )}

      {deleteAllOpen && (
        <DeleteAllConfirm
          hotelId={searchedHotelId}
          onClose={() => setDeleteAllOpen(false)}
          onConfirm={handleDeleteAll}
          loading={loading}
        />
      )}
    </div>
  );
}

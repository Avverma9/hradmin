import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search,
  RefreshCw,
  Car,
  CalendarDays,
  MapPin,
  Phone,
  User,
  ChevronDown,
  X,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  CircleAlert,
} from 'lucide-react'
import {
  getBookingsOfOwner,
  getAllOwners,
  changeBookingStatus,
  clearCarError,
  clearCarSuccess,
} from '../../../redux/slices/tms/travel/car'
import { selectAuth } from '../../../redux/slices/authSlice'
import Breadcrumb from '../../components/breadcrumb'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date)
}

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(date)
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!amount) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)
}

const getBookingsList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.bookings)) return payload.bookings
  return []
}

const STATUS_CONFIG = {
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-500/20',   dot: 'bg-amber-500',   icon: Clock },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500', icon: CheckCircle2 },
  cancelled: { bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'ring-rose-500/20',    dot: 'bg-rose-500',    icon: XCircle },
  completed: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  ring: 'ring-indigo-500/20',  dot: 'bg-indigo-500',  icon: CheckCircle2 },
  rejected:  { bg: 'bg-slate-100',  text: 'text-slate-600',   ring: 'ring-slate-400/20',   dot: 'bg-slate-400',   icon: XCircle },
}

const getStatusConfig = (status = '') => {
  return STATUS_CONFIG[String(status).toLowerCase()] || STATUS_CONFIG.pending
}

const ALLOWED_NEXT_STATUSES = {
  pending:   ['Confirmed', 'Cancelled', 'Rejected'],
  confirmed: ['Completed', 'Cancelled'],
  completed: [],
  cancelled: [],
  rejected:  [],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = getStatusConfig(status)
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status || 'Pending'}
    </span>
  )
}

function BookingDetailModal({ booking, onClose, onStatusChange, updating }) {
  if (!booking) return null
  const normalized = String(booking.status || booking.bookingStatus || 'pending').toLowerCase()
  const nextOptions = ALLOWED_NEXT_STATUSES[normalized] || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Booking Details</h2>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">{booking._id || booking.bookingId || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Status + change */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Status</p>
              <StatusBadge status={booking.status || booking.bookingStatus} />
            </div>
            {nextOptions.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Change Status</p>
                <div className="flex gap-2 flex-wrap justify-end">
                  {nextOptions.map((s) => {
                    const cfg = getStatusConfig(s)
                    return (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => onStatusChange(booking._id || booking.bookingId, s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50 ${cfg.bg} ${cfg.text} ring-1 ring-inset ${cfg.ring}`}
                      >
                        {updating ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Car Info */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Car Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Car Name</span><p className="font-semibold text-slate-900 mt-0.5">{booking.carName || booking.car?.name || 'N/A'}</p></div>
              <div><span className="text-slate-500">Car Type</span><p className="font-semibold text-slate-900 mt-0.5">{booking.carType || booking.car?.type || 'N/A'}</p></div>
              <div><span className="text-slate-500">Plate No.</span><p className="font-semibold text-slate-900 mt-0.5">{booking.plateNumber || booking.car?.plateNumber || 'N/A'}</p></div>
              <div><span className="text-slate-500">Seats</span><p className="font-semibold text-slate-900 mt-0.5">{booking.seats || booking.car?.seats || 'N/A'}</p></div>
            </div>
          </div>

          {/* Journey Info */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Journey</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">From</span><p className="font-semibold text-slate-900 mt-0.5">{booking.from || booking.pickupLocation || 'N/A'}</p></div>
              <div><span className="text-slate-500">To</span><p className="font-semibold text-slate-900 mt-0.5">{booking.to || booking.dropLocation || 'N/A'}</p></div>
              <div><span className="text-slate-500">Travel Date</span><p className="font-semibold text-slate-900 mt-0.5">{formatDate(booking.travelDate || booking.journeyDate)}</p></div>
              <div><span className="text-slate-500">Return Date</span><p className="font-semibold text-slate-900 mt-0.5">{formatDate(booking.returnDate) || '—'}</p></div>
              <div><span className="text-slate-500">Passengers</span><p className="font-semibold text-slate-900 mt-0.5">{booking.passengers || booking.numPassengers || '—'}</p></div>
              <div><span className="text-slate-500">Total Price</span><p className="font-bold text-indigo-700 mt-0.5">{formatCurrency(booking.totalPrice || booking.price)}</p></div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Guest / Booked By</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Name</span><p className="font-semibold text-slate-900 mt-0.5">{booking.guestName || booking.user?.name || booking.bookedBy?.name || 'N/A'}</p></div>
              <div><span className="text-slate-500">Mobile</span><p className="font-semibold text-slate-900 mt-0.5">{booking.guestMobile || booking.user?.mobile || 'N/A'}</p></div>
              <div><span className="text-slate-500">Email</span><p className="font-semibold text-slate-900 mt-0.5 truncate">{booking.guestEmail || booking.user?.email || 'N/A'}</p></div>
              <div><span className="text-slate-500">Booked On</span><p className="font-semibold text-slate-900 mt-0.5">{formatDateTime(booking.createdAt)}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CarBookingsList({ ownerId: propOwnerId }) {
  const dispatch = useDispatch()
  const { user } = useSelector(selectAuth)
  const { ownerBookings, owners, loading, error, success } = useSelector((state) => state.car)

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updating, setUpdating]         = useState(false)

  // Owner ID: prop se aaya ho, ya logged-in user ka id
  const resolvedOwnerId = propOwnerId || user?.id || user?._id || ''

  const bookingsList = useMemo(() => getBookingsList(ownerBookings), [ownerBookings])

  const statusOptions = useMemo(() => {
    const statuses = new Set(bookingsList.map((b) => b.status || b.bookingStatus).filter(Boolean))
    return ['All', ...Array.from(statuses)]
  }, [bookingsList])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookingsList.filter((b) => {
      const matchStatus = statusFilter === 'All' || (b.status || b.bookingStatus) === statusFilter
      const matchSearch = !q ||
        (b.carName || b.car?.name || '').toLowerCase().includes(q) ||
        (b.guestName || b.user?.name || '').toLowerCase().includes(q) ||
        (b.from || b.pickupLocation || '').toLowerCase().includes(q) ||
        (b.to || b.dropLocation || '').toLowerCase().includes(q) ||
        String(b._id || '').toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [bookingsList, search, statusFilter])

  const load = () => {
    if (resolvedOwnerId) dispatch(getBookingsOfOwner(resolvedOwnerId))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedOwnerId])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearCarSuccess()), 3000)
      return () => clearTimeout(t)
    }
  }, [success, dispatch])

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!bookingId) return
    setUpdating(true)
    try {
      await dispatch(changeBookingStatus({ bookingId, status: newStatus })).unwrap()
      load()
      setSelectedBooking((prev) => prev ? { ...prev, status: newStatus, bookingStatus: newStatus } : prev)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-slate-50/70 p-6 md:p-8 min-h-screen">
      <Breadcrumb />

      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Header ── */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#eef2ff_100%)] px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">TMS – Travel Management</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Car Bookings</h1>
                <p className="mt-1 text-sm text-slate-500">Owner ke saare car bookings ek jagah</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Total: {bookingsList.length}
                </span>
                <button
                  onClick={load}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Alerts ── */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            <AlertTriangle size={16} className="shrink-0" />
            {error}
            <button onClick={() => dispatch(clearCarError())} className="ml-auto text-rose-500 hover:text-rose-800"><X size={16} /></button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" />
            {success}
          </div>
        )}

        {/* ── Search + Filter ── */}
        <section className="sticky top-4 z-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by car, guest, route, or booking ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              Showing {filtered.length}
            </span>
          </div>
        </section>

        {/* ── Table ── */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          {loading && bookingsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-indigo-500 mb-3" />
              <p className="text-sm font-medium text-slate-500">Bookings load ho rahe hain...</p>
            </div>
          ) : !loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Car size={36} className="text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-700">Koi booking nahi mili</p>
              <p className="mt-1 text-sm text-slate-400">Filter change karo ya refresh karo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    {['Booking', 'Car', 'Route', 'Guest', 'Travel Date', 'Price', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((b) => {
                    const status = b.status || b.bookingStatus || 'Pending'
                    const cfg = getStatusConfig(status)
                    return (
                      <tr key={b._id} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-mono text-xs font-bold text-slate-700">{String(b._id || '').slice(-8).toUpperCase()}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(b.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Car size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{b.carName || b.car?.name || 'N/A'}</p>
                              <p className="text-[11px] text-slate-400">{b.carType || b.car?.type || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[130px]">
                              {[b.from || b.pickupLocation, b.to || b.dropLocation].filter(Boolean).join(' → ') || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">{b.guestName || b.user?.name || b.bookedBy?.name || 'N/A'}</p>
                          <p className="text-[11px] text-slate-400">{b.guestMobile || b.user?.mobile || ''}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <CalendarDays size={13} className="text-slate-400" />
                            {formatDate(b.travelDate || b.journeyDate)}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(b.totalPrice || b.price)}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600 ml-auto"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ── Detail Modal ── */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </div>
  )
}

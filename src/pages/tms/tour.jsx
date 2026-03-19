import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Map,
  CalendarDays,
  X,
  MapIcon,
  Compass,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  User,
  Users,
} from "lucide-react";
import { fetchFilteredTours, getVehicleSeats, createBooking } from "../../../redux/slices/tms/travel/tour/tour";
import { getGST } from "../../../redux/slices/admin/gst";
import { selectAuth } from "../../../redux/slices/authSlice";

const DEFAULT_FILTERS = {
  q: "",
  city: "",
  themes: "",
  fromWhere: "",
  to: "",
  minPrice: "",
  maxPrice: "",
  minNights: "",
  maxNights: "",
  minRating: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const THEMES = [
  "Cultural", "Adventure", "Religious", "Beach", "Heritage",
  "Hill Station", "Wildlife", "Honeymoon", "Family", "Group", "Vacation"
];

/* =========================================================
   HELPERS
========================================================= */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

/* =========================================================
   TOUR SKELETON
========================================================= */
const TourSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm animate-pulse">
    <div className="h-56 w-full bg-slate-100" />
    <div className="flex flex-1 flex-col p-5 gap-4">
      <div className="h-5 w-3/4 rounded-md bg-slate-100" />
      <div className="h-4 w-1/2 rounded-md bg-slate-100" />
      <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
        <div className="h-8 w-24 rounded-md bg-slate-100" />
        <div className="h-8 w-16 rounded-md bg-slate-100" />
      </div>
    </div>
  </div>
);

/* =========================================================
   TOUR CARD
========================================================= */
const TourCard = ({ tour, onBookNow }) => {
  const navigate = useNavigate();
  const imageUrl = tour?.images?.[0] || null;
  
  // Safely handle themes array or string
  let primaryTheme = "";
  if (tour.themes) {
    if (typeof tour.themes === 'string') {
      primaryTheme = tour.themes.split(',')[0].trim();
    } else if (Array.isArray(tour.themes)) {
      primaryTheme = tour.themes[0]?.trim();
    }
  }

  // Fallback for price (check tour.price, then vehicle pricePerSeat)
  const displayPrice = tour.price || tour.vehicles?.[0]?.pricePerSeat || 0;

  return (
    <div
      onClick={() => navigate(`/tours/${tour._id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      {/* Image Header */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={tour.travelAgencyName || "Tour Package"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <MapIcon size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
          {primaryTheme && (
            <span className="rounded bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
              {primaryTheme}
            </span>
          )}
        </div>
        {tour.starRating > 0 && (
          <div className="absolute right-3 top-3">
            <span className="flex items-center gap-1 rounded bg-black/50 backdrop-blur-md px-2 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
              {tour.starRating} <Star size={12} className="fill-amber-400 text-amber-400" />
            </span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-extrabold leading-tight text-white line-clamp-2">
            {tour.travelAgencyName || "Unnamed Travel Agency"}
          </h3>
          <p className="text-[11px] font-medium text-slate-300 mt-1 flex items-center gap-1.5 line-clamp-1">
             <Building2 size={12}/> {tour.agencyEmail || "Agency Partner"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Location & Places */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-start gap-2 text-[12px] font-semibold text-slate-600">
            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 leading-snug">
              {[tour.city, tour.state, tour.country].filter(Boolean).join(", ") || "Location N/A"}
            </span>
          </div>
          {tour.visitngPlaces && (
            <div className="flex items-start gap-2 text-[12px] font-semibold text-slate-600">
              <Compass size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">{tour.visitngPlaces}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Starting From</span>
              <span className="text-xl font-extrabold text-slate-900 leading-none">
                {formatCurrency(displayPrice)}
              </span>
            </div>
            {(tour.nights !== undefined || tour.days !== undefined) && (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                <CalendarDays size={14} className="text-slate-400 shrink-0" />
                {tour.nights ?? 0}N / {tour.days ?? (tour.nights ? tour.nights + 1 : 0)}D
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBookNow(tour); }}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FILTER SIDEBAR
========================================================= */
const FilterSection = ({ title, children }) => (
  <div className="border-b border-slate-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const FilterSidebar = ({ filters, onChange, onApply, onReset }) => {
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 placeholder:font-normal";

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        <FilterSection title="Route Planner">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-slate-500">Departure From</label>
              <input type="text" placeholder="e.g. Delhi" value={filters.fromWhere} onChange={(e) => onChange("fromWhere", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-slate-500">Destination To</label>
              <input type="text" placeholder="e.g. Manali" value={filters.to} onChange={(e) => onChange("to", e.target.value)} className={inputClass} />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Operating City">
          <input type="text" placeholder="e.g. Mumbai" value={filters.city} onChange={(e) => onChange("city", e.target.value)} className={inputClass} />
        </FilterSection>

        <FilterSection title="Pricing Budget (₹)">
          <div className="flex items-center gap-3">
            <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => onChange("minPrice", e.target.value)} className={inputClass} min={0} />
            <span className="text-slate-300 font-bold">-</span>
            <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => onChange("maxPrice", e.target.value)} className={inputClass} min={0} />
          </div>
        </FilterSection>

        <FilterSection title="Tour Duration (Nights)">
          <div className="flex items-center gap-3">
            <input type="number" placeholder="Min" value={filters.minNights} onChange={(e) => onChange("minNights", e.target.value)} className={inputClass} min={1} />
            <span className="text-slate-300 font-bold">-</span>
            <input type="number" placeholder="Max" value={filters.maxNights} onChange={(e) => onChange("maxNights", e.target.value)} className={inputClass} min={1} />
          </div>
        </FilterSection>

        <FilterSection title="Minimum Rating">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => onChange("minRating", filters.minRating == r ? "" : r)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  Number(filters.minRating) === r
                    ? "bg-white text-amber-500 shadow-sm border border-slate-200/60"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {r}★
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Tour Themes">
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => {
              const active = (filters.themes || "").split(",").map((t) => t.trim()).includes(theme);
              const toggle = () => {
                const current = (filters.themes || "").split(",").map((t) => t.trim()).filter(Boolean);
                const updated = active ? current.filter((t) => t !== theme) : [...current, theme];
                onChange("themes", updated.join(","));
              };
              return (
                <button
                  key={theme}
                  onClick={toggle}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    active
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </FilterSection>

      </div>

      {/* Sidebar Footer Actions */}
      <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/50 p-5">
        <button onClick={onReset} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors focus:outline-none">
          Reset
        </button>
        <button onClick={onApply} className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   PAGINATION
========================================================= */
const Pagination = ({ page, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="mt-10 flex justify-center items-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-10 px-4 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span className="text-slate-400 text-xs px-1">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                p === page
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-10 px-4 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */
const EmptyState = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-24 text-center shadow-sm">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
      <Map size={32} />
    </div>
    <h3 className="text-xl font-extrabold text-slate-900">No Tours Found</h3>
    <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm">
      We couldn't find any packages matching your current criteria. Try adjusting your filters.
    </p>
    <button onClick={onReset} className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800">
      Clear All Filters
    </button>
  </div>
);

/* =========================================================
   TOUR SEAT GRID
========================================================= */
const TourSeatGrid = ({ seats, selectedSeatMap, onToggleSeat, totalNeeded }) => {
  if (!seats.length) return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
      <Users size={24} className="text-slate-300 mb-2" />
      <p className="text-xs font-semibold text-slate-400">No seats configured for this vehicle.</p>
    </div>
  );
  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5">
        {seats.map((seat, i) => {
          const key = String(seat.seatNumber || seat.number || i + 1);
          const isBooked   = seat.isBooked || seat.booked;
          const isSelected = selectedSeatMap.has(key);
          const canSelect  = !isBooked && (isSelected || selectedSeatMap.size < totalNeeded);
          let cls = 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-pointer hover:border-indigo-300';
          if (isBooked)        cls = 'border-rose-200 bg-rose-50 text-rose-400 cursor-not-allowed opacity-60';
          else if (isSelected) cls = 'border-indigo-500 bg-indigo-600 text-white ring-2 ring-indigo-300 cursor-pointer';
          else if (!canSelect) cls = 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed';
          return (
            <button key={key} type="button"
              disabled={isBooked || (!isSelected && !canSelect)}
              onClick={() => !isBooked && canSelect && onToggleSeat(seat)}
              className={`flex h-10 w-full flex-col items-center justify-center rounded-lg border-2 text-[10px] font-bold transition-all ${cls}`}
            >
              <span>{key}</span>
              {isBooked   && <span className="text-[7px] leading-none">Taken</span>}
              {isSelected && <span className="text-[7px] leading-none">✓</span>}
              {seat.seatType && !isBooked && !isSelected && <span className="text-[7px] leading-none opacity-60">{String(seat.seatType).slice(0, 5)}</span>}
            </button>
          );
        })}
      </div>
      {selectedSeatMap.size > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from(selectedSeatMap.entries()).map(([k, s]) => (
            <span key={k} className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              Seat {k}{s.seatPrice ? ` · ₹${s.seatPrice}` : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   BOOKING MODAL
========================================================= */
const BookingModal = ({ tour, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const { vehicleSeats, loading: tourLoading } = useSelector((s) => s.tour);
  const { selectedGST, loading: gstLoading } = useSelector((s) => s.adminGst);

  const vehicles = useMemo(() => tour?.vehicles || [], [tour]);
  const seats = useMemo(() => {
    if (!vehicleSeats) return [];
    if (Array.isArray(vehicleSeats)) return vehicleSeats;
    return vehicleSeats?.seats || vehicleSeats?.seatConfig || vehicleSeats?.data || [];
  }, [vehicleSeats]);

  const [selectedVehicle, setSelectedVehicle] = useState(() => vehicles[0] || null);
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedSeatMap, setSelectedSeatMap] = useState(new Map());
  const [passengers, setPassengers] = useState([{ type: 'adult', fullName: '', gender: '', dateOfBirth: '' }]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const totalPassengers = adults + children;
  const hasSeats = seats.length > 0;
  const totalSteps = hasSeats ? 4 : 3;
  const stepLabels = hasSeats
    ? ['Setup', 'Seats', 'Passengers', 'Confirm']
    : ['Setup', 'Passengers', 'Confirm'];
  const currentLabel = stepLabels[step - 1];

  // Fetch GST (type: Tour) once on modal open
  useEffect(() => {
    dispatch(getGST({ type: 'Tour' }));
  }, [dispatch]);

  // Fetch seats whenever vehicle changes
  useEffect(() => {
    if (selectedVehicle?._id && tour?._id) {
      dispatch(getVehicleSeats({ tourId: tour._id, vehicleId: selectedVehicle._id }));
      setSelectedSeatMap(new Map());
    }
  }, [dispatch, selectedVehicle?._id, tour?._id]);

  // Keep passengers array length in sync with passenger count
  useEffect(() => {
    setPassengers(
      Array.from({ length: totalPassengers }, (_, i) => ({
        type:        i < adults ? 'adult' : 'child',
        fullName:    '',
        gender:      '',
        dateOfBirth: '',
      }))
    );
  }, [adults, children, totalPassengers]);

  const updatePassenger = (idx, field, val) =>
    setPassengers((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: val }; return next; });

  const handleToggleSeat = (seat) => {
    const key = String(seat.seatNumber || seat.number || seat._id || '');
    setSelectedSeatMap((prev) => {
      const next = new Map(prev);
      next.has(key) ? next.delete(key) : next.set(key, seat);
      return next;
    });
  };

  // Pricing
  const seatTotal   = Array.from(selectedSeatMap.values()).reduce((s, seat) => s + Number(seat.seatPrice || 0), 0);
  const basePrice   = hasSeats ? seatTotal : Number(selectedVehicle?.pricePerSeat || tour.price || 0);
  const gstRate     = Number(selectedGST?.gstRate || selectedGST?.rate || selectedGST?.percentage || 0);
  const taxAmount   = Math.round(basePrice * gstRate / 100);
  const totalAmount = basePrice + taxAmount;

  const canProceed = (() => {
    if (currentLabel === 'Setup')      return !!selectedVehicle && adults >= 1;
    if (currentLabel === 'Seats')      return selectedSeatMap.size === totalPassengers;
    if (currentLabel === 'Passengers') return passengers.every((p) => p.fullName.trim() !== '');
    return true; // Confirm step
  })();

  const handleNext = () => canProceed && step < totalSteps && setStep((s) => s + 1);
  const handleBack = () => step > 1 && setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!user) { setBookingError('Please log in to continue.'); return; }
    setSubmitting(true);
    setBookingError('');
    try {
      const toArr = (v) => Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const payload = {
        userId:           user._id || user.id || user.userId || '',
        tourId:           tour._id,
        vehicleId:        selectedVehicle?._id || '',
        seats:            Array.from(selectedSeatMap.keys()),
        numberOfAdults:   adults,
        numberOfChildren: children,
        passengers:       passengers.map((p) => ({
          type:     p.type,
          fullName: p.fullName.trim(),
          ...(p.gender      && { gender: p.gender }),
          ...(p.dateOfBirth && { dateOfBirth: p.dateOfBirth }),
        })),
        status:            'pending',
        // tour snapshot
        travelAgencyName:  tour.travelAgencyName,
        agencyPhone:       tour.agencyPhone,
        agencyEmail:       tour.agencyEmail,
        visitngPlaces:     tour.visitngPlaces,
        country:           tour.country,
        state:             tour.state,
        city:              tour.city,
        themes:            Array.isArray(tour.themes) ? tour.themes.join(', ') : (tour.themes || ''),
        tourStartDate:     tour.tourStartDate,
        nights:            tour.nights,
        days:              tour.days,
        from:              tour.from,
        to:                tour.to,
        // pricing
        basePrice,
        seatPrice:         seatTotal,
        tax:               taxAmount,
        discount:          0,
        totalAmount,
        // policy
        amenities:          tour.amenities || [],
        inclusion:          toArr(tour.inclusion),
        exclusion:          toArr(tour.exclusion),
        termsAndConditions: tour.termsAndConditions,
        dayWise:            tour.dayWise || [],
        bookingSource:      'dashboard',
      };
      const result = await dispatch(createBooking(payload)).unwrap();
      setBookingResult(result?.data || result);
    } catch (err) {
      setBookingError(typeof err === 'string' ? err : err?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Inline counter widget
  const Counter = ({ label, sub, value, onDec, onInc, min = 0 }) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onDec} disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30">
          <Minus size={13} />
        </button>
        <span className="w-5 text-center text-base font-bold text-slate-900">{value}</span>
        <button type="button" onClick={onInc}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={!submitting ? onClose : undefined} />

      {/* Modal sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center sm:inset-0 sm:items-center sm:p-4">
        <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" style={{ maxHeight: '92vh' }}>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-indigo-600">Book Tour</p>
              <h2 className="truncate text-base font-extrabold text-slate-900">{tour.travelAgencyName || 'Tour Package'}</h2>
            </div>
            {!submitting && !bookingResult && (
              <button onClick={onClose}
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Step indicator */}
          {!bookingResult && (
            <div className="flex shrink-0 items-center px-5 py-3">
              {stepLabels.map((label, i) => (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step > i + 1 ? <Check size={11} /> : i + 1}
                    </div>
                    <span className={`hidden sm:block text-[10px] font-bold transition-colors ${step === i + 1 ? 'text-indigo-700' : 'text-slate-400'}`}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 mx-1.5 h-0.5 rounded-full transition-colors ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">

            {/* ── SUCCESS ── */}
            {bookingResult && (
              <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Booking Confirmed!</h3>
                  <p className="mt-1 text-xs text-slate-500">Your tour booking has been placed successfully.</p>
                </div>
                {(bookingResult.bookingCode || bookingResult._id) && (
                  <div className="w-full rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Booking Code</p>
                    <p className="mt-0.5 font-mono text-xl font-extrabold tracking-widest text-indigo-700">
                      {bookingResult.bookingCode || bookingResult._id}
                    </p>
                  </div>
                )}
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Base / Seat Price</span>
                    <span className="font-bold text-slate-900">{formatCurrency(bookingResult.basePrice ?? basePrice)}</span>
                  </div>
                  {gstRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">GST ({gstRate}%)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(bookingResult.tax ?? taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2.5">
                    <span className="text-sm font-bold text-slate-800">Total Paid</span>
                    <span className="text-xl font-extrabold text-indigo-600">{formatCurrency(bookingResult.totalAmount ?? totalAmount)}</span>
                  </div>
                </div>
                <button onClick={onClose} className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                  Done
                </button>
              </div>
            )}

            {/* ── STEP: Setup ── */}
            {!bookingResult && currentLabel === 'Setup' && (
              <div className="space-y-4 pt-2">
                {/* Tour summary pill */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                    {tour.images?.[0]
                      ? <img src={tour.images[0]} alt="" className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center"><MapIcon size={20} className="text-slate-400" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{tour.travelAgencyName}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{[tour.city, tour.state, tour.country].filter(Boolean).join(', ')}</p>
                    <p className="text-[11px] text-slate-500">{tour.nights ?? 0}N / {tour.days ?? 0}D</p>
                    <p className="mt-0.5 text-sm font-extrabold text-indigo-700">{formatCurrency(tour.price || 0)}</p>
                  </div>
                </div>

                {/* Vehicle selector (only when multiple vehicles) */}
                {vehicles.length > 1 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Select Vehicle</p>
                    <div className="space-y-2">
                      {vehicles.map((v) => (
                        <button key={v._id} type="button" onClick={() => setSelectedVehicle(v)}
                          className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${selectedVehicle?._id === v._id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{v.vehicleType || 'Vehicle'}{v.vehicleNumber ? ` · ${v.vehicleNumber}` : ''}</p>
                            <p className="text-[11px] text-slate-500">{v.sharingType} · {v.seater} seats</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-extrabold text-indigo-600">{formatCurrency(v.pricePerSeat || 0)}</p>
                            <p className="text-[10px] text-slate-400">per seat</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {vehicles.length === 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                    No vehicles configured for this tour package.
                  </div>
                )}

                {/* Passenger counts */}
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Passengers</p>
                  <div className="space-y-2">
                    <Counter label="Adults" sub="12+ years" value={adults} min={1}
                      onDec={() => setAdults((v) => Math.max(1, v - 1))}
                      onInc={() => setAdults((v) => v + 1)} />
                    <Counter label="Children" sub="0–11 years" value={children} min={0}
                      onDec={() => setChildren((v) => Math.max(0, v - 1))}
                      onInc={() => setChildren((v) => v + 1)} />
                  </div>
                </div>

                {/* GST note */}
                {gstLoading
                  ? <div className="flex items-center gap-2 text-[11px] text-slate-400"><Loader2 size={12} className="animate-spin" /> Fetching GST...</div>
                  : selectedGST && gstRate > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[11px] font-semibold text-emerald-700">
                      <Check size={12} /> GST at {gstRate}% will be applied on the total amount.
                    </div>
                  )
                }
              </div>
            )}

            {/* ── STEP: Seats ── */}
            {!bookingResult && currentLabel === 'Seats' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Choose Seats</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${selectedSeatMap.size === totalPassengers ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {selectedSeatMap.size} / {totalPassengers} selected
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] font-semibold text-slate-500">
                  {[['Available', 'border-emerald-400 bg-emerald-50'], ['Selected', 'border-indigo-500 bg-indigo-600'], ['Taken', 'border-rose-300 bg-rose-50/80']].map(([l, cls]) => (
                    <span key={l} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded border-2 ${cls}`} />{l}</span>
                  ))}
                </div>
                {tourLoading
                  ? <div className="flex flex-col items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500 mb-2" /><p className="text-xs text-slate-400">Loading seat layout...</p></div>
                  : <TourSeatGrid seats={seats} selectedSeatMap={selectedSeatMap} onToggleSeat={handleToggleSeat} totalNeeded={totalPassengers} />
                }
              </div>
            )}

            {/* ── STEP: Passengers ── */}
            {!bookingResult && currentLabel === 'Passengers' && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-bold text-slate-800">Passenger Details</p>
                {passengers.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-slate-400" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Passenger {i + 1} — <span className={p.type === 'adult' ? 'text-indigo-600' : 'text-emerald-600'}>{p.type}</span>
                      </span>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Full Name <span className="text-rose-400">*</span></label>
                      <input value={p.fullName} onChange={(e) => updatePassenger(i, 'fullName', e.target.value)} placeholder="Full name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white placeholder:font-normal placeholder:text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Gender</label>
                        <select value={p.gender} onChange={(e) => updatePassenger(i, 'gender', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Date of Birth</label>
                        <input type="date" value={p.dateOfBirth} onChange={(e) => updatePassenger(i, 'dateOfBirth', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP: Confirm ── */}
            {!bookingResult && currentLabel === 'Confirm' && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-slate-800">Booking Summary</p>

                {/* Tour snapshot */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  {[
                    ['Tour', tour.travelAgencyName],
                    ['Destination', [tour.city, tour.state].filter(Boolean).join(', ')],
                    ['Duration', `${tour.nights ?? 0}N / ${tour.days ?? 0}D`],
                    ['Passengers', `${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? ` + ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`],
                    selectedSeatMap.size > 0 ? ['Seats', Array.from(selectedSeatMap.keys()).join(', ')] : null,
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[12px]">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{hasSeats ? 'Seat Price' : 'Base Price'}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(basePrice)}</span>
                  </div>
                  {gstRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">GST — Tour ({gstRate}%)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-sm font-bold text-slate-800">Total Payable</span>
                    <span className="text-xl font-extrabold text-indigo-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    <AlertTriangle size={15} className="shrink-0" /> {bookingError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!bookingResult && (
            <div className="flex shrink-0 items-center gap-3 border-t border-slate-100 bg-white/90 px-5 py-4">
              {step > 1 && (
                <button type="button" onClick={handleBack} disabled={submitting}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40">
                  <ChevronLeft size={15} /> Back
                </button>
              )}
              {step < totalSteps ? (
                <button type="button" onClick={handleNext} disabled={!canProceed}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-40">
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting || !canProceed}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50">
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /> Booking...</>
                    : <><Check size={15} /> Confirm Booking</>
                  }
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* =========================================================
   MAIN PAGE — default export
========================================================= */

// Memoized selector to prevent unnecessary re-renders
const selectTourState = createSelector(
  [(state) => state.tour],
  (tour) => ({
    tours: tour?.tours || [],
    filterMeta: tour?.filterMeta || null,
    loading: tour?.loading || false,
    error: tour?.error || null,
  })
);

export default function Tour() {
  const dispatch = useDispatch();
  
  // Use memoized selector
  const { tours: rawTours, filterMeta, loading, error } = useSelector(selectTourState);
  
  // Normalize tours array (in case your backend puts it inside a 'data' array during fetchFilteredTours)
  const tours = useMemo(() => Array.isArray(rawTours) ? rawTours : (rawTours?.data || []), [rawTours]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingTour, setBookingTour] = useState(null);

  const buildParams = useCallback((f = {}, pg = 1) => {
    const params = { ...f, page: pg, limit: 12 };
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
  }, []);

  useEffect(() => {
    dispatch(fetchFilteredTours(buildParams(appliedFilters, page)));
  }, [dispatch, appliedFilters, page, buildParams]);

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
    setSidebarOpen(false);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
    setSidebarOpen(false);
  };

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  // Safe Math calculation for totalPages using your API's pagination block
  const totalPages = filterMeta?.limit ? Math.ceil((filterMeta.total || 0) / filterMeta.limit) : 1;
  const isFiltered = JSON.stringify(appliedFilters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* ── Top Header ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">Travel Management</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Explore Tours</h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500">Discover and manage curated tour itineraries and pricing.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box - Header Level */}
            <div className="relative flex-1 sm:w-72 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-colors hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex h-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start gap-8 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-[300px] overflow-hidden rounded-r-2xl border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300
            lg:sticky lg:top-8 lg:z-0 lg:h-[calc(100vh-64px)] lg:w-72 lg:rounded-2xl lg:border lg:shadow-sm
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="lg:hidden flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">Advanced Filters</h2>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900">
              <X size={18} />
            </button>
          </div>
          <FilterSidebar filters={filters} onChange={handleFilterChange} onApply={handleApply} onReset={handleReset} />
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* Action Bar (Stats & Sort) */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3 px-2">
              <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 border border-indigo-100/50">
                {filterMeta ? `${filterMeta.total || 0} Tours Found` : "0 Tours"}
              </div>
              {isFiltered && (
                <button onClick={handleReset} className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-56 group shrink-0">
              <select
                value={`${filters.sortBy}|${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("|");
                  setFilters((p) => ({ ...p, sortBy, sortOrder }));
                  setAppliedFilters((p) => ({ ...p, sortBy, sortOrder }));
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-white transition-colors"
              >
                <option value="createdAt|desc">Sort: Newest First</option>
                <option value="createdAt|asc">Sort: Oldest First</option>
                <option value="price|asc">Price: Low to High</option>
                <option value="price|desc">Price: High to Low</option>
                <option value="starRating|desc">Rating: Highest First</option>
                <option value="nights|asc">Duration: Shortest First</option>
                <option value="nights|desc">Duration: Longest First</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 shadow-sm">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {/* Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <TourSkeleton key={i} />)}
            </div>
          ) : tours.length === 0 ? (
            <EmptyState onReset={handleReset} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {tours.map((tour) => (
                  <TourCard key={tour._id} tour={tour} onBookNow={setBookingTour} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
              )}
            </>
          )}
        </main>

      </div>
      {bookingTour && <BookingModal tour={bookingTour} onClose={() => setBookingTour(null)} />}
    </div>
  );
}
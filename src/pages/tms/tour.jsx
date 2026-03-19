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
  ChevronDown
} from "lucide-react";
// Ensure this import path matches your project structure
import { fetchFilteredTours } from "../../../redux/slices/tms/travel/tour/tour";

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
const TourCard = ({ tour }) => {
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
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
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
                  <TourCard key={tour._id} tour={tour} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
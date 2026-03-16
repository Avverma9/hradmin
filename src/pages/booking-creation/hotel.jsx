import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Building2,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Star,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/breadcrumb'
import { getAllHotels } from '../../../redux/slices/admin/hotel'
import { getSelectedGuest, saveSelectedHotel } from './storage'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const getHotelList = (payload) => {
  if (Array.isArray(payload))           return payload
  if (Array.isArray(payload?.data))     return payload.data
  if (Array.isArray(payload?.hotels))   return payload.hotels
  if (Array.isArray(payload?.items))    return payload.items
  return []
}

const normalizeAmenityList = (amenities) => {
  if (!amenities) return []

  if (Array.isArray(amenities)) {
    return amenities.flatMap((item) => {
      if (typeof item === 'string' || typeof item === 'number') return [String(item)]
      if (Array.isArray(item)) return item.map((x) => String(x)).filter(Boolean)
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item.amenities)) return normalizeAmenityList(item.amenities)
        if (typeof item.name === 'string') return [item.name]
        if (typeof item.amenity === 'string') return [item.amenity]
        if (typeof item.label === 'string') return [item.label]
        // Fallback: use any string values inside object
        return Object.values(item).filter((v) => typeof v === 'string')
      }
      return []
    }).filter(Boolean)
  }

  if (typeof amenities === 'object' && amenities !== null) {
    if (Array.isArray(amenities.amenities)) return normalizeAmenityList(amenities.amenities)
    if (Array.isArray(amenities.list)) return normalizeAmenityList(amenities.list)
  }

  return []
}

const normalizeHotel = (hotel) => {
  // Starting price from pricing object or first room
  const startingPrice =
    hotel?.pricing?.startingFrom ||
    hotel?.pricing?.lowestBasePrice ||
    (Array.isArray(hotel?.rooms) && hotel.rooms[0]?.price) ||
    0

  const startingPriceWithGST =
    hotel?.pricing?.startingFromWithGST ||
    (Array.isArray(hotel?.rooms) && hotel.rooms[0]?.price) ||
    0

  // Amenities from nested amenities object
  const amenitiesList = normalizeAmenityList(hotel?.amenities || hotel?.amenities?.amenities || hotel)

  return {
    id:                   hotel?._id || hotel?.hotelId || hotel?.id || '',
    hotelId:              hotel?.hotelId || hotel?._id || hotel?.id || 'N/A',
    hotelName:            hotel?.hotelName || hotel?.name || 'Unnamed Hotel',
    city:                 hotel?.city || hotel?.hotelCity || hotel?.destination || 'Unknown',
    state:                hotel?.state || '',
    address:              hotel?.address || hotel?.hotelAddress || hotel?.location || '',
    email:                hotel?.hotelEmail || hotel?.email || '',
    image:                Array.isArray(hotel?.images) ? hotel.images[0] : hotel?.image || '',
    starRating:           Number(hotel?.starRating || 0),
    rating:               Number(hotel?.rating || 0),
    reviewCount:          Number(hotel?.reviewCount || 0),
    category:             hotel?.hotelCategory || hotel?.category || '',
    propertyType:         Array.isArray(hotel?.propertyType)
                            ? hotel.propertyType.join(', ')
                            : hotel?.propertyType || '',
    startingPrice:        Number(startingPrice),
    startingPriceWithGST: Number(startingPriceWithGST),
    gstApplicable:        hotel?.pricing?.gstApplicable ?? false,
    gstNote:              hotel?.pricing?.gstNote || '',
    amenities:            amenitiesList,
    isOffer:              Array.isArray(hotel?.rooms) && hotel.rooms.some((r) => r.isOffer),
    offerName:            Array.isArray(hotel?.rooms)
                            ? hotel.rooms.find((r) => r.isOffer)?.offerName || ''
                            : '',
    raw: hotel,
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarDisplay({ count }) {
  if (!count) return null
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={i < count ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  )
}

function PriceSlider({ min, max, value, onChange }) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{formatCurrency(min)}</span>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
          Up to {formatCurrency(value)}
        </span>
        <span>{formatCurrency(max)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-600 shadow-md"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BookingCreationHotels() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [searchValue,      setSearchValue]      = useState('')
  const [selectedCity,     setSelectedCity]      = useState('All')
  const [selectedHotelId,  setSelectedHotelId]  = useState('')
  const [selectedGuest]                          = useState(() => getSelectedGuest())
  const [maxPriceFilter,   setMaxPriceFilter]   = useState(null)
  const [starFilter,       setStarFilter]       = useState(0)
  const [showFilters,      setShowFilters]      = useState(false)

  const { hotels, loading, error } = useSelector((state) => state.hotel)

  useEffect(() => { dispatch(getAllHotels()) }, [dispatch])

  const normalizedHotels = useMemo(
    () => getHotelList(hotels).map(normalizeHotel),
    [hotels],
  )

  // Price range bounds
  const priceRange = useMemo(() => {
    const prices = normalizedHotels.map((h) => h.startingPrice).filter((p) => p > 0)
    if (!prices.length) return { min: 0, max: 50000 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [normalizedHotels])

  // Init slider to max when hotels load
  useEffect(() => {
    if (maxPriceFilter === null && priceRange.max > 0) {
      setMaxPriceFilter(priceRange.max)
    }
  }, [priceRange.max, maxPriceFilter])

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(normalizedHotels.map((h) => h.city).filter(Boolean))
    return ['All', ...Array.from(uniqueCities).sort((a, b) => a.localeCompare(b))]
  }, [normalizedHotels])

  const filteredHotels = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return normalizedHotels.filter((hotel) => {
      const matchesCity   = selectedCity === 'All' || hotel.city === selectedCity
      const matchesSearch = !query ||
        hotel.hotelName.toLowerCase().includes(query) ||
        hotel.hotelId.toLowerCase().includes(query)   ||
        hotel.city.toLowerCase().includes(query)       ||
        hotel.state.toLowerCase().includes(query)
      const matchesPrice = maxPriceFilter === null || hotel.startingPrice <= maxPriceFilter || hotel.startingPrice === 0
      const matchesStar  = starFilter === 0 || hotel.starRating >= starFilter
      return matchesCity && matchesSearch && matchesPrice && matchesStar
    })
  }, [normalizedHotels, searchValue, selectedCity, maxPriceFilter, starFilter])

  const guestDisplayName = useMemo(() => {
    if (!selectedGuest)               return 'Guest selected'
    if (!selectedGuest.isExistingUser) return selectedGuest.mobile || 'Guest selected'
    return selectedGuest.userName || selectedGuest.mobile || 'Guest selected'
  }, [selectedGuest])

  const handleHotelSelection = (hotel) => {
    saveSelectedHotel(hotel)
    setSelectedHotelId(hotel.id || hotel.hotelId)
    navigate('/booking-creation/book-hotel')
  }

  const hasActiveFilters = starFilter > 0 || (maxPriceFilter !== null && maxPriceFilter < priceRange.max)

  return (
    <div className="bg-slate-50/70 p-6 md:p-8">
      <Breadcrumb />

      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Search + Filter Bar ──────────────────────────────────────────── */}
        <section className="sticky top-4 z-30 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3">

            {/* Row 1: Search + City + Filter toggle */}
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_auto]">
              <label className="relative block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search by hotel name, city, or hotel ID"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                />
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city === 'All' ? 'All Cities' : city}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowFilters((p) => !p)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  showFilters || hasActiveFilters
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal size={15} />
                Filters
                {hasActiveFilters && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                    {(starFilter > 0 ? 1 : 0) + (maxPriceFilter < priceRange.max ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Row 2: Expandable filter panel */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: showFilters ? '120px' : '0px', opacity: showFilters ? 1 : 0 }}
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">

                {/* Price range slider */}
                <div className="flex items-center gap-3 min-w-[260px] flex-1">
                  <p className="text-xs font-bold text-slate-600 shrink-0">Price Range</p>
                  {maxPriceFilter !== null && (
                    <div className="flex-1">
                      <PriceSlider
                        min={priceRange.min}
                        max={priceRange.max}
                        value={maxPriceFilter}
                        onChange={setMaxPriceFilter}
                      />
                    </div>
                  )}
                </div>

                {/* Star rating filter */}
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-600 shrink-0">Stars</p>
                  <div className="flex flex-wrap gap-1">
                    {[0, 1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStarFilter(star)}
                        className={`inline-flex items-center gap-0.5 rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                          starFilter === star
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/50'
                        }`}
                      >
                        {star === 0 ? (
                          'All'
                        ) : (
                          <>
                            {star}
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            +
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                  <div className="flex justify-end ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setStarFilter(0)
                        setMaxPriceFilter(priceRange.max)
                      }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row + Guest pill */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1.5">Total: {normalizedHotels.length}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">Showing: {filteredHotels.length}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  City: {selectedCity === 'All' ? 'All Cities' : selectedCity}
                </span>
                {maxPriceFilter !== null && maxPriceFilter < priceRange.max && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-600">
                    Price ≤ {formatCurrency(maxPriceFilter)}
                  </span>
                )}
                {starFilter > 0 && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                    {starFilter}★ +
                  </span>
                )}
              </div>

              {/* Compact guest pill */}
              {selectedGuest ? (
                <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 pl-1.5 pr-3 py-1">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <UserRound size={12} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[140px] truncate">{guestDisplayName}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/booking-creation')}
                    className="ml-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/booking-creation')}
                  className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                >
                  + Select Guest
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ── Hotel Cards ──────────────────────────────────────────────────── */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && filteredHotels.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
              Loading hotels...
            </div>
          )}

          {!loading && filteredHotels.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <Building2 size={32} className="mx-auto text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">No hotels match this filter</p>
              <p className="mt-2 text-sm text-slate-500">Search ya filter change karo.</p>
            </div>
          )}

          {filteredHotels.map((hotel) => {
            const isSelected = selectedHotelId === (hotel.id || hotel.hotelId)
            return (
              <article
                key={hotel.id || hotel.hotelId}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.10)] ${
                  isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                {/* Image with overlay */}
                <div className="relative h-36 shrink-0 bg-[linear-gradient(135deg,#dbeafe_0%,#eef2ff_45%,#f8fafc_100%)]">
                  {hotel.image ? (
                    <img
                      src={hotel.image}
                      alt={hotel.hotelName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-indigo-400">
                      <Building2 size={28} />
                    </div>
                  )}

                  {/* Dark gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                    {hotel.isOffer && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                        <Tag size={8} />
                        {hotel.offerName || 'Offer'}
                      </span>
                    )}
                    {hotel.category && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                        {hotel.category}
                      </span>
                    )}
                  </div>

                  {/* Star badge top-right */}
                  {hotel.starRating > 0 && (
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-white">{hotel.starRating}</span>
                    </div>
                  )}

                  {/* Bottom overlay: name + location + stars */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-white/60">{hotel.hotelId}</p>
                    <h3 className="truncate text-sm font-bold leading-tight text-white">{hotel.hotelName}</h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={9} className={i < hotel.starRating ? 'fill-amber-400 text-amber-400' : 'text-white/30'} />
                        ))}
                      </div>
                      {hotel.city && (
                        <span className="flex items-center gap-1 text-[10px] text-white/80">
                          <MapPin size={9} />
                          {[hotel.city, hotel.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-2 p-3">

                  {/* Amenities */}
                  {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => {
                        const label =
                          typeof amenity === 'string' || typeof amenity === 'number'
                            ? String(amenity)
                            : typeof amenity === 'object' && amenity !== null
                              ? amenity.name || amenity.amenity || amenity.label || JSON.stringify(amenity)
                              : ''
                        if (!label) return null
                        return (
                          <span
                            key={`${hotel.id || hotel.hotelId}-amenity-${index}`}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600"
                          >
                            {label}
                          </span>
                        )
                      })}
                      {hotel.amenities.length > 3 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pricing + CTA row */}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div>
                      {hotel.startingPrice > 0 ? (
                        <>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">From</p>
                          <p className="text-sm font-extrabold text-slate-900">{formatCurrency(hotel.startingPrice)}</p>
                          <p className="text-[9px] text-slate-400">
                            /night{hotel.gstApplicable ? ' + GST' : ''}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs font-semibold text-slate-400">Price on request</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!selectedGuest}
                      onClick={() => handleHotelSelection(hotel)}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Book'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}

export default BookingCreationHotels

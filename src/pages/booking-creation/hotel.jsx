import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Building2, MapPin, RefreshCw, Search, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/breadcrumb'
import { getAllHotels } from '../../../redux/slices/admin/hotel'
import { getSelectedGuest, saveSelectedHotel } from './storage'

const getHotelList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.hotels)) {
    return payload.hotels
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

const normalizeHotel = (hotel) => ({
  id: hotel?._id || hotel?.hotelId || hotel?.id || '',
  hotelId: hotel?.hotelId || hotel?._id || hotel?.id || 'N/A',
  hotelName: hotel?.hotelName || hotel?.name || 'Unnamed Hotel',
  city: hotel?.city || hotel?.hotelCity || hotel?.destination || 'Unknown',
  state: hotel?.state || '',
  address: hotel?.address || hotel?.hotelAddress || hotel?.location || '',
  email: hotel?.hotelEmail || hotel?.email || '',
  image: Array.isArray(hotel?.images) ? hotel.images[0] : hotel?.image || '',
  raw: hotel,
})

function BookingCreationHotels() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [selectedGuest] = useState(() => getSelectedGuest())
  const { hotels, loading, error } = useSelector((state) => state.hotel)

  useEffect(() => {
    dispatch(getAllHotels())
  }, [dispatch])

  const normalizedHotels = useMemo(
    () => getHotelList(hotels).map(normalizeHotel),
    [hotels],
  )

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(
      normalizedHotels.map((hotel) => hotel.city).filter(Boolean),
    )

    return ['All', ...Array.from(uniqueCities).sort((firstCity, secondCity) => firstCity.localeCompare(secondCity))]
  }, [normalizedHotels])

  const filteredHotels = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return normalizedHotels.filter((hotel) => {
      const matchesCity = selectedCity === 'All' || hotel.city === selectedCity
      const matchesSearch =
        !query ||
        hotel.hotelName.toLowerCase().includes(query) ||
        hotel.hotelId.toLowerCase().includes(query) ||
        hotel.city.toLowerCase().includes(query) ||
        hotel.state.toLowerCase().includes(query)

      return matchesCity && matchesSearch
    })
  }, [normalizedHotels, searchValue, selectedCity])

  const guestDisplayName = useMemo(() => {
    if (!selectedGuest) {
      return 'Guest selected'
    }

    if (!selectedGuest.isExistingUser) {
      return selectedGuest.mobile || 'Guest selected'
    }

    return selectedGuest.userName || selectedGuest.mobile || 'Guest selected'
  }, [selectedGuest])

  const handleHotelSelection = (hotel) => {
    saveSelectedHotel(hotel)
    setSelectedHotelId(hotel.id || hotel.hotelId)
    navigate('/booking-creation/book-hotel')
  }

  return (
    <div className="bg-slate-50/70 p-6 md:p-8">
      <Breadcrumb />

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#eef2ff_100%)] px-6 py-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">
                  Booking Creation
                </p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Choose a hotel for your guest
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Search hotels, filter by city, and continue the booking flow from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(getAllHotels())}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Refreshing...' : 'Refresh Hotels'}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            {selectedGuest ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                      Guest
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {guestDisplayName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedGuest.mobile || 'No mobile'}{selectedGuest.email ? ` · ${selectedGuest.email}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/booking-creation')}
                  className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Change Guest
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                Guest details nahi mile. Pehle guest select karke aao.
                <button
                  type="button"
                  onClick={() => navigate('/booking-creation')}
                  className="ml-3 font-semibold text-amber-900 underline"
                >
                  Go to Find User
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative block">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by hotel name, city, or hotel ID"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Cities' : city}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              Total Hotels: {normalizedHotels.length}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              Showing: {filteredHotels.length}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              City Filter: {selectedCity === 'All' ? 'All Cities' : selectedCity}
            </span>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && filteredHotels.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
              Loading hotels...
            </div>
          )}

          {!loading && filteredHotels.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <Building2 size={32} className="mx-auto text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">
                No hotels match this filter
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Search text ya city filter change karke phir try karo.
              </p>
            </div>
          )}

          {filteredHotels.map((hotel) => (
            <article
              key={hotel.id || hotel.hotelId}
              className={`group overflow-hidden rounded-[28px] border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${
                selectedHotelId === (hotel.id || hotel.hotelId)
                  ? 'border-indigo-400 ring-2 ring-indigo-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="h-40 bg-[linear-gradient(135deg,#dbeafe_0%,#eef2ff_45%,#f8fafc_100%)]">
                {hotel.image ? (
                  <img
                    src={hotel.image}
                    alt={hotel.hotelName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-indigo-500">
                    <Building2 size={34} />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Hotel ID {hotel.hotelId}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {hotel.hotelName}
                  </h3>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-slate-400" />
                    <span>{[hotel.city, hotel.state].filter(Boolean).join(', ')}</span>
                  </div>
                  <p className="line-clamp-2 text-slate-500">
                    {hotel.address || 'Address not available'}
                  </p>
                  <p className="text-slate-500">
                    {hotel.email || 'Email not available'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!selectedGuest}
                  onClick={() => handleHotelSelection(hotel)}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedHotelId === (hotel.id || hotel.hotelId) ? 'Hotel Selected' : 'Book Hotel'}
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default BookingCreationHotels

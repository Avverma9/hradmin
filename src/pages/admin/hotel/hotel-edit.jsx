import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  PencilLine,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import Breadcrumb from '../../../components/breadcrumb'
import {
  clearHotelUpdateStatus,
  clearRoomStatus,
  createRoomToHotel,
  deleteRoomById,
  getHotelById,
  getRoomsByHotelEmail,
  updateHotel,
  updateRoom,
} from '../../../../redux/slices/admin/hotel'

const createHotelForm = (hotel) => {
  const basicInfo = hotel?.basicInfo || {}
  const location = basicInfo?.location || {}
  const contacts = basicInfo?.contacts || {}
  const propertyType = Array.isArray(basicInfo?.propertyType)
    ? basicInfo.propertyType
    : basicInfo?.propertyType
      ? [basicInfo.propertyType]
      : Array.isArray(hotel?.propertyType)
        ? hotel.propertyType
        : hotel?.propertyType
          ? [hotel.propertyType]
          : []

  return {
    hotelName: basicInfo?.name || hotel?.hotelName || '',
    city: location?.city || hotel?.city || '',
    state: location?.state || hotel?.state || '',
    address: location?.address || hotel?.address || '',
    pinCode: location?.pinCode || hotel?.pinCode || '',
    starRating: String(basicInfo?.starRating || hotel?.starRating || ''),
    propertyType: propertyType.join(', '),
    hotelEmail: contacts?.email || hotel?.hotelEmail || hotel?.email || '',
    phone: contacts?.phone || hotel?.phone || '',
    owner: basicInfo?.owner || hotel?.owner || '',
    description: basicInfo?.description || hotel?.description || '',
    onFront: Boolean(hotel?.onFront),
    isAccepted: Boolean(hotel?.isAccepted),
  }
}

const normalizeRoom = (room, index = 0) => ({
  id: room?._id || room?.roomId || room?.id || `room-${index + 1}`,
  roomId: room?.roomId || room?._id || room?.id || `room-${index + 1}`,
  name: room?.name || room?.type || `Room ${index + 1}`,
  type: room?.type || room?.name || `Room ${index + 1}`,
  bedType: room?.bedType || room?.bedTypes || room?.beds || '',
  basePrice: String(room?.pricing?.basePrice ?? room?.basePrice ?? room?.pricing?.finalPrice ?? room?.price ?? ''),
  finalPrice: String(room?.pricing?.finalPrice ?? room?.price ?? room?.pricing?.basePrice ?? room?.basePrice ?? ''),
  totalRooms: String(room?.inventory?.total ?? room?.totalRooms ?? room?.countRooms ?? ''),
  availableRooms: String(room?.inventory?.available ?? room?.availableRooms ?? room?.availableCount ?? ''),
  description: room?.description || room?.about || '',
  amenities: Array.isArray(room?.amenities) ? room.amenities.join(', ') : '',
  images: Array.isArray(room?.images) ? room.images.join(', ') : '',
  isOffer: Boolean(room?.features?.isOffer || room?.isOffer),
  offerText: room?.features?.offerText || room?.offerText || room?.offerName || '',
})

const createEmptyRoomForm = () => ({
  roomId: '',
  type: '',
  bedType: '',
  basePrice: '',
  finalPrice: '',
  totalRooms: '',
  availableRooms: '',
  description: '',
  amenities: '',
  images: '',
  isOffer: false,
  offerText: '',
})

const buildHotelPayload = (form) => ({
  hotelName: form.hotelName.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  address: form.address.trim(),
  pinCode: form.pinCode.trim(),
  starRating: form.starRating.trim(),
  propertyType: form.propertyType.split(',').map((item) => item.trim()).filter(Boolean),
  hotelEmail: form.hotelEmail.trim(),
  phone: form.phone.trim(),
  owner: form.owner.trim(),
  description: form.description.trim(),
  onFront: form.onFront,
  isAccepted: form.isAccepted,
})

const buildRoomPayload = (form, hotelForm) => {
  const basePrice = Number(form.basePrice || 0)
  const finalPrice = Number(form.finalPrice || form.basePrice || 0)
  const totalRooms = Number(form.totalRooms || 0)
  const availableRooms = Number(form.availableRooms || 0)
  const amenities = form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
  const images = form.images.split(',').map((item) => item.trim()).filter(Boolean)

  return {
    hotelEmail: hotelForm.hotelEmail.trim(),
    roomId: form.roomId.trim(),
    name: form.type.trim(),
    type: form.type.trim(),
    roomType: form.type.trim(),
    bedType: form.bedType.trim(),
    bedTypes: form.bedType.trim(),
    price: finalPrice,
    basePrice,
    description: form.description.trim(),
    amenities,
    images,
    isOffer: form.isOffer,
    offerText: form.offerText.trim(),
    offerName: form.offerText.trim(),
    pricing: {
      basePrice,
      finalPrice,
      displayPrice: finalPrice ? `Rs ${finalPrice}` : '',
    },
    inventory: {
      total: totalRooms,
      available: availableRooms,
    },
    totalRooms,
    availableRooms,
    features: {
      isOffer: form.isOffer,
      offerText: form.offerText.trim(),
    },
  }
}

function HotelEditPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const {
    selectedHotel,
    rooms,
    loading,
    updating,
    roomsLoading,
    roomSaving,
    error,
    updateSuccess,
    roomSuccess,
  } = useSelector((state) => state.hotel)

  const [hotelForm, setHotelForm] = useState(() => createHotelForm(null))
  const [roomForm, setRoomForm] = useState(createEmptyRoomForm)
  const [editingRoomId, setEditingRoomId] = useState('')

  const hotel = selectedHotel?.data || selectedHotel
  const displayHotelId = hotel?.hotelId || id
  const hotelImage = hotel?.basicInfo?.images?.[0] || hotel?.images?.[0] || ''
  const listPath =
    location.state?.from ||
    (location.pathname.startsWith('/your-hotels') ? '/your-hotels' : '/hotels')

  useEffect(() => {
    if (id) {
      dispatch(getHotelById(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!hotel) return
    setHotelForm(createHotelForm(hotel))
  }, [hotel])

  useEffect(() => {
    const hotelEmail = hotel?.basicInfo?.contacts?.email || hotel?.hotelEmail || hotel?.email
    if (hotelEmail) {
      dispatch(getRoomsByHotelEmail(hotelEmail))
    }
  }, [dispatch, hotel?.basicInfo?.contacts?.email, hotel?.email, hotel?.hotelEmail])

  useEffect(() => {
    if (!updateSuccess) return undefined
    const timeout = setTimeout(() => dispatch(clearHotelUpdateStatus()), 2800)
    return () => clearTimeout(timeout)
  }, [dispatch, updateSuccess])

  useEffect(() => {
    if (!roomSuccess) return undefined
    const timeout = setTimeout(() => dispatch(clearRoomStatus()), 2800)
    return () => clearTimeout(timeout)
  }, [dispatch, roomSuccess])

  const normalizedRooms = useMemo(() => rooms.map((room, index) => normalizeRoom(room, index)), [rooms])

  const saveHotel = async (event) => {
    event.preventDefault()
    await dispatch(
      updateHotel({
        hotelId: displayHotelId,
        hotelData: buildHotelPayload(hotelForm),
      }),
    ).unwrap()
  }

  const setHotelField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setHotelForm((current) => ({ ...current, [key]: value }))
  }

  const setRoomField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setRoomForm((current) => ({ ...current, [key]: value }))
  }

  const resetRoomEditor = () => {
    setEditingRoomId('')
    setRoomForm(createEmptyRoomForm())
    dispatch(clearRoomStatus())
  }

  const handleRoomEdit = (room) => {
    setEditingRoomId(room.id)
    setRoomForm({
      roomId: room.roomId,
      type: room.type,
      bedType: room.bedType,
      basePrice: room.basePrice,
      finalPrice: room.finalPrice,
      totalRooms: room.totalRooms,
      availableRooms: room.availableRooms,
      description: room.description,
      amenities: room.amenities,
      images: room.images,
      isOffer: room.isOffer,
      offerText: room.offerText,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveRoom = async (event) => {
    event.preventDefault()
    const payload = buildRoomPayload(roomForm, hotelForm)

    if (editingRoomId) {
      await dispatch(updateRoom({ roomId: editingRoomId, roomData: payload })).unwrap()
    } else {
      await dispatch(createRoomToHotel(payload)).unwrap()
    }

    if (hotelForm.hotelEmail.trim()) {
      await dispatch(getRoomsByHotelEmail(hotelForm.hotelEmail.trim()))
    }

    resetRoomEditor()
  }

  const handleRoomDelete = async (roomId) => {
    if (!roomId) return
    if (!window.confirm('Delete this room from the hotel?')) return

    await dispatch(deleteRoomById(roomId)).unwrap()

    if (hotelForm.hotelEmail.trim()) {
      await dispatch(getRoomsByHotelEmail(hotelForm.hotelEmail.trim()))
    }

    if (editingRoomId === roomId) {
      resetRoomEditor()
    }
  }

  if (loading && !hotel) {
    return (
      <div className="mx-auto max-w-7xl bg-stone-50 px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="rounded-[28px] border border-stone-200 bg-white px-6 py-16 text-center text-sm font-semibold text-stone-500">
          Loading edit hotel workspace...
        </div>
      </div>
    )
  }

  if (error && !hotel) {
    return (
      <div className="mx-auto max-w-7xl bg-stone-50 px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-16 text-center text-sm font-semibold text-rose-700">
          {error}
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="mx-auto max-w-7xl bg-stone-50 px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="rounded-[28px] border border-stone-200 bg-white px-6 py-16 text-center text-sm font-semibold text-stone-500">
          Hotel not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl bg-stone-50 px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Hotel Workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">Edit Hotel & Rooms</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-stone-500">
              Hotel profile update, room add, room update, aur room delete sab ek hi clean page me manage hoga.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`${listPath}/${displayHotelId}`, { state: { from: listPath } })}
            className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            View Details
          </button>
          <button
            type="submit"
            form="hotel-edit-form"
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-stone-900/10 transition hover:bg-stone-800 disabled:pointer-events-none disabled:opacity-50"
          >
            {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Hotel
          </button>
        </div>
      </div>

      {(updateSuccess || roomSuccess || (error && hotel)) && (
        <div className="mb-6 grid gap-3">
          {updateSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {updateSuccess}
            </div>
          )}
          {roomSuccess && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              {roomSuccess}
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form
          id="hotel-edit-form"
          onSubmit={saveHotel}
          className="overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50"
        >
          <div className="border-b border-stone-100 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f5f5f4_100%)] px-6 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-stone-400">Hotel Profile</p>
                <h2 className="mt-2 text-2xl font-black text-stone-900">{hotelForm.hotelName || 'Unnamed Hotel'}</h2>
                <p className="mt-2 text-sm font-semibold text-stone-500">
                  ID: {displayHotelId} {hotelForm.city ? `• ${hotelForm.city}` : ''}
                </p>
              </div>
              {hotelImage ? (
                <img
                  src={hotelImage}
                  alt={hotelForm.hotelName || 'Hotel'}
                  className="h-24 w-32 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-32 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                  <Building2 size={28} />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Hotel Name</span>
              <input required value={hotelForm.hotelName} onChange={setHotelField('hotelName')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Hotel Email</span>
              <input required type="email" value={hotelForm.hotelEmail} onChange={setHotelField('hotelEmail')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">City</span>
              <input required value={hotelForm.city} onChange={setHotelField('city')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">State</span>
              <input required value={hotelForm.state} onChange={setHotelField('state')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Address</span>
              <input value={hotelForm.address} onChange={setHotelField('address')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Pin Code</span>
              <input value={hotelForm.pinCode} onChange={setHotelField('pinCode')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Star Rating</span>
              <input type="number" min="0" max="5" value={hotelForm.starRating} onChange={setHotelField('starRating')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Owner</span>
              <input value={hotelForm.owner} onChange={setHotelField('owner')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Phone</span>
              <input value={hotelForm.phone} onChange={setHotelField('phone')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Property Type</span>
              <input value={hotelForm.propertyType} onChange={setHotelField('propertyType')} placeholder="Hotel, Resort" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Description</span>
              <textarea value={hotelForm.description} onChange={setHotelField('description')} rows={5} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
          </div>

          <div className="border-t border-stone-100 px-6 py-5">
            <div className="flex flex-wrap gap-4 rounded-3xl bg-stone-50 px-4 py-4">
              <label className="inline-flex items-center gap-3 text-sm font-bold text-stone-700">
                <input type="checkbox" checked={hotelForm.onFront} onChange={setHotelField('onFront')} className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500" />
                Show on front
              </label>
              <label className="inline-flex items-center gap-3 text-sm font-bold text-stone-700">
                <input type="checkbox" checked={hotelForm.isAccepted} onChange={setHotelField('isAccepted')} className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500" />
                Accepted
              </label>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-lg shadow-stone-200/40">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">Location</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-lg font-black text-stone-900">{hotelForm.city || 'Unknown City'}</p>
                  <p className="text-sm font-medium text-stone-500">{hotelForm.state || 'State pending'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-lg shadow-stone-200/40">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">Rooms</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <BedDouble size={20} />
                </div>
                <div>
                  <p className="text-lg font-black text-stone-900">{normalizedRooms.length}</p>
                  <p className="text-sm font-medium text-stone-500">Managed room entries</p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-lg shadow-stone-200/40">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">Status</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-lg font-black text-stone-900">
                    {hotelForm.isAccepted ? 'Accepted' : 'Pending'}
                  </p>
                  <p className="text-sm font-medium text-stone-500">
                    {hotelForm.onFront ? 'Front listed' : 'Hidden from front'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={saveRoom}
            className="overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50"
          >
            <div className="border-b border-stone-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-blue-600">Room Manager</p>
                  <h2 className="mt-2 text-xl font-black text-stone-900">
                    {editingRoomId ? 'Update Room' : 'Add New Room'}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-stone-500">
                    Room create aur update dono isi inline editor se honge.
                  </p>
                </div>
                {editingRoomId && (
                  <button
                    type="button"
                    onClick={resetRoomEditor}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Room ID</span>
                  <input required value={roomForm.roomId} onChange={setRoomField('roomId')} placeholder="ROOM-101" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Room Type</span>
                  <input required value={roomForm.type} onChange={setRoomField('type')} placeholder="Deluxe Room" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Bed Type</span>
                  <input value={roomForm.bedType} onChange={setRoomField('bedType')} placeholder="King Bed" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Base Price</span>
                  <input type="number" min="0" value={roomForm.basePrice} onChange={setRoomField('basePrice')} placeholder="2500" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Final Price</span>
                  <input type="number" min="0" value={roomForm.finalPrice} onChange={setRoomField('finalPrice')} placeholder="2999" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Total Rooms</span>
                  <input type="number" min="0" value={roomForm.totalRooms} onChange={setRoomField('totalRooms')} placeholder="10" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Available Rooms</span>
                  <input type="number" min="0" value={roomForm.availableRooms} onChange={setRoomField('availableRooms')} placeholder="6" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Amenities</span>
                  <input value={roomForm.amenities} onChange={setRoomField('amenities')} placeholder="WiFi, AC, Breakfast" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Image URLs</span>
                  <input value={roomForm.images} onChange={setRoomField('images')} placeholder="https://..., https://..." className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Description</span>
                  <textarea value={roomForm.description} onChange={setRoomField('description')} rows={4} placeholder="Room summary for guests and ops team." className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                </label>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-3 text-sm font-bold text-stone-700">
                    <input type="checkbox" checked={roomForm.isOffer} onChange={setRoomField('isOffer')} className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500" />
                    Offer active
                  </label>
                  <input value={roomForm.offerText} onChange={setRoomField('offerText')} placeholder="Flat 20% off" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:max-w-xs" />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetRoomEditor}
                  className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={roomSaving || !hotelForm.hotelEmail.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  {roomSaving ? <Loader2 size={16} className="animate-spin" /> : editingRoomId ? <PencilLine size={16} /> : <Plus size={16} />}
                  {editingRoomId ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-xl shadow-stone-200/50">
        <div className="flex flex-col gap-3 border-b border-stone-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-stone-400">Room Inventory</p>
            <h2 className="mt-2 text-2xl font-black text-stone-900">Existing Rooms</h2>
          </div>
          {roomsLoading && (
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
              <Loader2 size={14} className="animate-spin" />
              Syncing rooms...
            </div>
          )}
        </div>

        {normalizedRooms.length === 0 && !roomsLoading ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <BedDouble size={28} />
            </div>
            <h3 className="mt-5 text-lg font-black text-stone-900">No rooms found</h3>
            <p className="mt-2 text-sm font-medium text-stone-500">
              Is hotel ke liye abhi room list empty hai. Upar se pehla room add kar sakte ho.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 px-6 py-6">
            {normalizedRooms.map((room) => (
              <div
                key={room.id}
                className={`rounded-[26px] border px-5 py-5 transition ${
                  editingRoomId === room.id
                    ? 'border-blue-300 bg-blue-50/70 shadow-lg shadow-blue-100/60'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-white'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                        {room.roomId}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">
                        {room.type}
                      </span>
                      {room.isOffer && room.offerText && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          {room.offerText}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-stone-900">{room.name}</h3>
                      <p className="mt-1 text-sm font-medium text-stone-500">
                        {room.bedType || 'Bed type not added'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm font-semibold text-stone-600">
                      <span className="rounded-2xl bg-white px-3 py-2">Base: Rs {room.basePrice || '0'}</span>
                      <span className="rounded-2xl bg-white px-3 py-2">Final: Rs {room.finalPrice || '0'}</span>
                      <span className="rounded-2xl bg-white px-3 py-2">
                        Inventory: {room.availableRooms || '0'} / {room.totalRooms || '0'}
                      </span>
                    </div>
                    {room.description && (
                      <p className="max-w-3xl text-sm leading-6 text-stone-600">{room.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoomEdit(room)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-100"
                    >
                      <PencilLine size={15} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoomDelete(room.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelEditPage


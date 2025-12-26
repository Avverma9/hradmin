import { useEffect, useState } from "react";
import {
  FaBus,
  FaFileInvoice,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaRupeeSign,
  FaSun,
  FaUserFriends,
} from "react-icons/fa";
import {
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoCloseCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getBookings } from "../redux/reducers/tour/tour";

// --- Helpers ---
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// --- Sub-Components ---

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoClose className="text-2xl text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="text-blue-600 mt-1 text-lg">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
        {label}
      </p>
      <p className="font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
    <span className="text-blue-600">{icon}</span> {title}
  </h3>
);

// --- Main Modal Content ---
const BookingDetailsContent = ({ booking }) => {
  const isCustom = booking.customizable;

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded border border-indigo-100 uppercase tracking-wide">
              {booking.themes}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {booking.travelAgencyName}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <FaMapMarkerAlt /> {booking.city}, {booking.state}
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(booking.status)} capitalize`}
            >
              {booking.status}
            </span>
            <div className="text-right">
              <p className="text-xs text-gray-500">Booking Code</p>
              <p className="font-mono font-bold text-lg text-gray-800 tracking-wider">
                {booking.bookingCode}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-blue-200/50">
          <DetailRow
            icon={<FaRegCalendarAlt />}
            label={isCustom ? "Travel From" : "Start Date"}
            value={formatDate(booking.from || booking.tourStartDate)}
          />
          <DetailRow
            icon={<IoTimeOutline />}
            label={isCustom ? "Travel To" : "End Date"}
            value={formatDate(booking.to)}
          />
          <DetailRow
            icon={<FaSun />}
            label="Duration"
            value={`${booking.days || 0} Days / ${booking.nights || 0} Nights`}
          />
          <DetailRow
            icon={<FaBus />}
            label="Seats"
            value={booking.seats?.join(", ") || "N/A"}
          />
        </div>
      </div>

      {/* 2. Passengers & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionHeader icon={<FaUserFriends />} title="Travellers" />
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {booking.numberOfAdults}
              </p>
              <p className="text-sm text-gray-500">Adults</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {booking.numberOfChildren}
              </p>
              <p className="text-sm text-gray-500">Children</p>
            </div>
          </div>
          {/* Show full passenger list if available */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2">
              PASSENGER DETAILS
            </p>
            {booking.passengers?.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700 mb-1"
              >
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="capitalize">
                  {p.type}{" "}
                  {p.dateOfBirth ? `(DOB: ${formatDate(p.dateOfBirth)})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-gray-50/50">
          <SectionHeader icon={<FaRupeeSign />} title="Payment Summary" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Base Price</span>
              <span>{formatCurrency(booking.basePrice)}</span>
            </div>
            {booking.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(booking.tax)}</span>
              </div>
            )}
            {booking.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(booking.discount)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg">
                Total Paid
              </span>
              <span className="font-bold text-blue-600 text-xl">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Itinerary & Inclusions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Itinerary */}
        <div className="lg:col-span-2">
          <SectionHeader
            icon={<FaMapMarkerAlt />}
            title="Itinerary Highlights"
          />
          <div className="relative border-l-2 border-blue-100 ml-3 space-y-6 pb-2">
            {booking.dayWise?.map((day) => (
              <div key={day._id} className="ml-6 relative">
                <span className="absolute -left-[31px] top-0 bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-white">
                  {day.day}
                </span>
                <h4 className="font-bold text-gray-800 text-sm">
                  {day.description.split("\r\n")[0]}
                </h4>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line leading-relaxed">
                  {day.description.split("\r\n").slice(1).join("\n")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Inclusions/Exclusions */}
        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <h4 className="font-bold text-green-800 flex items-center gap-2 mb-3">
              <IoCheckmarkCircleOutline className="text-xl" /> Inclusions
            </h4>
            <ul className="space-y-2">
              {booking.inclusion?.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-green-900 flex items-start gap-2"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3">
              <IoCloseCircleOutline className="text-xl" /> Exclusions
            </h4>
            <ul className="space-y-2">
              {booking.exclusion?.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-red-900 flex items-start gap-2"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Terms (Markdown style parsing from string) */}
      {booking.termsAndConditions?.cancellation && (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <SectionHeader icon={<FaFileInvoice />} title="Cancellation Policy" />
          <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-100">
            {booking.termsAndConditions.cancellation}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function TourBookings() {
  const dispatch = useDispatch();
  // Safe selector with default values
  const {
    bookings = [],
    loading,
    error,
  } = useSelector(
    (state) => state.tour || { bookings: [], loading: false, error: null }
  );

  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  if (loading)
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 flex justify-center pt-20">
        <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          Error: {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          My Tour Bookings
        </h1>

        {!bookings?.length ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <IoAlertCircleOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-600">
              No bookings found
            </h3>
            <p className="text-slate-400">
              Your planned trips will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingsTMS.map((booking) => (
              <div
                key={booking._id}
                onClick={() => setSelectedBooking(booking)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      #{booking.bookingCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {booking.travelAgencyName}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                    <FaMapMarkerAlt className="text-blue-500 text-xs" />{" "}
                    {booking.city}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">
                        Travel Date
                      </p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {formatDate(booking.from || booking.tourStartDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">
                        Duration
                      </p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {booking.days}D / {booking.nights}N
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <FaBus className="text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      Seats:
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {booking.seats?.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Total Amount</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
      >
        {selectedBooking && <BookingDetailsContent booking={selectedBooking} />}
      </Modal>
    </div>
  );
}

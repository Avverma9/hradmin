import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaBus,
  FaCalendarDay,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaDownload,
  FaUserFriends,
  FaSearch,
  FaRoute,
  FaChevronRight,
  FaRupeeSign,
} from "react-icons/fa";
import {
  IoClose,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTimer,
} from "react-icons/io5";
import { getBookings } from "../redux/reducers/tour/tour"; // Check path

// --- Helpers ---
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
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

const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return { color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <IoCheckmarkCircle /> };
    case "pending":
      return { color: "text-amber-600 bg-amber-50 border-amber-200", icon: <IoTimer /> };
    case "cancelled":
      return { color: "text-rose-600 bg-rose-50 border-rose-200", icon: <IoAlertCircle /> };
    default:
      return { color: "text-gray-600 bg-gray-50 border-gray-200", icon: <IoTimer /> };
  }
};

// --- Sub-Components ---

const FilterTabs = ({ currentFilter, setFilter }) => {
  const tabs = ["All", "Confirmed", "Pending", "Cancelled"];
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setFilter(tab.toLowerCase())}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
            currentFilter === tab.toLowerCase()
              ? "bg-gray-900 text-white border-gray-900 shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const BookingCard = ({ booking, onClick }) => {
  const statusConfig = getStatusConfig(booking.status);
  
  // Logic to determine travel dates based on API response structure
  const travelDate = booking.from || booking.tourStartDate;
  // Calculate end date if 'to' is missing, using 'days' (optional logic)
  const endDate = booking.to || (travelDate && new Date(new Date(travelDate).getTime() + (booking.days * 24 * 60 * 60 * 1000)).toISOString()); 

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top Status Bar */}
      <div className={`h-1.5 w-full ${booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-400'}`} />

      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Agency & ID */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
              {statusConfig.icon} {booking.status}
            </span>
            <span className="text-xs text-gray-400 font-mono">#{booking.bookingCode?.slice(-6) || 'N/A'}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {booking.travelAgencyName}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <FaBus className="text-gray-400" size={12} />
            <span className="truncate">{booking.seats?.join(", ") || 'No Seats'}</span>
          </div>
        </div>

        {/* Middle: Route & Date (Timeline Visual) */}
        <div className="md:col-span-5 flex items-center justify-between gap-4 border-t md:border-t-0 md:border-l md:border-r border-dashed border-gray-200 pt-4 md:pt-0 md:px-6">
          <div className="text-left">
            <p className="text-xs text-gray-400 uppercase font-bold">Start Date</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(travelDate)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{booking.city || 'Origin'}</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="w-full h-px bg-gray-300 relative">
                <div className="absolute left-0 -top-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="absolute right-0 -top-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="absolute left-1/2 -top-3 bg-gray-100 p-1 rounded-full text-gray-400">
                    <FaBus size={10} />
                </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 font-medium">{booking.days} Days / {booking.nights} Nights</span>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold">End Date</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(endDate)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{booking.state || 'Dest.'}</p>
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="md:col-span-3 flex flex-row md:flex-col justify-between items-center md:items-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-dashed border-gray-200">
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Total Paid</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(booking.totalAmount)}</p>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
            View Details <FaChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const travelDate = booking.from || booking.tourStartDate;
  // Calculate end date based on duration provided in API
  let endDateCalc = booking.to;
  if(!endDateCalc && travelDate) {
      const start = new Date(travelDate);
      start.setDate(start.getDate() + (booking.days || 0));
      endDateCalc = start.toISOString();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Ticket Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header Pattern */}
        <div className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shrink-0" />
        
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaRoute className="text-blue-500" /> Booking Details
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Agency Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{booking.travelAgencyName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <FaMapMarkerAlt size={12} /> {booking.city}, {booking.state}
              </p>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStatusConfig(booking.status).color}`}>
              {booking.status}
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Agency Phone</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <FaPhoneAlt className="text-blue-400" size={12}/> {booking.agencyPhone || "N/A"}
                </p>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Agency Email</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 truncate" title={booking.agencyEmail}>
                    <FaEnvelope className="text-blue-400" size={12}/> {booking.agencyEmail || "N/A"}
                </p>
             </div>
          </div>

          {/* Journey Details */}
          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 mb-6 relative overflow-hidden">
             <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white rounded-full border border-blue-100"></div>
             <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white rounded-full border border-blue-100"></div>

             <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-xs text-blue-400 font-bold uppercase">Start Date</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(travelDate)}</p>
                    <p className="text-xs text-gray-500 mt-1">{booking.city}</p>
                </div>
                <div className="text-center px-4 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-mono tracking-widest">--- {booking.days}D / {booking.nights}N ---</span>
                    <FaBus className="text-blue-500 my-1" />
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-400 font-bold uppercase">End Date</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(endDateCalc)}</p>
                    <p className="text-xs text-gray-500 mt-1">{booking.state}</p>
                </div>
             </div>
             
             <div className="border-t border-dashed border-blue-200 my-3"></div>

             <div className="flex justify-between text-sm">
                <div>
                    <span className="text-gray-500 block text-xs">Passengers</span>
                    <span className="font-bold text-gray-800">
                        {booking.numberOfAdults} Adults, {booking.numberOfChildren} Kids
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-gray-500 block text-xs">Seat Numbers</span>
                    <span className="font-bold text-gray-800">{booking.seats?.join(", ") || "N/A"}</span>
                </div>
             </div>
          </div>

          {/* Passenger List Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Passenger List</h4>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold">
                        <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2 text-right">Gender</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {booking.passengers && booking.passengers.length > 0 ? (
                            booking.passengers.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 text-gray-800 font-medium">{p.fullName}</td>
                                    <td className="px-4 py-2 text-gray-500 capitalize">{p.type}</td>
                                    <td className="px-4 py-2 text-gray-500 text-right capitalize">{p.gender}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="px-4 py-2 text-center text-gray-400">No details available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg shadow-gray-200">
             <div>
                <p className="text-xs text-gray-400">Total Amount</p>
                <p className="text-xs text-gray-500 mt-0.5">Incl. base price {formatCurrency(booking.basePrice)} + seat charges</p>
             </div>
             <div className="text-xl font-bold">
                {formatCurrency(booking.totalAmount)}
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            {/* Download Logic can be added here later */}
            <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                <FaDownload size={14} /> Invoice
            </button>
            <button 
                onClick={onClose}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
        <FaBus className="text-gray-300 text-3xl" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
    <p className="text-gray-500 max-w-xs mx-auto mb-6">You haven't booked any trips yet. Your next adventure is just a click away!</p>
    {/* Optional: Add a Link to home or search page if routing is available */}
  </div>
);

// --- Main Page ---

export default function TourBookings() {
  const dispatch = useDispatch();
  const { bookings = [], loading, error } = useSelector(
    (state) => state.tour || { bookings: [], loading: false, error: null }
  );

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  // Filter Logic - Using safe array check
  const filteredBookings = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : (bookings?.data || []);
    if (!Array.isArray(safeBookings)) return [];
    
    if (filter === "all") return safeBookings;
    return safeBookings.filter((b) => b.status?.toLowerCase() === filter);
  }, [bookings, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4 font-medium animate-pulse">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-sm w-full">
           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
             <IoAlertCircle size={24} />
           </div>
           <h3 className="text-lg font-bold text-gray-800">Error Loading Data</h3>
           <p className="text-gray-500 mt-2 text-sm">{typeof error === 'string' ? error : 'An unexpected error occurred.'}</p>
           <button onClick={() => window.location.reload()} className="mt-6 w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
             Try Again
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">My Journeys</h1>
                <p className="text-gray-500 mt-1">Manage and track your travel history</p>
            </div>
            <div className="relative hidden md:block">
                <input 
                    type="text" 
                    placeholder="Search trips..." 
                    className="pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
                <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={14} />
            </div>
        </div>

        {/* Tabs */}
        <FilterTabs currentFilter={filter} setFilter={setFilter} />

        {/* List */}
        {filteredBookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard 
                key={booking._id} 
                booking={booking} 
                onClick={() => setSelectedBooking(booking)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <TicketModal 
        booking={selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
      />
    </div>
  );
}
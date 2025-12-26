import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaBus,
  FaCalendarAlt,
  FaChevronRight,
  FaCopy,
  FaFileInvoice,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRupeeSign,
  FaUserFriends,
} from "react-icons/fa";
import {
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoTimeOutline,
} from "react-icons/io5";
import { getBookings } from "../redux/reducers/tour/tour"; // Ensure this path is correct

// --- Helper Functions ---
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

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-green-50 text-green-700 border-green-200 ring-green-100";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200 ring-red-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-100";
  }
};

const calculateDuration = (from, to) => {
  if (!from || !to) return "N/A";
  const diffTime = Math.abs(new Date(to) - new Date(from));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  // Adding 1 because usually travel includes the start day
  return `${diffDays + 1} Days`; 
};

// --- Components ---

const BookingListItem = ({ booking, onClick }) => {
  const duration = calculateDuration(booking.from, booking.to);
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden mb-4"
    >
      <div className="flex flex-col md:flex-row">
        
        {/* Left Side: Status & ID Stripe (Mobile) or Border (Desktop) */}
        <div className={`h-1.5 md:h-auto md:w-1.5 ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-amber-400' : 'bg-gray-300'}`}></div>

        <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Col 1: Agency & Route */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyles(booking.status)}`}>
                {booking.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">#{booking.bookingCode}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
              {booking.travelAgencyName}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <FaMapMarkerAlt className="text-blue-500" />
              <span>{booking.city}, {booking.state}</span>
            </div>
          </div>

          {/* Col 2: Dates & Seats */}
          <div className="md:col-span-4 space-y-3 border-l-0 md:border-l border-gray-100 md:pl-6">
             <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <FaCalendarAlt size={14} />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Travel Dates</p>
                    <p className="text-sm font-bold text-gray-800">
                        {formatDate(booking.from)} <span className="text-gray-400 font-normal">to</span> {formatDate(booking.to)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{duration}</p>
                </div>
             </div>
             <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-500 font-medium">
                    <FaBus className="inline mr-1"/> Seats: {booking.seats.join(", ")}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-500 font-medium">
                    <FaUserFriends className="inline mr-1"/> {booking.numberOfAdults + booking.numberOfChildren} Pax
                </span>
             </div>
          </div>

          {/* Col 3: Price & Action */}
          <div className="md:col-span-4 flex flex-row md:flex-col justify-between md:items-end items-center gap-2 border-l-0 md:border-l border-gray-100 md:pl-6">
            <div className="md:text-right">
                <p className="text-xs text-gray-400 mb-0.5">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                </p>
                {booking.status === 'pending' && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1 animate-pulse">
                        Payment Pending
                    </p>
                )}
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-1 duration-200">
                View Details <FaChevronRight size={12} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <IoClose size={24} />
          </button>
        </div>
        <div className="p-0 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const BookingDetailView = ({ booking }) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Toast logic could go here
    };

    return (
        <div className="text-sm text-gray-700">
            {/* 1. Header with Agency & Status */}
            <div className="p-6 bg-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{booking.travelAgencyName}</h1>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <FaMapMarkerAlt className="text-gray-400" /> 
                            {booking.city}, {booking.state}, {booking.country}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-gray-600">
                           {booking.agencyPhone && (
                               <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs">
                                   <FaPhoneAlt size={10} /> {booking.agencyPhone}
                               </span>
                           )}
                           {booking.agencyEmail && (
                               <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs">
                                   <FaFileInvoice size={10} /> {booking.agencyEmail}
                               </span>
                           )}
                        </div>
                    </div>
                    <div className="text-right">
                         <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mb-2 ${getStatusStyles(booking.status)}`}>
                             {booking.status}
                         </div>
                    </div>
                </div>

                {/* 2. Key Info Grid */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                     <div>
                         <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Booking ID</p>
                         <div className="flex items-center gap-2 mt-1">
                             <span className="font-mono font-bold text-gray-800 text-base">{booking.bookingCode}</span>
                             <button onClick={() => copyToClipboard(booking.bookingCode)} className="text-gray-400 hover:text-blue-600" title="Copy ID">
                                 <FaCopy size={12}/>
                             </button>
                         </div>
                     </div>
                     <div>
                         <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Amount</p>
                         <p className="font-bold text-blue-700 text-lg mt-1">{formatCurrency(booking.totalAmount)}</p>
                     </div>
                     <div>
                         <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Start Date</p>
                         <p className="font-medium text-gray-800 mt-1">{formatDate(booking.from || booking.tourStartDate)}</p>
                     </div>
                     <div>
                         <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">End Date</p>
                         <p className="font-medium text-gray-800 mt-1">{formatDate(booking.to)}</p>
                     </div>
                </div>
            </div>

            <div className="h-2 bg-gray-100 border-t border-b border-gray-200"></div>

            {/* 3. Passenger & Seat Info */}
            <div className="p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <FaUserFriends className="text-blue-500"/> Passenger Details
                </h3>
                
                {/* Primary Contact */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs text-blue-600 font-bold uppercase">Primary Contact</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{booking.primaryMobile}</p>
                    </div>
                    <FaPhoneAlt className="text-blue-300" />
                </div>

                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Passenger Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Gender</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {booking.passengers && booking.passengers.length > 0 ? (
                                booking.passengers.map((p, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.fullName || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 capitalize">{p.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 capitalize">{p.gender}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">No passenger details available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-bold">Booked Seats:</span> 
                    <div className="flex gap-1">
                        {booking.seats.map(seat => (
                            <span key={seat} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                                {seat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

             {/* 4. Payment Breakdown (Optional, derived from JSON keys) */}
             <div className="p-6 bg-gray-50 border-t border-gray-200">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment Breakdown</h3>
                 <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-600">Base Price</span>
                         <span className="font-medium text-gray-900">{formatCurrency(booking.basePrice)}</span>
                     </div>
                     {booking.tax > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Taxes</span>
                            <span className="font-medium text-gray-900">{formatCurrency(booking.tax)}</span>
                        </div>
                     )}
                     <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                         <span className="font-bold text-gray-800">Total Paid</span>
                         <span className="font-bold text-blue-700">{formatCurrency(booking.totalAmount)}</span>
                     </div>
                 </div>
             </div>
        </div>
    );
};


// --- Main Page ---

export default function TourBookings() {
  const dispatch = useDispatch();
  const { bookings = [], loading, error } = useSelector(
    (state) => state.tour || { bookings: [], loading: false, error: null }
  );

  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm font-medium">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center pt-20">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-center max-w-md">
           <IoAlertCircleOutline className="mx-auto text-4xl text-red-500 mb-2" />
           <h3 className="text-lg font-bold text-gray-800">Something went wrong</h3>
           <p className="text-gray-500 mt-1">{error}</p>
           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
               Retry
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Tour Bookings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your upcoming and past trips</p>
            </div>
            {/* Optional: Add Filter/Sort buttons here */}
        </div>

        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBus className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No bookings found</h3>
            <p className="text-gray-500 mt-1 max-w-xs mx-auto">You haven't made any tour bookings yet. Start exploring tours to book your next adventure.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingListItem 
                key={booking._id} 
                booking={booking} 
                onClick={() => setSelectedBooking(booking)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
      >
        {selectedBooking && <BookingDetailView booking={selectedBooking} />}
      </Modal>
    </div>
  );
}
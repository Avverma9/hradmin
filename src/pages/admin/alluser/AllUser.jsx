import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../../../redux/slices/user";
import { 
  Search, Edit2, Save, X, ChevronLeft, Download, 
  Calendar, Tag, AlertCircle, Eye, Trash2, Shield,
  CheckCircle, XCircle, Clock
} from "lucide-react";

export const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);
  
  const [viewState, setViewState] = useState("list");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeTab, setActiveTab] = useState("bookings");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const usersList = Array.isArray(users) ? users : users?.data || [];
  
  const filteredUsers = usersList.filter(user => 
    user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile?.includes(searchQuery) ||
    user._id?.includes(searchQuery)
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setProfileForm({
      userName: user.userName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      address: user.address || "",
    });
    setViewState("detail");
    setActiveTab("bookings");
    setIsEditingProfile(false);
  };

  const handleBackToList = () => {
    setViewState("list");
    setSelectedUser(null);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const mockBookings = [
    { id: "BK-7829", type: "Hotel", date: "2026-03-25", status: "Confirmed", amount: "₹4,500" },
    { id: "BK-7830", type: "Tour", date: "2026-04-10", status: "Pending", amount: "₹12,000" },
    { id: "BK-7110", type: "Taxi", date: "2026-02-14", status: "Completed", amount: "₹850" },
  ];

  const mockCoupons = [
    { code: "SUMMER50", discount: "50%", status: "Active", expiry: "2026-06-30" },
    { code: "WELCOME10", discount: "10%", status: "Used", expiry: "2025-12-31" },
  ];

  const mockComplaints = [
    { id: "CMP-092", subject: "Delayed Check-in", date: "2026-03-20", status: "Working" },
    { id: "CMP-045", subject: "Refund Not Received", date: "2026-01-15", status: "Closed" },
  ];

  const renderStatusBadge = (status) => {
    const styles = {
      Confirmed: "bg-green-100 text-green-700",
      Completed: "bg-green-100 text-green-700",
      Active: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Working: "bg-blue-100 text-blue-700",
      Closed: "bg-slate-100 text-slate-700",
      Used: "bg-slate-100 text-slate-700",
      Cancelled: "bg-red-100 text-red-700",
      Failed: "bg-red-100 text-red-700"
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || "bg-slate-100 text-slate-700"}`}>
        {status}
      </span>
    );
  };

  if (viewState === "detail" && selectedUser) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToList}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" /> Back to Users
          </button>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
              <Download size={16} className="mr-2" /> Export Data
            </button>
            <button className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
              <Shield size={16} className="mr-2" /> Block User
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
              <p className="text-xs text-slate-500 mt-1">User ID: {selectedUser._id}</p>
            </div>
            {!isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Edit2 size={14} className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  <X size={14} className="mr-1" /> Cancel
                </button>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  <Save size={14} className="mr-1" /> Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              {isEditingProfile ? (
                <input 
                  type="text" name="userName" value={profileForm.userName} onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-transparent">{profileForm.userName || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              {isEditingProfile ? (
                <input 
                  type="email" name="email" value={profileForm.email} onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-transparent">{profileForm.email || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
              {isEditingProfile ? (
                <input 
                  type="text" name="mobile" value={profileForm.mobile} onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-transparent">{profileForm.mobile || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
              {isEditingProfile ? (
                <input 
                  type="text" name="address" value={profileForm.address} onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-transparent">{profileForm.address || "N/A"}</p>
              )}
            </div>
          </div>
          {isEditingProfile && (
             <div className="mt-6 pt-6 border-t border-slate-100">
               <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                 Send Password Reset Link
               </button>
             </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${activeTab === "bookings" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <Calendar size={16} /> Bookings
            </button>
            <button 
              onClick={() => setActiveTab("coupons")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${activeTab === "coupons" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <Tag size={16} /> Coupons
            </button>
            <button 
              onClick={() => setActiveTab("complaints")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${activeTab === "complaints" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <AlertCircle size={16} /> Complaints
            </button>
          </div>

          <div className="p-6">
            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="flex gap-3 mb-6">
                  <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Services</option>
                    <option value="hotel">Hotel</option>
                    <option value="tour">Tour</option>
                    <option value="taxi">Taxi</option>
                  </select>
                  <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Booking ID</th>
                        <th className="px-4 py-3">Service Type</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {mockBookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{bk.id}</td>
                          <td className="px-4 py-3">{bk.type}</td>
                          <td className="px-4 py-3">{bk.date}</td>
                          <td className="px-4 py-3 font-medium">{bk.amount}</td>
                          <td className="px-4 py-3">{renderStatusBadge(bk.status)}</td>
                          <td className="px-4 py-3 flex justify-end gap-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="View"><Eye size={16}/></button>
                            <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors" title="Edit"><Edit2 size={16}/></button>
                            <button className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Cancel Booking"><XCircle size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "coupons" && (
              <div className="space-y-4">
                <div className="flex gap-3 mb-6">
                  <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Coupon Code</th>
                        <th className="px-4 py-3">Discount</th>
                        <th className="px-4 py-3">Expiry Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {mockCoupons.map((cp) => (
                        <tr key={cp.code} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{cp.code}</td>
                          <td className="px-4 py-3 font-medium text-green-600">{cp.discount}</td>
                          <td className="px-4 py-3">{cp.expiry}</td>
                          <td className="px-4 py-3">{renderStatusBadge(cp.status)}</td>
                          <td className="px-4 py-3 flex justify-end gap-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="View"><Eye size={16}/></button>
                            <button className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Deactivate"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="space-y-4">
                <div className="flex gap-3 mb-6">
                  <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="working">Working</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Complaint ID</th>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {mockComplaints.map((cmp) => (
                        <tr key={cmp.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{cmp.id}</td>
                          <td className="px-4 py-3">{cmp.subject}</td>
                          <td className="px-4 py-3">{cmp.date}</td>
                          <td className="px-4 py-3">{renderStatusBadge(cmp.status)}</td>
                          <td className="px-4 py-3 flex justify-end gap-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="View & Reply"><Eye size={16}/></button>
                            <button className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors" title="Mark Closed"><CheckCircle size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, bookings, coupons, and complaints.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <Download size={16} className="mr-2" /> Export All
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Name, Email, Mobile or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Clock size={24} className="animate-spin mb-2 text-blue-600" />
            <p className="font-medium">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded-xl border border-red-100">
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{user.userName}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user._id?.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-medium">{user.email}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{user.mobile}</p>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px]">
                        {user.address || <span className="text-slate-400 italic">Not provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="text-slate-300 mb-3" />
                        <p className="text-base font-bold text-slate-700">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
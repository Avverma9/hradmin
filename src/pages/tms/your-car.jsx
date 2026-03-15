import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  Hash, 
  Loader2, 
  AlertTriangle, 
  PencilLine, 
  Trash2, 
  Search, 
  Filter,
  Plus,
  Users,
  Fuel,
  Settings2,
  Gauge,
  ChevronRight,
  MapPin
} from 'lucide-react';
// Make sure this import path matches your project structure
import { getCarByOwnerId } from '../../../redux/slices/tms/travel/car';
import Breadcrumb from '../../components/breadcrumb';

// Fallback image if car has no images array or it's empty
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    "On A Trip": "bg-blue-500 text-white",
    "Available": "bg-green-500 text-white",
    "Trip Completed": "bg-purple-500 text-white",
    "Unavailable": "bg-gray-500 text-white",
  };

  const style = statusStyles[status] || statusStyles.Unavailable;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${style}`}>
      {status === "On A Trip" && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>}
      {status}
    </span>
  );
};

const CarCard = ({ car }) => {
  const imageUrl = car?.images?.[0] || FALLBACK_IMAGE;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      
      {/* Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        
        <div className="absolute left-3 top-3">
          <StatusBadge status={car.status} />
        </div>
        
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-xl font-extrabold text-white leading-tight">{car.make} {car.model}</p>
            <p className="text-sm font-medium text-slate-300">{car.year} • {car.color}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Quick Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 ring-1 ring-inset ring-slate-200">
            {car.vehicleType}
          </span>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 ring-1 ring-inset ring-slate-200">
            {car.sharingType}
          </span>
          {car.vehicleNumber && (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 ring-1 ring-inset ring-slate-200">
              {car.vehicleNumber}
            </span>
          )}
        </div>

        {/* Specs Grid */}
        <div className="mb-5 grid grid-cols-2 gap-y-3 gap-x-2 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span>{car.seater || 'N/A'} Seats</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel size={16} className="text-slate-400" />
            <span>{car.fuelType || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-slate-400" />
            <span>{car.transmission || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-slate-400" />
            <span>{car.mileage ? `${car.mileage} kmpl` : 'N/A'}</span>
          </div>
        </div>

        {/* Locations */}
        {(car.pickupP || car.dropP) && (
          <div className="mb-5 rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-600 border border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{car.pickupP || 'Any'} <span className="text-slate-300 mx-1">→</span> {car.dropP || 'Any'}</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pricing</span>
            <span className="text-lg font-extrabold text-indigo-600">₹{car.price || car.perPersonCost}<span className="text-xs text-slate-500 font-medium">/{car.sharingType === 'Shared' ? 'seat' : 'day'}</span></span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Link to={`/your-cars/${car._id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600">
              <PencilLine size={16} />
            </Link>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600">
              <Trash2 size={16} />
            </button>
            <Link to={`/your-cars/${car._id}`} className="ml-1 flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition-colors hover:bg-slate-800">
              View <ChevronRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

const YourCars = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { ownerCars, loading, error } = useSelector((state) => state.car);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sharingFilter, setSharingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const ownerId = user?._id || user?.id;
    if (ownerId) {
      dispatch(getCarByOwnerId(ownerId));
    }
  }, [dispatch, user]);

  // Filtering Logic
  const filteredCars = useMemo(() => {
    if (!ownerCars) return [];
    
    return ownerCars.filter((car) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (car.make || '').toLowerCase().includes(searchLower) || 
        (car.model || '').toLowerCase().includes(searchLower) || 
        (car.vehicleNumber || '').toLowerCase().includes(searchLower);
      
      const matchesType = typeFilter ? car.vehicleType === typeFilter : true;
      const matchesSharing = sharingFilter ? car.sharingType === sharingFilter : true;
      
      let matchesStatus = true;
      if (statusFilter) {
        matchesStatus = car.status === statusFilter;
      }

      return matchesSearch && matchesType && matchesSharing && matchesStatus;
    });
  }, [ownerCars, searchTerm, typeFilter, sharingFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <Breadcrumb />
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">Travel Management</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Registered Vehicles</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Manage your cars, view their live status, and update configurations.
            </p>
          </div>
          <Link to="/add-a-car" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Plus size={18} />
            Register New Vehicle
          </Link>
        </div>
      </div>

        {/* Filter Toolbar */}
        {!loading && !error && ownerCars?.length > 0 && (
          <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm flex flex-col lg:flex-row items-center gap-2">
            
            {/* Search Box */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search make, model, or number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-colors focus:bg-slate-100 placeholder:font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="h-px w-full bg-slate-100 lg:h-8 lg:w-px"></div>

            {/* Dropdown Filters */}
            <div className="flex w-full flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full appearance-none rounded-xl bg-transparent py-2.5 pl-9 pr-8 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors">
                  <option value="">All Vehicle Types</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
              
              <div className="relative flex-1">
                <select value={sharingFilter} onChange={(e) => setSharingFilter(e.target.value)} className="w-full appearance-none rounded-xl bg-transparent py-2.5 pl-4 pr-8 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors">
                  <option value="">All Sharing Modes</option>
                  <option value="Private">Private</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>

              <div className="relative flex-1">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none rounded-xl bg-transparent py-2.5 pl-4 pr-8 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors">
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="On A Trip">On A Trip</option>
                  <option value="Trip Completed">Trip Completed</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {/* Content Area */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-bold text-slate-500">Fetching your fleet data...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 shadow-sm">
            <AlertTriangle size={18} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && ownerCars?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
              <Car size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">No Vehicles Registered</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm">
              You haven't added any vehicles to your portfolio yet. Register your first car to start accepting bookings.
            </p>
            <Link to="/add-a-car" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800">
              <Plus size={18} /> Add Your First Vehicle
            </Link>
          </div>
        )}

        {!loading && !error && ownerCars?.length > 0 && filteredCars.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <Search size={32} className="text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Matches Found</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setTypeFilter(''); setSharingFilter(''); setStatusFilter(''); }} 
              className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!loading && !error && filteredCars.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {filteredCars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default YourCars;

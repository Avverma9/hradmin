import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Car as CarIcon,
  UserCircle,
  UploadCloud,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft
} from 'lucide-react';
import { addCar, updateCar, getCarById, clearCarError, clearSelectedCar } from '../../../redux/slices/tms/travel/car';
import { getAllPartners } from '../../../redux/slices/partner';
import Breadcrumb from '../../components/breadcrumb';

const VEHICLE_TYPES = ['Bike', 'Car', 'Bus'];
const SHARING_TYPES = ['Private', 'Shared'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const STATUS_OPTIONS = ['Available', 'On A Trip', 'Trip Completed', 'Unavailable'];

const INITIAL_FORM_STATE = {
  make: '',
  model: '',
  year: '',
  vehicleType: 'Car',
  sharingType: 'Private',
  status: 'Available',
  price: '',
  mileage: '',
  color: '',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  vehicleNumber: '',
  pickupP: '',
  dropP: '',
  seater: '',
  ownerName: '',
  ownerEmail: '',
  ownerMobile: '',
  ownerAadhar: '',
  ownerPAN: '',
  ownerDrivingLicence: '',
  ownerId: '',
};

export default function AddCarForm({ isEditMode = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: carId } = useParams();

  const { selectedCar, loading, error } = useSelector((state) => state.car || {});
  const { partners=[], loading: partnersLoading } = useSelector((state) => state.partner || {});

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [carImages, setCarImages] = useState([]);
  const [dlImages, setDlImages] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  const existingCarImages = isEditMode ? selectedCar?.images || [] : [];
  const existingDlImages = isEditMode ? selectedCar?.dlImage || [] : [];

  useEffect(() => {
    dispatch(getAllPartners());
    if (isEditMode && carId) {
      dispatch(getCarById(carId));
    }
    return () => {
      dispatch(clearSelectedCar());
      dispatch(clearCarError());
    };
  }, [dispatch, isEditMode, carId]);

  useEffect(() => {
    if (isEditMode && selectedCar) {
      const carData = { ...INITIAL_FORM_STATE };
      for (const key in carData) {
        if (selectedCar[key] !== undefined && selectedCar[key] !== null) {
          carData[key] = selectedCar[key];
        }
      }
      setFormData(carData);
      // Note: Image handling would need to be more complex
      // if you need to show existing images. For now, we reset.
      setCarImages([]);
      setDlImages([]);
    }
  }, [isEditMode, selectedCar]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartnerSelect = (e) => {
    const partnerId = e.target.value;
    setSelectedPartnerId(partnerId);
    if (!partnerId) {
      setFormData((prev) => ({
        ...prev,
        ownerId: '',
        ownerName: '',
        ownerEmail: '',
        ownerMobile: '',
      }));
      return;
    }

    const partner = partners.find((p) => p._id === partnerId);
    if (partner) {
      setFormData((prev) => ({
        ...prev,
        ownerId: partner._id,
        ownerName: partner.name || partner.fullName || partner.username || '',
        ownerEmail: partner.email || partner.ownerEmail || '',
        ownerMobile: partner.mobile || partner.phone || '',
      }));
    }
  };

  const handleFileChange = (e, setFileState) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFileState((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index, fileState, setFileState) => {
    const newFiles = [...fileState];
    newFiles.splice(index, 1);
    setFileState(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    const submitData = new FormData();

    console.log('AddCar: sending ownerId=', formData.ownerId, 'ownerName=', formData.ownerName);
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    carImages.forEach((file) => {
      submitData.append('images', file);
    });

    dlImages.forEach((file) => {
      submitData.append('dlImage', file);
    });

    try {
      if (isEditMode) {
        await dispatch(updateCar({ carId, carData: submitData })).unwrap();
        setSuccessMsg('Vehicle details updated successfully.');
      } else {
        await dispatch(addCar(submitData)).unwrap();
        setSuccessMsg('Vehicle and Owner details successfully added.');
        setFormData(INITIAL_FORM_STATE);
        setCarImages([]);
        setDlImages([]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate('/your-cars'), 2000);
    } catch (err) {
      console.error('Submission failed', err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 placeholder:font-normal";
  const labelClass = "mb-1.5 block text-[13px] font-bold text-slate-700";
  
  if (isEditMode && loading && !selectedCar) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
            <Breadcrumb />
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 mb-4">
                <ArrowLeft size={16} className="mr-2"/>
                Back to Your Cars
            </button>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 mb-1.5">Travel Management</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{isEditMode ? 'Edit Vehicle Details' : 'Onboard New Vehicle'}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {isEditMode ? 'Update the details for this vehicle and its owner.' : 'Register a new car and associate it with an owner or driver profile.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <div className="flex items-center gap-3 text-sm font-bold text-rose-700">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
            {clearCarError && (
              <button onClick={() => dispatch(clearCarError())} className="text-rose-500 hover:text-rose-700">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm text-sm font-bold text-emerald-700">
            <CheckCircle2 size={18} />
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <CarIcon size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Vehicle Specifications</h2>
                <p className="text-[13px] text-slate-500 font-medium">Technical details and pricing for the fleet.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div><label className={labelClass}>Make (Brand) <span className="text-rose-500">*</span></label><input required type="text" name="make" value={formData.make} onChange={handleTextChange} placeholder="e.g. Toyota" className={inputClass} /></div>
                <div><label className={labelClass}>Model <span className="text-rose-500">*</span></label><input required type="text" name="model" value={formData.model} onChange={handleTextChange} placeholder="e.g. Camry" className={inputClass} /></div>
                <div><label className={labelClass}>Manufacturing Year <span className="text-rose-500">*</span></label><input required type="number" name="year" value={formData.year} onChange={handleTextChange} placeholder="e.g. 2023" className={inputClass} /></div>
                <div><label className={labelClass}>Vehicle Type <span className="text-rose-500">*</span></label><select required name="vehicleType" value={formData.vehicleType} onChange={handleTextChange} className={inputClass}>{VEHICLE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div><label className={labelClass}>Sharing Mode <span className="text-rose-500">*</span></label><select required name="sharingType" value={formData.sharingType} onChange={handleTextChange} className={inputClass}>{SHARING_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div><label className={labelClass}>Current Status</label><select name="status" value={formData.status} onChange={handleTextChange} className={inputClass}>{STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div><label className={labelClass}>Base Price / Cost (₹) <span className="text-rose-500">*</span></label><input required type="number" name="price" value={formData.price} onChange={handleTextChange} placeholder="e.g. 50000" className={inputClass} /></div>
                <div><label className={labelClass}>Color <span className="text-rose-500">*</span></label><input required type="text" name="color" value={formData.color} onChange={handleTextChange} placeholder="e.g. Pearl White" className={inputClass} /></div>
                <div><label className={labelClass}>Fuel Type <span className="text-rose-500">*</span></label><select required name="fuelType" value={formData.fuelType} onChange={handleTextChange} className={inputClass}>{FUEL_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div><label className={labelClass}>Transmission <span className="text-rose-500">*</span></label><select required name="transmission" value={formData.transmission} onChange={handleTextChange} className={inputClass}>{TRANSMISSIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div><label className={labelClass}>Registration Number</label><input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleTextChange} placeholder="e.g. MH-12-AB-1234" className={inputClass} /></div>
                <div><label className={labelClass}>Seating Capacity</label><input type="number" name="seater" value={formData.seater} onChange={handleTextChange} placeholder="e.g. 5" className={inputClass} /></div>
                <div><label className={labelClass}>Mileage</label><input type="number" name="mileage" value={formData.mileage} onChange={handleTextChange} placeholder="e.g. 18" className={inputClass} /></div>
                <div><label className={labelClass}>Default Pickup Point</label><input type="text" name="pickupP" value={formData.pickupP} onChange={handleTextChange} placeholder="e.g. Airport T1" className={inputClass} /></div>
                <div><label className={labelClass}>Default Drop Point</label><input type="text" name="dropP" value={formData.dropP} onChange={handleTextChange} placeholder="e.g. Railway Station" className={inputClass} /></div>
              </div>
              <div className="mt-8 border-t border-slate-100 pt-6"><label className={labelClass}>Vehicle Images</label>
                {existingCarImages.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Existing Images</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {existingCarImages.map((imageUrl, idx) => (
                        <a key={`${imageUrl}-${idx}`} href={imageUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          <img src={imageUrl} alt={`Vehicle ${idx + 1}`} className="h-24 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 hover:bg-slate-50 transition-colors">
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                    <div className="mt-2 flex text-sm leading-6 text-slate-600 justify-center">
                      <label htmlFor="car-images" className="relative cursor-pointer rounded-md bg-white px-2 py-1 font-bold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 shadow-sm ring-1 ring-inset ring-slate-200"><span>Upload files</span><input id="car-images" name="carImages" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e, setCarImages)} accept="image/*" /></label>
                      <p className="pl-2 pt-1 font-medium">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
                {carImages.length > 0 && (<ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{carImages.map((file, idx) => (<li key={idx} className="relative flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"><span className="truncate pr-4">{file.name}</span><button type="button" onClick={() => removeFile(idx, carImages, setCarImages)} className="text-slate-400 hover:text-rose-500 absolute right-2 bg-white pl-1"><X size={14} /></button></li>))}</ul>)}
              </div>
            </div>
          </div>
          {!isEditMode && (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100"><UserCircle size={20} /></div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Owner / Driver Profile</h2>
                  <p className="text-[13px] text-slate-500 font-medium">Personal and compliance documents.</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Select Owner (Partner)</label>
                    <select value={selectedPartnerId} onChange={handlePartnerSelect} className={inputClass}>
                      <option value="">Choose existing partner (optional)</option>
                      {partners.map((partner) => (
                        <option key={partner._id} value={partner._id}>{partner.name || partner.fullName || partner.email || partner._id}</option>
                      ))}
                    </select>
                    {partnersLoading && <p className="mt-1 text-xs font-medium text-slate-500">Loading partners...</p>}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">Selected Owner ID: {formData.ownerId || 'Not selected'}</div>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div><label className={labelClass}>Full Name <span className="text-rose-500">*</span></label><input required type="text" name="ownerName" value={formData.ownerName} onChange={handleTextChange} placeholder="e.g. John Doe" className={inputClass} /></div>
                    <div><label className={labelClass}>Email Address <span className="text-rose-500">*</span></label><input required type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleTextChange} placeholder="john@example.com" className={inputClass} /></div>
                    <div><label className={labelClass}>Mobile Number <span className="text-rose-500">*</span></label><input required type="tel" name="ownerMobile" value={formData.ownerMobile} onChange={handleTextChange} placeholder="+91 9876543210" className={inputClass} /></div>
                    <div><label className={labelClass}>Aadhar Number <span className="text-rose-500">*</span></label><input required type="text" name="ownerAadhar" value={formData.ownerAadhar} onChange={handleTextChange} placeholder="XXXX XXXX XXXX" className={inputClass} /></div>
                    <div><label className={labelClass}>PAN Number <span className="text-rose-500">*</span></label><input required type="text" name="ownerPAN" value={formData.ownerPAN} onChange={handleTextChange} placeholder="ABCDE1234F" className={inputClass} /></div>
                    <div><label className={labelClass}>Driving Licence No. <span className="text-rose-500">*</span></label><input required type="text" name="ownerDrivingLicence" value={formData.ownerDrivingLicence} onChange={handleTextChange} placeholder="DL-1420110012345" className={inputClass} /></div>
                  </div>
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <label className={labelClass}>Driving Licence Scans</label>
                    {existingDlImages.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Existing Licence Files</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {existingDlImages.map((fileUrl, idx) => (
                            <a key={`${fileUrl}-${idx}`} href={fileUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">View licence file {idx + 1}</a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-6 hover:bg-slate-50 transition-colors">
                      <div className="text-center flex flex-col items-center">
                        <div className="flex text-sm leading-6 text-slate-600 justify-center items-center gap-3">
                          <UploadCloud className="h-6 w-6 text-slate-400" />
                          <label htmlFor="dl-images" className="relative cursor-pointer rounded-md bg-white px-3 py-1.5 font-bold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 shadow-sm ring-1 ring-inset ring-slate-200"><span>Select DL files</span><input id="dl-images" name="dlImages" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e, setDlImages)} accept="image/*,.pdf" /></label>
                        </div>
                      </div>
                    </div>
                    {dlImages.length > 0 && (<ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{dlImages.map((file, idx) => (<li key={idx} className="relative flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"><span className="truncate pr-4">{file.name}</span><button type="button" onClick={() => removeFile(idx, dlImages, setDlImages)} className="text-slate-400 hover:text-rose-500 absolute right-2 bg-white pl-1"><X size={14} /></button></li>))}</ul>)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-4 pt-4 pb-12">
            <button type="button" onClick={() => navigate('/your-cars')} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (<><Loader2 size={18} className="animate-spin" />Processing...</>) : (<><Save size={18} />{isEditMode ? 'Save Changes' : 'Submit Record'}</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

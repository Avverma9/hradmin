// src/pages/TourDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './listModal.css';
import { useDispatch, useSelector } from 'react-redux';
import { tourById, tourUpdate } from '../../../src/components/redux/reducers/tour/tour'; // Import your actions

const UpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.tour.editData); // Assuming you have a selector for the tour data

  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState({
    travelAgencyName: false,
    themes: false,
    overview: false,
    city: false,
    state: false,
    price: false,
    days: false,
    nights: false,
    from: false,
    to: false,
    visitingPlaces: false,
    amenities: false,
    inclusion: false,
    exclusion: false,
    cancellation: false,
    refund: false,
    bookingPolicy: false,
    dayWise: false,
  });

  // Fetch tour data on component mount
  useEffect(() => {
    dispatch(tourById(id));
  }, [dispatch, id]);

  // Update formData when data is fetched
  useEffect(() => {
    if (data && data._id === id) {
      setFormData(data);
    }
  }, [data, id]);
  console.log("here is my data",data)
  if (!data || data._id !== id) {
    return (
      <div className="tour-details-container">
        <p>Package not found or data missing.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const toggleEdit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const handleDayWiseChange = (index, value) => {
    const updated = [...formData.dayWise];
    updated[index].description = value;
    setFormData((prev) => ({ ...prev, dayWise: updated }));
  };

  const formatDate = (dateStr) => new Date(dateStr).toISOString().split('T')[0];

  const handleUpdate = () => {
    dispatch(tourUpdate(id, formData)); // Dispatch the update action
    navigate(-1); // Navigate back after update
  };


  return (
    <div className="tour-details-container">
      <h2>
        <input
          value={formData.travelAgencyName}
          readOnly={!editMode.travelAgencyName}
          onChange={(e) => handleChange('travelAgencyName', e.target.value)}
        />
        <span> - </span>
        <input
          value={formData.themes || ''}
          readOnly={!editMode.themes}
          onChange={(e) => handleChange('themes', e.target.value)}
        />
        <span className="edit-icon" onClick={() => toggleEdit('travelAgencyName')}>✏️</span>
        <span className="edit-icon" onClick={() => toggleEdit('themes')}>✏️</span>
      </h2>

      <section className="section-box">
        <h4>🌴 Overview <span className="edit-icon" onClick={() => toggleEdit('overview')}>✏️</span></h4>
        <textarea
          value={formData.overview}
          readOnly={!editMode.overview}
          onChange={(e) => handleChange('overview', e.target.value)}
        />
      </section>

      <section className="section-box">
        <div>
          📍 Location:
          <input
            value={formData.city}
            readOnly={!editMode.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <input
            value={formData.state}
            readOnly={!editMode.state}
            onChange={(e) => handleChange('state', e.target.value)}
          />
          <span className="edit-icon" onClick={() => toggleEdit('city')}>✏️</span>
          <span className="edit-icon" onClick={() => toggleEdit('state')}>✏️</span>
        </div>
        <div>
          💸 Price:
          <input
            type="number"
            value={formData.price}
            readOnly={!editMode.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
          <span className="edit-icon" onClick={() => toggleEdit('price')}>✏️</span>
        </div>
        <div>
          ⏳ Duration:
          <input
            type="number"
            value={formData.days}
            readOnly={!editMode.days}
            onChange={(e) => handleChange('days', e.target.value)}
          /> Days /
          <input
            type="number"
            value={formData.nights}
            readOnly={!editMode.nights}
            onChange={(e) => handleChange('nights', e.target.value)}
          /> Nights
          <span className="edit-icon" onClick={() => toggleEdit('days')}>✏️</span>
          <span className="edit-icon" onClick={() => toggleEdit('nights')}>✏️</span>
        </div>
        <div>
          📅 Dates:
          <input
            type="date"
            value={formatDate(formData.from)}
            readOnly={!editMode.from}
            onChange={(e) => handleChange('from', e.target.value)}
          />
          -
          <input
            type="date"
            value={formatDate(formData.to)}
            readOnly={!editMode.to}
            onChange={(e) => handleChange('to', e.target.value)}
          />
          <span className="edit-icon" onClick={() => toggleEdit('from')}>✏️</span>
          <span className="edit-icon" onClick={() => toggleEdit('to')}>✏️</span>
        </div>
        <div>
          🗺️ Visiting:
          <input
            value={formData.visitngPlaces}
            readOnly={!editMode.visitingPlaces}
            onChange={(e) => handleChange('visitngPlaces', e.target.value)}
          />
          <span className="edit-icon" onClick={() => toggleEdit('visitingPlaces')}>✏️</span>
        </div>
      </section>

      <section className="section-box">
        <h4>🗓️ Day-wise Itinerary <span className="edit-icon" onClick={() => toggleEdit('dayWise')}>✏️</span></h4>
        <ul>
          {formData.dayWise?.map((d, i) => (
            <li key={d._id}>
              <strong>Day {d.day}:</strong>
              <textarea
                value={d.description}
                readOnly={!editMode.dayWise}
                onChange={(e) => handleDayWiseChange(i, e.target.value)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="section-box">
        <h4>🎒 Amenities <span className="edit-icon" onClick={() => toggleEdit('amenities')}>✏️</span></h4>
        <textarea
          value={formData.amenities?.join(', ')}
          readOnly={!editMode.amenities}
          onChange={(e) => handleChange('amenities', e.target.value.split(',').map(a => a.trim()))}
        />
      </section>

      <section className="section-box split-columns">
        <div>
          <h5>✅ Inclusions <span className="edit-icon" onClick={() => toggleEdit('inclusion')}>✏️</span></h5>
          <ul>
            {formData.inclusion?.map((inc, i) => (
              <li key={i}>
                <input
                  value={inc}
                  readOnly={!editMode.inclusion}
                  onChange={(e) => handleArrayChange('inclusion', i, e.target.value)}
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5>❌ Exclusions <span className="edit-icon" onClick={() => toggleEdit('exclusion')}>✏️</span></h5>
          <ul>
            {formData.exclusion?.map((exc, i) => (
              <li key={i}>
                <input
                  value={exc}
                  readOnly={!editMode.exclusion}
                  onChange={(e) => handleArrayChange('exclusion', i, e.target.value)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-box">
        <h4>📄 Terms & Conditions</h4>
        <ul>
          <li>
            <strong>Cancellation:</strong>
            <input
              value={formData.termsAndConditions?.cancellation}
              readOnly={!editMode.cancellation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  termsAndConditions: {
                    ...prev.termsAndConditions,
                    cancellation: e.target.value,
                  },
                }))
              }
            />
            <span className="edit-icon" onClick={() => toggleEdit('cancellation')}>✏️</span>
          </li>
          <li>
            <strong>Refund:</strong>
            <input
              value={formData.termsAndConditions?.refund}
              readOnly={!editMode.refund}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  termsAndConditions: {
                    ...prev.termsAndConditions,
                    refund: e.target.value,
                  },
                }))
              }
            />
            <span className="edit-icon" onClick={() => toggleEdit('refund')}>✏️</span>
          </li>
          <li>
            <strong>Booking Policy:</strong>
            <input
              value={formData.termsAndConditions?.bookingPolicy}
              readOnly={!editMode.bookingPolicy}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  termsAndConditions: {
                    ...prev.termsAndConditions,
                    bookingPolicy: e.target.value,
                  },
                }))
              }
            />
            <span className="edit-icon" onClick={() => toggleEdit('bookingPolicy')}>✏️</span>
          </li>
        </ul>
      </section>

      <section className="section-box gallery">
        <h4>📸 Gallery</h4>
        <div className="gallery-grid">
          {formData.images?.map((img, i) => (
            <img key={i} src={img} alt={`img-${i}`} />
          ))}
        </div>
      </section>

      <div className="footer-actions">
        <button onClick={() => navigate(-1)}>⬅ Back</button>
        <button className="btn-primary" onClick={handleUpdate}>Update</button>
      </div>
    </div>
  );
};

export default UpdatePage;

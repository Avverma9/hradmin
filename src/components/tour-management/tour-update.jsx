import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { tourById, tourUpdate } from "../redux/reducers/tour/tour";
import './listModal.css';

export default function TourUpdate() {
  const { editData } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [editableData, setEditableData] = useState([]);
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    dispatch(tourById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (editData && Array.isArray(editData)) {
      setEditableData([...editData]); // Create a copy to avoid mutation
    }
  }, [editData]);

  const handleInputChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index] = { ...updated[index], [field]: value };
    setEditableData(updated);
  };

  const toggleEditMode = (index, field) => {
    setEditMode((prev) => ({
      ...prev,
      [`${index}-${field}`]: !prev[`${index}-${field}`],
    }));
  };

  const handleUpdate = (index, field) => {
    const updatedPkg = editableData[index];
    dispatch(tourUpdate({ id: updatedPkg._id, data: updatedPkg }));
    toggleEditMode(index, field);
  };

  return (
    <div>
      <h1>Tour Update</h1>
      <div className="travel-packages">
        {editableData && editableData.length > 0 && (
          <div className="package-card">
            {editableData.map((pkg, index) => (
              <div key={pkg._id || index} className="package-info">

                <div className="grouped-inputs">
                  {/* Travel Agency Name */}
                  <div className="editable-field">
                    <label className="input-label">Travel Agency Name</label>
                    <div className="field-control">
                      {editMode[`${index}-travelAgencyName`] ? (
                        <>
                          <input
                            type="text"
                            value={pkg.travelAgencyName || ""}
                            onChange={(e) =>
                              handleInputChange(index, "travelAgencyName", e.target.value)
                            }
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "travelAgencyName")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "travelAgencyName")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.travelAgencyName} readOnly />
                          <span onClick={() => toggleEditMode(index, "travelAgencyName")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Nights */}
                  <div className="editable-field">
                    <label className="input-label">Nights</label>
                    <div className="field-control">
                      {editMode[`${index}-nights`] ? (
                        <>
                          <input
                            type="number"
                            value={pkg.nights || ""}
                            onChange={(e) => handleInputChange(index, "nights", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "nights")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "nights")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.nights} readOnly />
                          <span onClick={() => toggleEditMode(index, "nights")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Days */}
                  <div className="editable-field">
                    <label className="input-label">Days</label>
                    <div className="field-control">
                      {editMode[`${index}-days`] ? (
                        <>
                          <input
                            type="number"
                            value={pkg.days || ""}
                            onChange={(e) => handleInputChange(index, "days", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "days")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "days")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.days} readOnly />
                          <span onClick={() => toggleEditMode(index, "days")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grouped Inputs for State, City, Price */}
                <div className="grouped-inputs">
                  <div className="editable-field">
                    <label className="input-label">State</label>
                    <div className="field-control">
                      {editMode[`${index}-state`] ? (
                        <>
                          <input
                            type="text"
                            value={pkg.state || ""}
                            onChange={(e) => handleInputChange(index, "state", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "state")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "state")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.state} readOnly />
                          <span onClick={() => toggleEditMode(index, "state")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="editable-field">
                    <label className="input-label">City</label>
                    <div className="field-control">
                      {editMode[`${index}-city`] ? (
                        <>
                          <input
                            type="text"
                            value={pkg.city || ""}
                            onChange={(e) => handleInputChange(index, "city", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "city")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "city")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.city} readOnly />
                          <span onClick={() => toggleEditMode(index, "city")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="editable-field">
                    <label className="input-label">Price</label>
                    <div className="field-control">
                      {editMode[`${index}-price`] ? (
                        <>
                          <input
                            type="number"
                            value={pkg.price || ""}
                            onChange={(e) => handleInputChange(index, "price", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "price")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "price")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.price} readOnly />
                          <span onClick={() => toggleEditMode(index, "price")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Fields */}
                <div className="grouped-inputs">
                  <div className="editable-field">
                    <label className="input-label">From</label>
                    <div className="field-control">
                      {editMode[`${index}-from`] ? (
                        <>
                          <input
                            type="date"
                            value={pkg.from || ""}
                            onChange={(e) => handleInputChange(index, "from", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "from")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "from")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.from} readOnly />
                          <span onClick={() => toggleEditMode(index, "from")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="editable-field">
                    <label className="input-label">To</label>
                    <div className="field-control">
                      {editMode[`${index}-to`] ? (
                        <>
                          <input
                            type="date"
                            value={pkg.to || ""}
                            onChange={(e) => handleInputChange(index, "to", e.target.value)}
                          />
                          <div className="buttons">
                            <button onClick={() => toggleEditMode(index, "to")} title="Cancel">✖</button>
                            <button onClick={() => handleUpdate(index, "to")} title="Update">✔</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="text" value={pkg.to} readOnly />
                          <span onClick={() => toggleEditMode(index, "to")} title="Edit">✎</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overview */}
                <div className="editable-field">
                  <label className="input-label">Overview</label>
                  <div className="field-control">
                    {editMode[`${index}-overview`] ? (
                      <>
                        <textarea
                          value={pkg.overview || ""}
                          onChange={(e) => handleInputChange(index, "overview", e.target.value)}
                        />
                        <div className="buttons">
                          <button onClick={() => toggleEditMode(index, "overview")} title="Cancel">✖</button>
                          <button onClick={() => handleUpdate(index, "overview")} title="Update">✔</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <textarea value={pkg.overview} readOnly />
                        <span onClick={() => toggleEditMode(index, "overview")} title="Edit">✎</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Render dayWise descriptions */}
                <div className="daywise-container">
  {pkg.dayWise.map((day, dayIndex) => (
    <div key={day._id} className="editable-field">
      <label className="input-label">Day {day.day}</label>
      <div className="field-control">
        {editMode[`${index}-day-${dayIndex}`] ? (
          <>
            <textarea
              value={day.description || ""}
              onChange={(e) => handleInputChange(index, `dayWise[${dayIndex}].description`, e.target.value)}
            />
            <div className="buttons">
              <button onClick={() => toggleEditMode(index, `day-${dayIndex}`)} title="Cancel">✖</button>
              <button onClick={() => handleUpdate(index, `day-${dayIndex}`)} title="Update">✔</button>
            </div>
          </>
        ) : (
          <>
            <textarea value={day.description} readOnly />
            <span onClick={() => toggleEditMode(index, `day-${dayIndex}`)} title="Edit">✎</span>
          </>
        )}
      </div>
    </div>
  ))}
</div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

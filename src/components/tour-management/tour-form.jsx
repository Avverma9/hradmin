import React, { useState, useEffect } from "react";
import {
  FaBeer,
  FaCoffee,
  FaApple,
  FaCar,
  FaPlane,
  FaMusic,
} from "react-icons/fa";
import { MdLabelImportant } from "react-icons/md";
import "./tour.css";
import { Country, State, City } from "country-state-city";
import { useDispatch } from "react-redux";

import {
  FaCity,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaTools,
  FaFileImage,
  FaRegCheckCircle,
  FaRupeeSign,
  FaStreetView,
  FaGlobe,
  FaUser,
} from "react-icons/fa";
import Select from "react-select";
import { FaLocationArrow } from "react-icons/fa6";
import { addTour } from "../redux/reducers/tour/tour";
import { useLoader } from "../../../utils/loader";
import { useTourTheme } from "../../../utils/additional/tourTheme";
const TourForm = () => {
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    state: "",
    travelAgencyName: "",
    themes: "",
    visitngPlaces: "",
    overview: "",
    price: "",
    nights: "",
    days: "",
    from: "",
    to: "",
    amenities: [],
    inclusion: [""],
    exclusion: [""],
    termsAndConditions: { cancellation: "", refund: "", bookingPolicy: "" },
    dayWise: [{ day: "", description: "" }],
    starRating: "",
    images: [],
  });

  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const tourTheme = useTourTheme();
  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (["cancellation", "refund", "bookingPolicy"].includes(name)) {
      setFormData({
        ...formData,
        termsAndConditions: {
          ...formData.termsAndConditions,
          [name]: value,
        },
      });
    } else if (name === "inclusion") {
      const newInclusion = [...formData.inclusion];
      if (index !== null) {
        newInclusion[index] = value;
      } else {
        newInclusion.push(value);
      }
      setFormData({
        ...formData,
        inclusion: newInclusion,
      });
    }
    // Handle exclusion field, add/update based on index
    else if (name === "exclusion") {
      const newExclusion = [...formData.exclusion];
      if (index !== null) {
        // Update specific exclusion point if index is provided
        newExclusion[index] = value;
      } else {
        // Add a new empty exclusion point if no index
        newExclusion.push(value);
      }
      setFormData({
        ...formData,
        exclusion: newExclusion,
      });
    } else {
      setFormData({
        ...formData,
        [name]: ["duration", "nights", "days", "starRating"].includes(name)
          ? Number(value)
          : value,
      });
    }
  };

  const handleAmenitiesChange = (selectedOptions) => {
    // Log the selected options for debugging

    // Update the state with selected amenities
    setFormData({
      ...formData,
      amenities: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    });
  };

  const handleDayWiseChange = (index, e) => {
    const updatedDayWise = [...formData.dayWise];
    updatedDayWise[index][e.target.name] = e.target.value;
    setFormData({ ...formData, dayWise: updatedDayWise });
  };

  const handleAddDay = () => {
    setFormData({
      ...formData,
      dayWise: [...formData.dayWise, { day: "", description: "" }],
    });
  };

  const handleRemoveDay = (index) => {
    const updatedDayWise = formData.dayWise.filter((_, i) => i !== index);
    setFormData({ ...formData, dayWise: updatedDayWise });
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, null] });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleImageChange = (index, e) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = e.target.files[0]; // Store the first image in the file input
    setFormData({ ...formData, images: updatedImages });
  };

  // Add a new empty input field for inclusion
  const handleAddInclusion = () => {
    setFormData({ ...formData, inclusion: [...formData.inclusion, ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("city", formData.city);
    formDataToSend.append("country", formData.country);
    formDataToSend.append("themes", formData.themes);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("overview", formData.overview);
    formDataToSend.append("travelAgencyName", formData.travelAgencyName);
    formDataToSend.append("visitngPlaces", formData.visitngPlaces);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("nights", formData.nights);
    formDataToSend.append("days", formData.days);
    formDataToSend.append("from", formData.from);
    formDataToSend.append("to", formData.to);
    formDataToSend.append("starRating", formData.starRating);
    formData.inclusion.forEach((inclusions) => {
      formDataToSend.append("inclusion[]", inclusions);
    });
    formData.exclusion.forEach((exclusions) => {
      formDataToSend.append("exclusion[]", exclusions);
    });

    formData.amenities.forEach((amenity) => {
      formDataToSend.append("amenities[]", amenity);
    });

    formData.dayWise.forEach((day, index) => {
      formDataToSend.append(`dayWise[${index}][day]`, day.day);
      formDataToSend.append(`dayWise[${index}][description]`, day.description);
    });

    for (const [key, value] of Object.entries(formData.termsAndConditions)) {
      formDataToSend.append(`termsAndConditions[${key}]`, value);
    }
    formData.images.forEach((image) => {
      if (image instanceof File) {
        formDataToSend.append("images", image);
      }
    });

    try {
      showLoader();
      await dispatch(addTour(formDataToSend));
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      hideLoader();
      window.location.reload();
    }
  };

  const inputStyles = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "20px",
    fontSize: "0.9rem",
    color: "#555",
    boxSizing: "border-box",
  };

  useEffect(() => {
    const allCountries = Country.getAllCountries(); // Fetching all countries
    setCountries(allCountries);

    if (formData.country) {
      const initialStates = State.getStatesOfCountry(formData.country);
      setStates(initialStates);
    }

    if (formData.state && formData.country) {
      const initialCities = City.getCitiesOfState(
        formData.country,
        formData.state
      );
      setCities(initialCities);
    }
  }, [formData.country, formData.state]);
  const pattern = /^[0-9]+N [a-zA-Z\s]+(\|[0-9]+N [a-zA-Z\s]+)*$/;

  const isValid = pattern.test(formData.visitngPlaces);

  const openDatePicker = (e) => {
    e.target.showPicker();
  };

  const AmenitiesList = [
    { icon: <FaBeer />, label: "Beer" },
    { icon: <FaCoffee />, label: "Coffee" },
    { icon: <FaApple />, label: "Apple" },
    { icon: <FaCar />, label: "Car" },
    { icon: <FaPlane />, label: "Plane" },
    { icon: <FaMusic />, label: "Music" },
  ];

  return (
    <div className="form-container">
      <h2>Travel Package Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaUser />
              Enter your travel agency name
            </label>
            <input
              type="text"
              style={inputStyles}
              name="travelAgencyName"
              value={formData.travelAgencyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <FaUser />
              Select your travel theme
            </label>
            <select
              style={inputStyles}
              name="themes"
              value={formData.themes}
              onChange={handleChange}
              required
            >
              <option value="" disabled={!Array.isArray(tourTheme) || !tourTheme.length}>
                {Array.isArray(tourTheme) && tourTheme.length
                  ? "Select theme"
                  : "No themes available"}
              </option>
              {Array.isArray(tourTheme) &&
                tourTheme.map((theme) => (
                  <option key={theme._id || theme.name} value={theme.name}>
                    {theme.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaCity /> Country <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              options={countries.map((country) => ({
                label: country.name,
                value: country.isoCode,
              }))}
              value={
                formData.country
                  ? { label: formData.country, value: formData.country }
                  : null
              }
              onChange={(selectedOption) =>
                setFormData({ ...formData, country: selectedOption.value })
              }
              required
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
              }}
            />
          </div>
          <div className="form-group">
            <label>
              <FaMapMarkerAlt /> State
            </label>
            <Select
              options={states.map((state) => ({
                label: state.name,
                value: state.isoCode,
              }))}
              value={
                formData.state
                  ? { label: formData.state, value: formData.state }
                  : null
              }
              onChange={(selectedOption) =>
                setFormData({ ...formData, state: selectedOption.value })
              }
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
              }}
            />
          </div>
          <div className="form-group">
            <label>
              <FaLocationArrow /> City
            </label>
            <Select
              options={cities.map((city) => ({
                label: city.name,
                value: city.name,
              }))}
              value={
                formData.city
                  ? { label: formData.city, value: formData.city }
                  : null
              }
              onChange={(selectedOption) =>
                setFormData({ ...formData, city: selectedOption.value })
              }
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
              }}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaCalendarAlt /> Days <span style={{ color: "red" }}>*</span>
            </label>
            <select
              style={inputStyles}
              name="days"
              value={formData.days}
              onChange={handleChange}
              required
            >
              <option value="">Select Days</option>
              {[...Array(30).keys()].map((i) => {
                const dayOption = i + 1;
                return (
                  <option key={dayOption} value={dayOption}>
                    {dayOption} Day
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label>
              <FaCalendarAlt /> Nights <span style={{ color: "red" }}>*</span>
            </label>
            <select
              style={inputStyles}
              name="nights"
              value={formData.nights}
              onChange={handleChange}
              required
            >
              <option value="">Select nights</option>
              {[...Array(30).keys()].map((i) => {
                const nightOption = i + 1;
                return (
                  <option key={nightOption} value={nightOption}>
                    {nightOption} Night
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label>
              <FaStar /> Star Rating <span style={{ color: "red" }}>*</span>
            </label>
            <select
              style={inputStyles}
              name="starRating"
              value={formData.starRating}
              onChange={handleChange}
              required
            >
              <option value="">Select Rating</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Star
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaGlobe /> Places to visit eg(1N Bihar|2N Patna|1N Delhi)
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyles}
              name="visitngPlaces"
              value={formData.visitngPlaces}
              onChange={handleChange}
              required
              placeholder="Enter places like 1N Bihar|2N Patna|1N Delhi"
            />
            {!isValid && formData.visitngPlaces && (
              <small style={{ color: "red" }}>
                Please enter the places in the correct format (e.g., 1N Bihar|2N
                Patna|1N Delhi)
              </small>
            )}
          </div>
          <div className="form-group">
            <label>
              <FaRupeeSign /> Package Price{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              style={inputStyles}
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <FaStreetView /> Package Overview{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              type="text"
              style={inputStyles}
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <FaCalendarAlt /> From Date{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              style={inputStyles}
              name="from"
              value={formData.from}
              onChange={handleChange}
              onClick={openDatePicker} // Open the date picker on click
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaCalendarAlt /> To Date <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              style={inputStyles}
              name="to"
              value={formData.to}
              onChange={handleChange}
              onClick={openDatePicker} // Open the date picker on click
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaRegCheckCircle /> Inclusion{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            {formData.inclusion.map((inclusion, index) => (
              <div key={index}>
                <input
                  style={inputStyles}
                  name="inclusion"
                  value={inclusion}
                  onChange={(e) => handleChange(e, index)} // Pass the index here
                  required
                />
              </div>
            ))}
            <button
              type="button"
              className="add-button"
              onClick={() =>
                handleChange({ target: { name: "inclusion", value: "" } })
              }
            >
              Add More Inclusion
            </button>
          </div>
          <div className="form-group">
            <label>
              <FaRegCheckCircle /> Exclusion{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            {formData.exclusion.map((exclusion, index) => (
              <div key={index}>
                <input
                  style={inputStyles}
                  name="exclusion"
                  value={exclusion}
                  onChange={(e) => handleChange(e, index)} // Pass the index here
                  required
                />
              </div>
            ))}
            <button
              type="button"
              className="add-button"
              onClick={() =>
                handleChange({ target: { name: "exclusion", value: "" } })
              }
            >
              Add More Exclusion
            </button>
          </div>
        </div>
        <h4
          style={{
            background: "#2196f3",
            width: "220px",
            fontSize: "18px",
            color: "white",
          }}
        >
          <MdLabelImportant /> Amenities
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaTools /> Amenity Name <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
                control: (provided) => ({
                  ...provided,
                  padding: "10px",
                  borderRadius: "20px",
                }),
              }}
              isMulti
              value={formData.amenities.map((amenity) => ({
                label: amenity,
                value: amenity,
              }))}
              onChange={handleAmenitiesChange}
              options={AmenitiesList.map((icon) => ({
                label: icon.label,
                value: icon.label,
              }))}
              placeholder="Select amenities..."
              required
            />
          </div>
        </div>

        <h4
          style={{
            background: "#2196f3",
            width: "220px",
            fontSize: "18px",
            color: "white",
          }}
        >
          <MdLabelImportant /> Day-wise Itinerary
        </h4>
        {formData.dayWise.map((day, index) => (
          <div key={index} className="form-row">
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Day <span style={{ color: "red" }}>*</span>
              </label>
              <select
                style={inputStyles}
                name="day"
                value={day.day}
                onChange={(e) => handleDayWiseChange(index, e)}
                required
              >
                <option value="">Select Day</option>
                {[...Array(30).keys()].map((i) => {
                  const dayOption = i + 1; // Creating day options from 1 to 100
                  return (
                    <option key={dayOption} value={dayOption}>
                      Day {dayOption}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>
                <FaCalendarAlt /> Description{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                type="text"
                style={inputStyles}
                name="description"
                value={day.description}
                onChange={(e) => handleDayWiseChange(index, e)}
                required
              />
            </div>
            <button
              type="button"
              className="remove-button"
              style={{ height: "60px", marginTop: "30px" }}
              onClick={() => handleRemoveDay(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="add-button" onClick={handleAddDay}>
          Add Day
        </button>
        <hr />
        <h4
          style={{
            background: "#2196f3",
            width: "220px",
            fontSize: "18px",
            color: "white",
          }}
        >
          <MdLabelImportant /> Terms & conditions
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label>
              <FaRegCheckCircle /> Cancellation Policy{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              type="text"
              style={inputStyles}
              name="cancellation"
              value={formData.termsAndConditions.cancellation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <FaRegCheckCircle /> Refund Policy{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              type="text"
              style={inputStyles}
              name="refund"
              value={formData.termsAndConditions.refund}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <FaRegCheckCircle /> Booking Policy{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              style={inputStyles}
              name="bookingPolicy" // Name must match the nested property
              value={formData.termsAndConditions.bookingPolicy} // Bind to the correct state property
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <hr />
        <h4
          style={{
            background: "#2196f3",
            width: "220px",
            fontSize: "18px",
            color: "white",
          }}
        >
          <MdLabelImportant /> Upload images
        </h4>
        {formData.images.map((image, index) => (
          <div key={index} className="form-row">
            <div className="form-group">
              <label>
                <FaFileImage /> Image {index + 1}{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                style={inputStyles}
                onChange={(e) => handleImageChange(index, e)}
              />
            </div>
            <button
              type="button"
              className="remove-button"
              style={{ height: "60px", marginTop: "20px" }}
              onClick={() => handleRemoveImage(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="add-button" onClick={handleAddImage}>
          Add Image
        </button>
        <hr />
        <div className="form-row">
          <button className="submit-button" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;

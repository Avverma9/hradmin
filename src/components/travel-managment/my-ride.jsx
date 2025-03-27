import React, { useState, useEffect } from "react";
import { getCarByOwnerId, updateCar } from "../redux/reducers/travel/car";
import { useDispatch, useSelector } from "react-redux";
import "./Cars.css";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill, BsPersonCircle } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";
import CarUpdate from "./car-update"; // Ensure this path is correct
import { FaLocationArrow, FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { fDate } from "../../../utils/format-time";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { updateStatus } from "../redux/reducers/partner";

const MyCar = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");
  const carData = useSelector((state) => state.car.ownerCar);

  useEffect(() => {
    if (userId) {
      dispatch(getCarByOwnerId(userId));
    }
  }, [userId, dispatch]);

  const handleCarImage = (car) => {
    return car?.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : "/public/assets/car.png";
  };

  // State to manage the modal and selected car data
  const [open, setOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // State to manage individual car status
  const [carStatus, setCarStatus] = useState({});

  // Function to open the modal with selected car
  const handleUpdate = (car) => {
    setSelectedCar(car);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCar(null);
  };

  const handleChangeRunningStatus = (e, car) => {
    const newStatus = e.target.value;
  
    // Update status in local state for the car
    setCarStatus((prevStatus) => ({
      ...prevStatus,
      [car._id]: newStatus,
    }));
  
    console.log("here is ", car?._id, newStatus);
  
    // Dispatch action to update the status in the Redux store
    dispatch(updateCar({ id: car._id, data: { runningStatus: newStatus } }))
      .unwrap()
      .then(() => {
        // Refetch the car data after updating the status
        dispatch(getCarByOwnerId(userId));
      })
      .catch((error) => {
        console.error("Error updating car status:", error);
      });
  };

  return (
    <div>
      <main className="cars-container">
        {carData?.length > 0 ? (
          carData?.map((car) => (
            <div className="car-card" key={car?._id}>
              {/* Car Header */}
              <div className="car-header">
                <span className="car-safety">{car?.runningStatus}</span>
                {car?.recommended && (
                  <div className="car-recommended-badge">
                    <span>Recommended</span>
                  </div>
                )}
              </div>

              {/* Car Content */}
              <div className="car-content">
                <img
                  src={handleCarImage(car)}
                  alt={car?.model}
                  className="car-image"
                />
                <div className="car-details">
                  <h3 className="car-title">
                    {car?.make} {car?.model} ({car?.color})
                  </h3>

                  {/* Left Side (4 details) */}
                  <div className="left-details">
                    <div className="fuel-type">
                      <BsFillFuelPumpFill /> {car?.fuelType}
                    </div>
                    <div>
                      <MdOutlineAirlineSeatReclineNormal /> {car?.seater} Seater
                    </div>
                    <div>
                      <FaPersonWalkingLuggage /> {car?.luggage} Luggage Bag
                    </div>
                    {car?.extraKm && (
                      <div style={{ color: "black" }}>
                        <IoMdSpeedometer /> ₹{car?.extraKm} Extra Per Km
                      </div>
                    )}
                  </div>

                  {/* Right Side (4 details) */}
                  <div className="right-details">
                    <div>
                      <BsPersonCircle /> Per Person: ₹{car?.perPersonCost}
                    </div>
                    <div>
                      <FaLocationArrow /> Pickup: {car?.from}
                    </div>
                    <div>
                      <FaMapMarkerAlt /> Drop: {car?.to}
                    </div>
                    <div>
                      <AiOutlineCalendar /> From {fDate(car?.availableFrom)} to{" "}
                      {fDate(car?.availableTo)}
                    </div>
                  </div>
                </div>

                {/* Car Badges */}
                <div className="car-badges">
                  {car?.badges?.map((badge, index) => (
                    <div key={index} className="car-badge">
                      {badge}
                    </div>
                  ))}
                </div>
              </div>

              {/* Car Footer */}
              <div className="car-footer">
                {/* Status Select */}
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id={`status-select-label-${car._id}`}>
                    Change Running Status
                  </InputLabel>
                  <Select
                    labelId={`status-select-label-${car._id}`}
                    id={`status-select-${car._id}`}
                    value={carStatus[car._id] || car?.runningStatus || ""}
                    onChange={(e) => handleChangeRunningStatus(e, car)}
                    label="Change Running Status"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="On A Trip">On A Trip</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                  </Select>
                </FormControl>

                {/* Update Button */}
                <button className="book-now" onClick={() => handleUpdate(car)}>
                  Update
                </button>
              </div>
            </div>
          ))
        ) : (
          <img
            src="https://assets-v2.lottiefiles.com/a/0e30b444-117c-11ee-9b0d-0fd3804d46cd/BkQxD7wtnZ.gif"
            alt="Loading..."
            className="loading-gif"
          />
        )}
      </main>

      {open && selectedCar && (
        <CarUpdate open={open} onClose={handleClose} car={selectedCar} />
      )}
    </div>
  );
};

export default MyCar;

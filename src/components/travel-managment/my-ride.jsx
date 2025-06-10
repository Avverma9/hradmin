import React, { useState, useEffect } from "react";
import { getCarByOwnerId, updateCar } from "../redux/reducers/travel/car";
import { useDispatch, useSelector } from "react-redux";
import "./Cars.css";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill, BsPersonCircle } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";
import CarUpdate from "./car-update";
import { FaLocationArrow, FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { fDate } from "../../../utils/format-time";
import { DialogTitle, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import SeatConfigUpdate from "./update-seats";

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
      : "https://avverma.s3.ap-south-1.amazonaws.com/car.png";
  };


  // Separate states for different modals
  const [openCarUpdate, setOpenCarUpdate] = useState(false);
  const [openSeatConfig, setOpenSeatConfig] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // State to manage individual car status
  const [carStatus, setCarStatus] = useState({});

  // Open Car Update Modal
  const handleUpdateCar = (car) => {
    setSelectedCar(car);
    setOpenCarUpdate(true);
  };

  // Open Seat Config Modal
  const handleUpdateSeats = (car) => {
    setSelectedCar(car);
    setOpenSeatConfig(true);
  };

  // Close Car Update Modal
  const handleCloseCarUpdate = () => {
    setOpenCarUpdate(false);
    setSelectedCar(null);
  };

  // Close Seat Config Modal
  const handleCloseSeatConfig = () => {
    setOpenSeatConfig(false);
    setSelectedCar(null);
  };

  const handleChangeRunningStatus = (e, car) => {
    const newStatus = e.target.value;

    // Update status in local state for the car
    setCarStatus((prevStatus) => ({
      ...prevStatus,
      [car._id]: newStatus,
    }));


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
                      <FaLocationArrow /> Pickup: {car?.pickupP}
                    </div>
                    <div>
                      <FaMapMarkerAlt /> Drop: {car?.dropP}
                    </div>
                    <div>
                      <AiOutlineCalendar /> From {fDate(car?.pickupD)} to{" "}
                      {fDate(car?.dropD)}
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
              <DialogTitle> Seats →
             Available:{" "}
              {
                car?.seatConfig.filter(
                  (seat) => !seat.bookedBy || seat.bookedBy.trim() === "",
                ).length
              }{" "}
              / Booked:{" "}
              {
                car?.seatConfig.filter(
                  (seat) => seat.bookedBy && seat.bookedBy.trim() !== "",
                ).length
              }</DialogTitle>
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
                    <MenuItem value=""> </MenuItem>
                    <MenuItem value="On A Trip">On A Trip</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                  </Select>
                </FormControl>

                {/* Update Button */}
                <button
                  className="book-now"
                  onClick={() => handleUpdateCar(car)}
                >
                  Update Car
                </button>

                <button
                  className="book-now"
                  onClick={() => handleUpdateSeats(car)}
                >
                  Update Seats
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

      {/* Car Update Modal */}
      {openCarUpdate && selectedCar && (
        <CarUpdate
          open={openCarUpdate}
          onClose={handleCloseCarUpdate}
          car={selectedCar}
        />
      )}

      {/* Seat Config Update Modal */}
      {openSeatConfig && selectedCar && (
        <SeatConfigUpdate
          open={openSeatConfig}
          onClose={handleCloseSeatConfig}
          car={selectedCar}
        />
      )}
    </div>
  );
};

export default MyCar;

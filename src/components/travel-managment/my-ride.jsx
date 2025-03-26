import React, { useState, useEffect } from "react";
import { getCarByOwnerId } from "../redux/reducers/travel/car";
import { useDispatch, useSelector } from "react-redux";
import "./Cars.css";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";
import CarUpdate from "./car-update";

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
  const [open, setIsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // Function to open the modal with selected car
  const handleUpdate = (car) => {
    setSelectedCar(car);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <main className="cars-container">
        {carData && carData.length > 0 ? (
          carData.map((car) => (
            <div className="car-card" key={car?._id}>
              <div className="car-header">
                <span className="car-safety">{car?.runningStatus}</span>
                {car?.recommended && (
                  <div className="car-recommended-badge">
                    <span>Recommended</span>
                  </div>
                )}
              </div>

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
                  <div className="fuel-type">
                    <BsFillFuelPumpFill /> {car?.fuelType}
                  </div>
                  <div className="seats-and-luggage">
                    <span>
                      <MdOutlineAirlineSeatReclineNormal /> {car?.seater}{" "}
                      Seater
                    </span>
                    <span>
                      <FaPersonWalkingLuggage /> {car?.luggage} Luggage Bag
                    </span>
                    {car?.extraKm && (
                      <span style={{ color: "black" }}>
                        <IoMdSpeedometer /> {car?.extraKm}₹ Extra Per Km
                      </span>
                    )}
                  </div>
                  <div className="car-badges">
                    {car?.badges?.map((badge, index) => (
                      <div key={index} className="car-badge">
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="car-footer">
                <div className="car-price">₹ {car?.price}</div>
                <button
                  className="book-now"
                  onClick={() => handleUpdate(car)}
                >
                  Update
                </button>
              </div>
            </div>
          ))
        ) : (
          <img
            src="https://assets-v2.lottiefiles.com/a/0e30b444-117c-11ee-9b0d-0fd3804d46cd/BkQxD7wtnZ.gif"
            alt="Loading..."
          />
        )}
      </main>
      {open && selectedCar && (
        <CarUpdate
          open={open}
          onClose={handleClose}
          car={selectedCar}
        />
      )}
    </div>
  );
};

export default MyCar;

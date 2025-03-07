import React, { useEffect, useState } from "react";
import "./Cars.css";
import { useDispatch, useSelector } from "react-redux";
import { filterCar, getAllCars } from "../redux/reducers/travel/car";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";

const Cars = () => {
  const dispatch = useDispatch();
  const cars = useSelector((state) => state.car.data);
  const [filteredCars, setFilteredCars] = useState(cars);
  const [filters, setFilters] = useState({
    make: [],
    fuelType: [],
  });

  useEffect(() => {
    dispatch(getAllCars());
  }, [dispatch]);

  useEffect(() => {
    setFilteredCars(cars);
  }, [cars]);

  useEffect(() => {
    let filtered = cars;

    if (filters.make.length > 0) {
      filtered = filtered.filter((car) => filters.make.includes(car.make));
    }

    if (filters.fuelType.length > 0) {
      filtered = filtered.filter((car) =>
        filters.fuelType.includes(car.fuelType),
      );
    }

    setFilteredCars(filtered);
  }, [filters, cars]);

  const handleCarImage = (car) => {
    return car?.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : "/public/assets/car.png";
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(
          (item) => item !== value,
        );
      } else {
        newFilters[filterType].push(value);
      }
      dispatch(filterCar({ query: filterType, value })); // Dispatch the filter action
      return newFilters;
    });
  };

  return (
    <div className="cars-page">
      <header className="car-upper-header">
        <div className="car-header-left">
          <div className="car-search-fields">
            <input type="text" placeholder="From" />
            <input type="text" placeholder="To" />
          </div>
          <div className="car-header-right">
            <button>Search</button>
          </div>
        </div>
      </header>

      <div className="car-layout">
        <aside className="car-sidebar">
          <div className="car-filter">
            <h3>Car Type</h3>
            <div>
              {Array.from(new Set(cars?.map((car) => car.make))).map((make) => (
                <label key={make}>
                  <input
                    type="checkbox"
                    checked={filters.make.includes(make)}
                    onChange={() => handleFilterChange("make", make)}
                  />{" "}
                  {make}
                </label>
              ))}
            </div>
          </div>

          <div className="car-filter">
            <h3>Fuel Type</h3>
            <div>
              {Array.from(new Set(cars?.map((car) => car.fuelType))).map(
                (fuelType) => (
                  <label key={fuelType}>
                    <input
                      type="checkbox"
                      checked={filters.fuelType.includes(fuelType)}
                      onChange={() => handleFilterChange("fuelType", fuelType)}
                    />{" "}
                    {fuelType}
                  </label>
                ),
              )}
            </div>
          </div>
        </aside>

        <main className="cars-container">
          {filteredCars?.length > 0 ? (
            filteredCars.map((car) => (
              <div className="car-card" key={car?._id}>
                <div className="car-header">
                  <span className="car-safety">Safety</span>
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
                  <button className="book-now">Book Now</button>
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
      </div>
    </div>
  );
};

export default Cars;

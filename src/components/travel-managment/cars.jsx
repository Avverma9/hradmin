import React, { useEffect, useState } from "react";
import "./Cars.css";
import { useDispatch, useSelector } from "react-redux";
import { filterCar, getAllCars } from "../redux/reducers/travel/car";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";
import { useLoader } from "../../../utils/loader";

const Cars = () => {
  const dispatch = useDispatch();
  const cars = useSelector((state) => state.car.data);
  const { showLoader, hideLoader } = useLoader();
  const [filteredCars, setFilteredCars] = useState([]);
  const [filters, setFilters] = useState({
    make: [],
    fuelType: [],
  });

  // Fetch cars only once
  useEffect(() => {
    const fetchCars = async () => {
      showLoader();
      await dispatch(getAllCars());
      hideLoader();
    };

    fetchCars();
  }, [dispatch]);

  // Update filtered cars when the cars or filters change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = cars;

      if (filters.make.length > 0) {
        filtered = filtered.filter((car) => filters.make.includes(car.make));
      }

      if (filters.fuelType.length > 0) {
        filtered = filtered.filter((car) =>
          filters.fuelType.includes(car.fuelType)
        );
      }

      setFilteredCars(filtered);
    };

    applyFilters();
  }, [cars, filters]);

  // Handle car image source
  const handleCarImage = (car) => {
    return car?.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : "/public/assets/car.png";
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      const filterList = newFilters[filterType];
      const filterIndex = filterList.indexOf(value);

      if (filterIndex >= 0) {
        filterList.splice(filterIndex, 1); // Remove filter
      } else {
        filterList.push(value); // Add filter
      }

      // Apply the filter directly to the store
      dispatch(filterCar({ query: filterType, value }));

      return newFilters;
    });
  };

  // Render car cards
  const renderCars = () => {
    if (filteredCars.length === 0) {
      return (
        <img
          src="https://assets-v2.lottiefiles.com/a/0e30b444-117c-11ee-9b0d-0fd3804d46cd/BkQxD7wtnZ.gif"
          alt="Loading..."
        />
      );
    }

    return filteredCars.map((car) => (
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
                <MdOutlineAirlineSeatReclineNormal /> {car?.seater} Seater
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
    ));
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
                )
              )}
            </div>
          </div>
        </aside>

        <main className="cars-container">{renderCars()}</main>
      </div>
    </div>
  );
};

export default Cars;

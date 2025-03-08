import React, { useEffect, useState } from "react";
import "./Cars.css";
import { useDispatch, useSelector } from "react-redux";
import { filterCar, getAllCars } from "../redux/reducers/travel/car";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";
import axios from "axios";
import { localUrl } from "../../../utils/util";
import { CiSearch } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
const Cars = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const filterList = useSelector((state) => state.car.data);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filters, setFilters] = useState({
    make: [],
    fuelType: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await dispatch(getAllCars());
      setData(response.payload);
    };
    fetchData();
  }, [dispatch]);

  const handleFilterChange = async (key, value) => {
    const newFilters = { ...filters };
    const currentFilterValues = newFilters[key];

    if (currentFilterValues.includes(value)) {
      // If value is already selected, uncheck it
      newFilters[key] = currentFilterValues.filter((item) => item !== value);
    } else {
      // Otherwise, add the new value to the filter
      newFilters[key] = [...currentFilterValues, value];
    }

    setFilters(newFilters);

    // If all filters are unchecked, reset data by calling getAllCars
    if (newFilters.make.length === 0 && newFilters.fuelType.length === 0) {
      const response = await dispatch(getAllCars());
      setData(response.payload);
    } else {
      const response = await dispatch(filterCar({ query: key, value }));
      setData(response.payload);
    }
  };

  const handleCarImage = (car) => {
    return car?.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : "/public/assets/car.png";
  };

  const handleSearch = async () => {
    if (!from || !to) return;

    const response = await axios.get(
      `${localUrl}/travel/filter-car/by-query?from=${from}&to=${to}`,
    );
    setData(response.data);
  };

  const handleClear =  () => {
window.location.reload();
  };

  return (
    <div className="cars-page">
      <header className="car-upper-header">
        <div className="car-header-left">
          <div className="car-search-fields">
            <input
              type="text"
              placeholder="From"
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="text"
              placeholder="To"
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="car-header-right">
            <button onClick={handleSearch}><CiSearch/></button>
          </div>
          <div className="car-header-right">
            <button onClick={handleClear}><RxCross1/></button>
          </div>
        </div>
      </header>

      <div className="car-layout">
        <aside className="car-sidebar">
          <div className="car-filter">
          <h5 style={{ backgroundColor: '#f2f2f2', borderRadius: '10px', padding: '10px', fontSize: '13px', color: 'black', fontWeight: 'bold', textAlign: 'center' }}>
        Car Type
      </h5>
            <div>
              {Array.from(new Set(filterList?.map((car) => car.make))).map(
                (make) => (
                  <label key={make}>
                    <input
                      type="checkbox"
                      checked={filters.make.includes(make)}
                      onChange={() => handleFilterChange("make", make)}
                    />{" "}
                    {make}
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="car-filter">
          <h5 style={{ backgroundColor: '#f2f2f2', borderRadius: '10px', padding: '10px', fontSize: '13px', color: 'black', fontWeight: 'bold', textAlign: 'center' }}>
        Fuel Type
      </h5>
            <div>
              {Array.from(new Set(filterList?.map((car) => car.fuelType))).map(
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
          {data?.length > 0 ? (
            data.map((car) => (
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

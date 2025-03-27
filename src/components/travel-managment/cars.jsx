import React, { useEffect, useState } from "react";
import "./Cars.css";
import { useDispatch, useSelector } from "react-redux";
import { filterCar, getAllCars } from "../redux/reducers/travel/car";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { BsFillFuelPumpFill, BsPersonCircle } from "react-icons/bs";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { IoMdSpeedometer } from "react-icons/io";
import axios from "axios";
import { localUrl } from "../../../utils/util";
import { CiSearch } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import { Button, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns"; // Import format from date-fns
import SeatData from "./seat-data";
import { FaLocationArrow, FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { fDate } from "../../../utils/format-time";

const Cars = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [openSeatData, setOpenSeatData] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);  // Track selected car ID
  
  const filterList = useSelector((state) => state.car.data);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filters, setFilters] = useState({
    make: [],
    fuelType: [],
  });
  const [fromDate, setFromDate] = useState("");  // New state for from date
  const [toDate, setToDate] = useState("");  // New state for to date

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
      newFilters[key] = currentFilterValues.filter((item) => item !== value);
    } else {
      newFilters[key] = [...currentFilterValues, value];
    }

    setFilters(newFilters);

    if (newFilters.make.length === 0 && newFilters.fuelType.length === 0) {
      const response = await dispatch(getAllCars());
      setData(response.payload);
    } else {
      const response = await dispatch(filterCar({ query: key, value }));
      setData(response.payload);
    }
  };

  const handleSeatDataOpen = (carId) => {
    setSelectedCarId(carId);  // Set the selected car ID
    setOpenSeatData(true);     // Open the SeatData component
  };
  
  const handleSeatDataClose = () => {
    setOpenSeatData(false);  // Close the SeatData component
  };


  const handleCarImage = (car) => {
    return car?.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : "/public/assets/car.png";
  };

 
  const handleSearch = async () => {
    // Check if either pickup and drop locations are empty or dates are empty
    if ((!from || !to) && (!fromDate || !toDate)) {
      return; // Don't make API call if both location and dates are empty
    }

    // Format dates to YYYY-MM-DD
    const formattedFromDate = fromDate ? format(fromDate, "yyyy-MM-dd") : "";
    const formattedToDate = toDate ? format(toDate, "yyyy-MM-dd") : "";

    // Construct the API URL with location and date filters
    const queryParams = [
      from && `from=${from}`,
      to && `to=${to}`,
      formattedFromDate && `availableFrom=${formattedFromDate}`,
      formattedToDate && `availableTo=${formattedToDate}`,
    ]
      .filter(Boolean)
      .join("&");

    // Proceed with the API call
    const response = await axios.get(`${localUrl}/travel/filter-car/by-query?${queryParams}`);
    setData(response.data);
  };

  const handleClear = () => {
    window.location.reload();
  };

  return (
    <div className="cars-page">
      <header className="car-upper-header">
        <div className="car-header-left">
          <TextField
            label="Pickup Location"
            variant="outlined"
            fullWidth
            margin="normal"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            sx={{
              width: "200px",
              height: "40px",
              marginBottom: "16px",
            }}
          />

          <TextField
            label="Drop Location"
            variant="outlined"
            fullWidth
            margin="normal"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            sx={{
              width: "200px",
              height: "40px",
              marginBottom: "16px",
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Pick From"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="Pick From"
                  sx={{
                    width: "200px",
                    height: "40px",
                    marginBottom: "16px",
                  }}
                />
              )}
            />

            <DatePicker
              label="Pick To"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="Pick To"
                  sx={{
                    width: "200px",
                    height: "40px",
                    marginBottom: "16px",
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            startIcon={<CiSearch />}
            sx={{ marginTop: "16px" }}
          />
          

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            startIcon={<RxCross1 />}
            sx={{ marginTop: "16px" }}
          />
        </div>
      </header>

      <div className="car-layout">
        <aside className="car-sidebar">
          <div className="car-filter">
            <h5
              style={{
                backgroundColor: "#f2f2f2",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "13px",
                color: "black",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
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
                )
              )}
            </div>
          </div>

          <div className="car-filter">
            <h5
              style={{
                backgroundColor: "#f2f2f2",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "13px",
                color: "black",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
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
                )
              )}
            </div>
          </div>
        </aside>

        <main className="cars-container">
  {data?.length > 0 ? (
    data?.map((car) => (
      <div className="car-card" key={car?._id}>
        {/* Car Header */}
        <div className="car-header">
          <span className="car-safety">Safety</span>
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
                <AiOutlineCalendar /> From {fDate(car?.availableFrom)}  to {fDate(car?.availableTo)}
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
          <div className="car-price">₹{car?.price}</div>
          <button
            className="book-now"
            onClick={() => handleSeatDataOpen(car._id)}
          >
            Book Now
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



      </div>
      <SeatData open={openSeatData} onClose={handleSeatDataClose} id={selectedCarId} />
    </div>
  );
};

export default Cars;

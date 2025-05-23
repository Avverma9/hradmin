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
import { Button, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns"; // Import format from date-fns
import SeatData from "./seat-data";
import { FaLocationArrow, FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { indianTime } from "../../../utils/format-time";
import { useLoader } from "../../../utils/loader";

const Cars = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [openSeatData, setOpenSeatData] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null); // Track selected car ID
  const { showLoader, hideLoader } = useLoader()
  const filterList = useSelector((state) => state.car.data);
  const [pickupP, sePickupP] = useState("");
  const [dropP, setDropP] = useState("");
  const [filters, setFilters] = useState({
    make: [],
    fuelType: [],
  });
  const [fromDate, setFromDate] = useState(""); // New state for from date
  const [toDate, setToDate] = useState(""); // New state for to date

  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const response = await dispatch(getAllCars());
        setData(response.payload);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
      } finally {
        hideLoader();
      }
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
    showLoader();

    try {
      if (newFilters.make.length === 0 && newFilters.fuelType.length === 0) {
        const response = await dispatch(getAllCars());
        setData(response.payload);
      } else {
        const response = await dispatch(filterCar({ query: key, value }));
        setData(response.payload);
      }
    } catch (error) {
      console.error("Filter failed:", error);
    } finally {
      hideLoader();
    }
  };


  const handleSeatDataOpen = (carId) => {
    setSelectedCarId(carId); // Set the selected car ID
    setOpenSeatData(true); // Open the SeatData component
  };

  const handleSeatDataClose = () => {
    setOpenSeatData(false); // Close the SeatData component
  };

  const handleCarImage = (car) => {
    return car?.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images[0]
      : "https://avverma.s3.ap-south-1.amazonaws.com/car.png";
  };

  const handleSearch = async () => {
    if ((!pickupP || !dropP) && (!fromDate || !toDate)) return;

    const formattedFromDate = fromDate ? format(fromDate, "yyyy-MM-dd") : "";
    const formattedToDate = toDate ? format(toDate, "yyyy-MM-dd") : "";

    const queryParams = [
      pickupP && `pickupP=${pickupP}`,
      dropP && `dropP=${dropP}`,
      formattedFromDate && `pickupD=${formattedFromDate}`,
      formattedToDate && `dropD=${formattedToDate}`,
    ]
      .filter(Boolean)
      .join("&");

    showLoader();

    try {
      const response = await axios.get(`${localUrl}/travel/filter-car/by-query?${queryParams}`);
      setData(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      hideLoader();
    }
  };

  const handleClear = () => {
    window.location.reload();
  };

  return (
    <div className="cars-page">
      <header className="car-upper-header">
        <div className="car-header-row">
          <TextField
            label="Pickup"
            variant="outlined"
            value={pickupP}
            onChange={(e) => sePickupP(e.target.value)}
            sx={{ width: 140 }}
          />

          <TextField
            label="Drop"
            variant="outlined"
            value={dropP}
            onChange={(e) => setDropP(e.target.value)}
            sx={{ width: 140 }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} sx={{ width: 130 }} />
              )}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="To"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} sx={{ width: 130 }} />
              )}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            startIcon={<CiSearch />}
            sx={{ height: 40, fontSize: '12px', padding: '6px 12px' }}
          >
            Search
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            startIcon={<RxCross1 />}
            sx={{ height: 40, fontSize: '12px', padding: '6px 12px' }}
          >
            Clear
          </Button>
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
                ),
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
                ),
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
                  <span className="car-safety">
                    {" "}
                    <h3 className="car-title">
                      {car?.make} {car?.model} ({car?.color})
                    </h3>{" "}
                    {car?.runningStatus}
                  </span>
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
                    {/* Left Side (4 details) */}
                    <div className="left-details">
                      <div className="fuel-type">
                        <BsFillFuelPumpFill /> {car?.fuelType}
                      </div>
                      <div>
                        <MdOutlineAirlineSeatReclineNormal /> {car?.seater}{" "}
                        Seater
                      </div>
                      <div>
                        <FaPersonWalkingLuggage /> {car?.luggage} Luggage Bag
                      </div>
                      {car?.extraKm && (
                        <div style={{ color: "black" }}>
                          <IoMdSpeedometer /> ₹{car?.extraKm} Extra Per Km
                        </div>
                      )}
                      <div> Full Ride @₹{car?.price}</div>
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
                      <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AiOutlineCalendar style={{ fontSize: '18px' }} />
                        Pickup & drop time {indianTime(car?.pickupD)} to {indianTime(car?.dropD)}
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
                <Typography>
                  Available:{" "}
                  {
                    car?.seatConfig.filter(
                      (seat) => !seat.bookedBy || seat.bookedBy.trim() === "",
                    ).length
                  }{" "}
                  Seats
                </Typography>
                {/* Car Footer */}
                <div className="car-footer">
                  <div className="car-price">₹{car?.price}</div>
                  <button
                    className="book-now"
                    onClick={() => handleSeatDataOpen(car._id)}
                  >
                    Book Now
                  </button>
                </div> <SeatData
                  open={openSeatData}
                  carData={car}
                  onClose={handleSeatDataClose}
                  id={selectedCarId}
                />
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

    </div>
  );
};

export default Cars;

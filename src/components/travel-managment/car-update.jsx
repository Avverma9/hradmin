import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  FormHelperText,
  Grid,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateCar } from "../redux/reducers/travel/car";
import AlertDialog from "../../../utils/alertDialogue";
import { userId } from "../../../utils/util";
import { PhotoCamera, Speed } from "@mui/icons-material";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaLocationArrow } from "react-icons/fa";

export default function CarUpdate({ car, onClose, open }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState("");
  const [from, setFrom] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [perPersonCost, setPerPersonCost] = useState("");
  const [to, setTo] = useState("");
  const [seater, setSeater] = useState("");
  const [extraKm, setExtraKm] = useState("");
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [runningStatus, setRunningStatus] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [allCarData, setAllCarData] = useState([]);
  const [makes, setMakes] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [seatConfig, setSeatConfig] = useState([]);
  const [showSeatConfig, setShowSeatConfig] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append updated data or retain existing data as fallback
    formData.append("make", make || car.make);
    formData.append("model", model || car.model);
    formData.append("year", year || car.year);
    formData.append("carNumber", car.carNumber);
    formData.append("price", price || car.price);
    formData.append("from", from || car.from);
    formData.append("to", to || car.to);
    formData.append("availableFrom", availableFrom || car.availableFrom);
    formData.append("availableTo", availableTo || car.availableTo);
    formData.append("color", color || car.color);
    formData.append("mileage", mileage || car.mileage);
    formData.append("fuelType", fuelType || car.fuelType);
    formData.append("transmission", transmission || car.transmission);
    formData.append("perPersonCost", perPersonCost || car.perPersonCost);
    formData.append("extraKm", extraKm || car.extraKm);
    formData.append("isAvailable", isAvailable);

    // Append images if updated
    if (images.length > 0) {
      Array.from(images).forEach((file) => formData.append("images", file));
    }

    // Append seat configuration
    seatConfig.forEach((seat, index) => {
      formData.append(
        `seatConfig[${index}]`,
        JSON.stringify({
          seatType: seat.seatType,
          seatNumber: seat.seatNumber,
          seatPrice: seat.seatPrice,
          isBooked: seat.isBooked,
          bookedBy: seat.bookedBy,
        }),
      );
    });

    // Dispatch update action with car._id
    await dispatch(updateCar({ id: car._id, data: formData }));
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogConfirm = async () => {
    setOpenDialog(false);
  
  };

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response1 = await fetch(
          "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100",
        );
        const data1 = await response1.json();
        const carData1 = data1.results;

        const response2 = await fetch(
          "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100&refine=fueltype1%3A%22Regular%20Gasoline%22",
        );
        const data2 = await response2.json();
        const carData2 = data2.results;

        const combinedCarData = [...carData1, ...carData2];
        setAllCarData(combinedCarData);

        const uniqueMakes = [
          ...new Set(combinedCarData.map((car) => car.make)),
        ];
        setMakes(uniqueMakes);

        setFilteredModels(combinedCarData);
      } catch (err) {
        console.error("Error fetching car data:", err);
      }
    };

    fetchCarData();
  }, []);


  useEffect(() => {
    if (make) {
      setFilteredModels(allCarData.filter((car) => car.make === make));
    } else {
      setFilteredModels(allCarData);
    }
  }, [make, allCarData]);

  const handleSeaterChange = (e) => {
    setSeater(e.target.value);
    setShowSeatConfig(false); // Hide the seat configuration when seater is selected
  };

  useEffect(() => {
    if (car) {
      setMake(car.make || "");
      setModel(car.model || "");
      setYear(car.year || "");
      setCarNumber(car.carNumber || "");
      setImages([]); // Optional: fresh upload only
      setPrice(car.price || "");
      setFrom(car.from || "");
      setTo(car.to || "");
      setAvailableFrom(car.availableFrom || "");
      setAvailableTo(car.availableTo || "");
      setPerPersonCost(car.perPersonCost || "");
      setSeater(car.seater || "");
      setExtraKm(car.extraKm || "");
      setColor(car.color || "");
      setMileage(car.mileage || "");
      setFuelType(car.fuelType || "");
      setTransmission(car.transmission || "");
      setRunningStatus(car.runningStatus || "");
      setIsAvailable(car.isAvailable !== undefined ? car.isAvailable : true);
    }
  }, [car]);
  
  
  return (
    <Dialog onClose={onClose} open={open} maxWidth="xl">
      <DialogContent sx={{ width: "80vw", p: 3 }}>
        <Box
          sx={{
            border: "2px dotted #000",
            borderRadius: 1,
            padding: "8px",
            display: "inline-block",
          }}
        >
          <Typography variant="p5" align="center" gutterBottom>
            Update Car Details
          </Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="outlined" color="primary" onClick={onClose}>
            Close
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Basic Car Info */}
          <Grid item xs={12} sm={4}>
            <Autocomplete
              value={make}
              onChange={(e, newValue) => setMake(newValue)}
              options={makes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Make"
                  variant="outlined"
                  fullWidth
                />
              )}
              freeSolo
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Autocomplete
              value={model}
              onChange={(e, newValue) => setModel(newValue)}
              options={filteredModels.map((car) => car.model)}
              renderInput={(params) => (
                <TextField {...params} label="Model" variant="outlined" />
              )}
              fullWidth
              margin="normal"
              freeSolo
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Year"
              fullWidth
              type="number"
              variant="outlined"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Car Number"
              fullWidth
              type="text"
              variant="outlined"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
            />
          </Grid>

          {/* Color, Seater, Fuel Type */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                label="Color"
              >
                {["Red", "Blue", "Black", "White", "Silver", "Green"].map(
                  (clr) => (
                    <MenuItem key={clr} value={clr}>
                      {clr}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Seater</InputLabel>
              <Select
                value={seater}
                onChange={handleSeaterChange}
                label="Seater"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
              {seater === "" && (
                <FormHelperText error>
                  Please select the number of seats
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                label="Fuel Type"
              >
                {["Petrol", "Diesel", "Electric", "Hybrid"].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Transmission, Mileage, Location */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Transmission</InputLabel>
              <Select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                label="Transmission"
              >
                <MenuItem value="Automatic">Automatic</MenuItem>
                <MenuItem value="Manual">Manual</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Mileage (KM/L)"
              fullWidth
              type="number"
              variant="outlined"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Speed />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Pickup Location"
              fullWidth
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaLocationArrow />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Drop Location"
              fullWidth
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaLocationArrow />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Dates */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Available From"
              type="date"
              fullWidth
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Available To"
              type="date"
              fullWidth
              value={availableTo}
              onChange={(e) => setAvailableTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Full Ride Price"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaIndianRupeeSign />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Per Person Cost"
              type="number"
              fullWidth
              value={perPersonCost}
              onChange={(e) => setPerPersonCost(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaIndianRupeeSign />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Extra KM Charge"
              fullWidth
              value={extraKm}
              onChange={(e) => setExtraKm(e.target.value)}
            />
            {extraKm === "" && (
              <FormHelperText error>
                Please mention Extra KM Charge
              </FormHelperText>
            )}
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <input
              type="file"
              id="carImages"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="carImages">
              <Button
                variant="outlined"
                color="primary"
                component="span"
                fullWidth
                startIcon={<PhotoCamera />}
              >
                Select Car Images
              </Button>
            </label>
            {images.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                {Array.from(images).map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Car Image ${index}`}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      margin: "5px",
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Update
        </Button>
      </DialogContent>
    </Dialog>
  );
}

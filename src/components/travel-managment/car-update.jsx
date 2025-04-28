import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
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
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateCar } from "../redux/reducers/travel/car";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaLocationArrow } from "react-icons/fa";
import { PhotoCamera, Speed } from "@mui/icons-material";

export default function CarUpdate({ car, onClose, open }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState("");
  const [pickupP, setPickupP] = useState("");
  const [pickupD, setPickupD] = useState("");
  const [dropD, setDropD] = useState("");
  const [perPersonCost, setPerPersonCost] = useState("");
  const [dropP, setDropP] = useState("");
  const [seater, setSeater] = useState("");
  const [extraKm, setExtraKm] = useState("");
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [allCarData, setAllCarData] = useState([]);
  const [makes, setMakes] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("make", make || car.make);
    formData.append("model", model || car.model);
    formData.append("year", year || car.year);
    formData.append("carNumber", car.carNumber);
    formData.append("price", price || car.price);
    formData.append("pickupP", pickupP || car.pickupP);
    formData.append("dropP", dropP || car.dropP);
    formData.append("pickupD", pickupD || car.pickupD);
    formData.append("dropD", dropD || car.dropD);
    formData.append("color", color || car.color);
    formData.append("mileage", mileage || car.mileage);
    formData.append("fuelType", fuelType || car.fuelType);
    formData.append("transmission", transmission || car.transmission);
    formData.append("perPersonCost", perPersonCost || car.perPersonCost);
    formData.append("extraKm", extraKm || car.extraKm);
    formData.append("isAvailable", isAvailable);

    if (images.length > 0) {
      Array.from(images).forEach((file) => formData.append("images", file));
    }

    await dispatch(updateCar({ id: car._id, data: formData }));
  };

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await fetch(
          "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100"
        );
        const data = await response.json();
        const combinedCarData = data.results;
        setAllCarData(combinedCarData);

        const uniqueMakes = [...new Set(combinedCarData.map((car) => car.make))];
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

  useEffect(() => {
    if (car) {
      setMake(car.make || "");
      setModel(car.model || "");
      setYear(car.year || "");
      setCarNumber(car.carNumber || "");
      setImages([]);
      setPrice(car.price || "");
      setPickupP(car.pickupP || "");
      setDropP(car.dropP || "");
      setPickupD(car.pickupD || "");
      setDropD(car.dropD || "");
      setPerPersonCost(car.perPersonCost || "");
      setSeater(car.seater || "");
      setExtraKm(car.extraKm || "");
      setColor(car.color || "");
      setMileage(car.mileage || "");
      setFuelType(car.fuelType || "");
      setTransmission(car.transmission || "");
      setIsAvailable(car.isAvailable !== undefined ? car.isAvailable : true);
    }
  }, [car]);

  return (
    <Dialog onClose={onClose} open={open} maxWidth="xl">
      <DialogContent sx={{ width: "80vw", p: 3 }}>
        <Box sx={{ border: "2px dotted #000", borderRadius: 1, padding: "8px", display: "inline-block" }}>
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
          <Grid item xs={12} sm={4}>
            <Autocomplete
              value={make}
              onChange={(e, newValue) => setMake(newValue)}
              options={makes}
              renderInput={(params) => <TextField {...params} label="Make" variant="outlined" fullWidth />}
              freeSolo
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Autocomplete
              value={model}
              onChange={(e, newValue) => setModel(newValue)}
              options={filteredModels.map((car) => car.model)}
              renderInput={(params) => <TextField {...params} label="Model" variant="outlined" />}
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

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select value={color} onChange={(e) => setColor(e.target.value)} label="Color">
                {["Red", "Blue", "Black", "White", "Silver", "Green"].map((clr) => (
                  <MenuItem key={clr} value={clr}>
                    {clr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Seater</InputLabel>
              <Select value={seater} onChange={(e) => setSeater(e.target.value)} label="Seater">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select value={fuelType} onChange={(e) => setFuelType(e.target.value)} label="Fuel Type">
                {["Petrol", "Diesel", "Electric", "Hybrid"].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Transmission</InputLabel>
              <Select value={transmission} onChange={(e) => setTransmission(e.target.value)} label="Transmission">
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
                startAdornment: <InputAdornment position="start"><Speed /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Pickup Location"
              fullWidth
              value={pickupP}
              onChange={(e) => setPickupP(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FaLocationArrow /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Drop Location"
              fullWidth
              value={dropP}
              onChange={(e) => setDropP(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FaLocationArrow /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Available From"
              type="date"
              fullWidth
              value={pickupD}
              onChange={(e) => setPickupD(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Available To"
              type="date"
              fullWidth
              value={dropD}
              onChange={(e) => setDropD(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Full Ride Price"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FaIndianRupeeSign /></InputAdornment>,
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
                startAdornment: <InputAdornment position="start"><FaIndianRupeeSign /></InputAdornment>,
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
          </Grid>

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
              <Button variant="outlined" color="primary" component="span" fullWidth startIcon={<PhotoCamera />}>
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

        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
          Update
        </Button>
      </DialogContent>
    </Dialog>
  );
}

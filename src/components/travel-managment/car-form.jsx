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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCar } from "../redux/reducers/travel/car";
import AlertDialog from "../../../utils/alertDialogue";
import { userId } from "../../../utils/util";
import { PhotoCamera, Speed } from "@mui/icons-material";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaLocationArrow } from "react-icons/fa";

export default function CarForm() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState("");
  const [from, setFrom] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [perPersonCost, setPerPersonCost] = useState("");
  const [to, setTo] = useState("");
  const [seater, setSeater] = useState("");
  const [extraKm, setExtraKm] = useState("");
  const [runningStatus, setRunningStatus] = useState("");
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [ownerId, setOwnerId] = useState(userId);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [allCarData, setAllCarData] = useState([]);
  const [makes, setMakes] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [seatConfig, setSeatConfig] = useState([]);
  const [showSeatConfig, setShowSeatConfig] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleToggleVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleDialogConfirm = async () => {
    setOpenDialog(false);
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }
    formData.append("make", make);
    formData.append("model", model);
    formData.append("seater", seater);

    // Convert each seatConfig object to a JSON string and append it to formData
    seatConfig.forEach((seat, index) => {
      formData.append(
        `seatConfig[${index}]`,
        JSON.stringify({
          seatType: seat.seatType,
          seatNumber: Number(seat.seatNumber),
          isBooked: seat.isBooked,
          seatPrice: Number(seat.seatPrice), // Ensure seatPrice is a number
          bookedBy: seat.bookedBy,
        }),
      );
    });

    formData.append("extraKm", extraKm);
    formData.append("runningStatus", runningStatus);
    formData.append("year", year);
    formData.append("price", price);
    formData.append("from", from);
    formData.append("availableFrom", availableFrom);
    formData.append("availableTo", availableTo);
    formData.append("perPersonCost", perPersonCost);
    formData.append("to", to);
    formData.append("color", color);
    formData.append("mileage", mileage);
    formData.append("fuelType", fuelType);
    formData.append("transmission", transmission);
    formData.append("ownerId", ownerId);
    formData.append("isAvailable", isAvailable);
    dispatch(addCar(formData));
    navigate("/your-cars");
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

  const handleSeatChange = (index, field, value) => {
    const updatedSeatsData = [...seatConfig];
    updatedSeatsData[index] = {
      ...updatedSeatsData[index],
      [field]: value,
    };
    setSeatConfig(updatedSeatsData);
  };

  const addNewSeat = () => {
    setSeatConfig([
      ...seatConfig,
      {
        seatType: "",
        seatNumber: "",
        seatPrice: "",
        isBooked: false,
        bookedBy: "",
      },
    ]);
  };

  return (
    <Card sx={{ margin: "0 auto", padding: 3 }}>
      {" "}
      <Typography variant="h5" gutterBottom textAlign="center">
        Add New Car
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleBack}
        sx={{ marginBottom: 1 }}
      >
        Go Back
      </Button>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                value={make}
                onChange={(event, newValue) => setMake(newValue)}
                options={makes}
                renderInput={(params) => (
                  <TextField {...params} label="Make" variant="outlined" />
                )}
                fullWidth
                margin="normal"
                freeSolo
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                value={model}
                onChange={(event, newValue) => setModel(newValue)}
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
                variant="outlined"
                fullWidth
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Color</InputLabel>
                <Select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  label="Color"
                >
                  {["Red", "Blue", "Black", "White", "Silver", "Green"].map(
                    (color) => (
                      <MenuItem key={color} value={color}>
                        {color}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="seater-label">Seater</InputLabel>
                <Select
                  labelId="seater-label"
                  value={seater}
                  onChange={handleSeaterChange}
                  label="Seater"
                >
                  {[...Array(60).keys()].map((value) => (
                    <MenuItem key={value + 1} value={value + 1}>
                      {value + 1}
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
            {seater && (
              <Grid item xs={12}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setShowSeatConfig(true)}
                >
                  Want to set seats
                </Button>
              </Grid>
            )}

            {showSeatConfig && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Seat Configuration
                  </Typography>
                  {Array.from({ length: seater }).map((_, index) => (
                    <Box key={index} sx={{ marginBottom: 2 }}>
                      <Grid container spacing={2}>
                        {/* Seat Type (Dropdown) */}
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Seat {index + 1} Type</InputLabel>
                            <Select
                              value={seatConfig[index]?.seatType || ""}
                              onChange={(e) =>
                                handleSeatChange(index, "seatType", e.target.value)
                              }
                              label={`Seat ${index + 1} Type`}
                            >
                              <MenuItem value="AC">AC</MenuItem>
                              <MenuItem value="Non-AC">Non-AC</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Seat Number */}
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label={`Seat ${index + 1} Number`}
                            variant="outlined"
                            fullWidth
                            value={seatConfig[index]?.seatNumber || ""}
                            onChange={(e) =>
                              handleSeatChange(index, "seatNumber", e.target.value)
                            }
                          />
                        </Grid>

                        {/* Seat Price */}
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label={`Seat ${index + 1} Price`}
                            variant="outlined"
                            fullWidth
                            value={seatConfig[index]?.seatPrice}
                            onChange={(e) =>
                              handleSeatChange(index, "seatPrice", e.target.value)
                            }
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FaIndianRupeeSign />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Seat Booking Status */}
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Seat {index + 1} Status</InputLabel>
                            <Select
                              value={seatConfig[index]?.isBooked || false}
                              onChange={(e) =>
                                handleSeatChange(index, "isBooked", e.target.value)
                              }
                              label={`Seat ${index + 1} Status`}
                            >
                              <MenuItem value={false}>Available</MenuItem>
                              <MenuItem value={true}>Booked</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Booked By Field (Only if Seat is Booked) */}
                        {seatConfig[index]?.isBooked && (
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label={`Seat ${index + 1} Booked By`}
                              variant="outlined"
                              fullWidth
                              value={seatConfig[index]?.bookedBy || ""}
                              onChange={(e) =>
                                handleSeatChange(index, "bookedBy", e.target.value)
                              }
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={addNewSeat}>
                    Add More Seats
                  </Button>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
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
                variant="outlined"
                fullWidth
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                margin="normal"
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
                variant="outlined"
                fullWidth
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLocationArrow />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>{" "}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Drop Location"
                variant="outlined"
                fullWidth
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                margin="normal"
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
                label="Available From"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Available To"
                type="date"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Full ride price"
                variant="outlined"
                fullWidth
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                margin="normal"
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
                value={perPersonCost}
                onChange={(e) => setPerPersonCost(e.target.value)}
                margin="normal"
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
                variant="outlined"
                fullWidth
                value={extraKm}
                onChange={(e) => setExtraKm(e.target.value)}
                margin="normal"
              />
              {extraKm === "" && (
                <FormHelperText error>
                  Please mention Per extra KM Charge in INR
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Running Status</InputLabel>
                <Select
                  value={runningStatus}
                  onChange={(e) => setRunningStatus(e.target.value)}
                  label="Running Status"
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="On A Trip">On A Trip</MenuItem>
                  <MenuItem value="Trip Completed">Trip Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Fifth Row (Image upload) */}
            <Grid item xs={12}>
              <Box sx={{ marginBottom: 1 }}>
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
                    sx={{ padding: "10px", textAlign: "center" }}
                    startIcon={<PhotoCamera />}
                  >
                    Select Car Images
                  </Button>
                </label>
                {images.length > 0 && (
                  <Box sx={{ marginTop: 1, textAlign: "center" }}>
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
              </Box>
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Add Car
          </Button>
        </form>
      </CardContent>
      <AlertDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        title="Confirm Car Submission"
        message="Are you sure you want to add this car?"
      />
    </Card>
  );
}

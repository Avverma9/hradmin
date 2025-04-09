import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../../../utils/alertDialogue";

export default function TourForm() {
  const [travelAgencyName, setTravelAgencyName] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [visitingPlaces, setVisitingPlaces] = useState("");
  const [themes, setThemes] = useState("");
  const [price, setPrice] = useState("");
  const [nights, setNights] = useState("");
  const [days, setDays] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [inclusion, setInclusion] = useState([]);
  const [exclusion, setExclusion] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState({});
  const [dayWise, setDayWise] = useState([]);
  const [starRating, setStarRating] = useState("");
  const [images, setImages] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleAddDay = () => {
    setDayWise([
      ...dayWise,
      { day: dayWise.length + 1, description: "" },
    ]);
  };

  const handleDayChange = (index, value) => {
    const updatedDayWise = [...dayWise];
    updatedDayWise[index].description = value;
    setDayWise(updatedDayWise);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleDialogConfirm = () => {
    setOpenDialog(false);
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }
    formData.append("travelAgencyName", travelAgencyName);
    formData.append("country", country);
    formData.append("state", state);
    formData.append("city", city);
    formData.append("visitingPlaces", visitingPlaces);
    formData.append("themes", themes);
    formData.append("price", price);
    formData.append("nights", nights);
    formData.append("days", days);
    formData.append("from", from);
    formData.append("to", to);
    formData.append("amenities", JSON.stringify(amenities));
    formData.append("inclusion", JSON.stringify(inclusion));
    formData.append("exclusion", JSON.stringify(exclusion));
    formData.append("termsAndConditions", JSON.stringify(termsAndConditions));
    formData.append("dayWise", JSON.stringify(dayWise));
    formData.append("starRating", starRating);

    // Submit formData to the backend
    console.log("Form submitted:", formData);
  };

  return (
    <Card sx={{ margin: "0 auto", padding: 3 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        Add New Travel Package
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Travel Agency Name"
                variant="outlined"
                fullWidth
                value={travelAgencyName}
                onChange={(e) => setTravelAgencyName(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                variant="outlined"
                fullWidth
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                variant="outlined"
                fullWidth
                value={state}
                onChange={(e) => setState(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Visiting Places"
                  variant="outlined"
                  fullWidth
                  value={visitingPlaces}
                  onChange={(e) => setVisitingPlaces(e.target.value)}
                />
                <FormHelperText>
                  Example: 1N Delhi|1N Gurgaon|1N Uttar Pradesh
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="themes-label">Themes</InputLabel>
                <Select
                  labelId="themes-label"
                  value={themes}
                  onChange={(e) => setThemes(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="Adventure">Adventure</MenuItem>
                  <MenuItem value="Honeymoon">Honeymoon</MenuItem>
                  <MenuItem value="Romantic">Romantic</MenuItem>
                  <MenuItem value="Family">Family</MenuItem>
                  <MenuItem value="Cultural">Cultural</MenuItem>
                  <MenuItem value="Wildlife">Wildlife</MenuItem>
                  <MenuItem value="Beach">Beach</MenuItem>
                </Select>
                <FormHelperText>Select a theme for the travel package</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price"
                variant="outlined"
                fullWidth
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Nights"
                variant="outlined"
                fullWidth
                type="number"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Days"
                variant="outlined"
                fullWidth
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="From"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="To"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amenities (comma-separated)"
                variant="outlined"
                fullWidth
                value={amenities.join(", ")}
                onChange={(e) =>
                  setAmenities(e.target.value.split(",").map((item) => item.trim()))
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Inclusion (comma-separated)"
                variant="outlined"
                fullWidth
                value={inclusion.join(", ")}
                onChange={(e) =>
                  setInclusion(e.target.value.split(",").map((item) => item.trim()))
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Exclusion (comma-separated)"
                variant="outlined"
                fullWidth
                value={exclusion.join(", ")}
                onChange={(e) =>
                  setExclusion(e.target.value.split(",").map((item) => item.trim()))
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Day-wise Itinerary
              </Typography>
              {dayWise.map((day, index) => (
                <Box key={index} sx={{ marginBottom: 2 }}>
                  <TextField
                    label={`Day ${day.day} Description`}
                    variant="outlined"
                    fullWidth
                    value={day.description}
                    onChange={(e) => handleDayChange(index, e.target.value)}
                    margin="normal"
                  />
                </Box>
              ))}
              <Button variant="outlined" onClick={handleAddDay}>
                Add Day
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Star Rating"
                variant="outlined"
                fullWidth
                type="number"
                value={starRating}
                onChange={(e) => setStarRating(e.target.value)}
                margin="normal"
                InputProps={{
                  inputProps: { min: 1, max: 5 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ marginBottom: 1 }}>
                <input
                  type="file"
                  id="travelImages"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="travelImages">
                  <Button
                    variant="outlined"
                    color="primary"
                    component="span"
                    fullWidth
                    sx={{ padding: "10px", textAlign: "center" }}
                  >
                    Select Travel Images
                  </Button>
                </label>
                {images.length > 0 && (
                  <Box sx={{ marginTop: 1, textAlign: "center" }}>
                    {Array.from(images).map((image, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(image)}
                        alt={`Travel Image ${index}`}
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
            Add Travel Package
          </Button>
        </form>
      </CardContent>
      <AlertDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleDialogConfirm}
        title="Confirm Travel Package Submission"
        message="Are you sure you want to add this travel package?"
      />
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { updateCar } from "../redux/reducers/travel/car";

export default function SeatConfigUpdate({ open, onClose, car }) {
  const dispatch = useDispatch();
  const [localSeatConfig, setLocalSeatConfig] = useState([]);

  useEffect(() => {
    if (car?.seatConfig) {
      setLocalSeatConfig(car.seatConfig);
    }
  }, [car]);

  const handleSeatChange = (index, field, value) => {
    setLocalSeatConfig((prev) => {
      const updatedConfig = [...prev];
      updatedConfig[index] = {
        ...updatedConfig[index],
        [field]: field === "seatPrice" ? value : value.toString(),
      };
      return updatedConfig;
    });
  };

  const addNewSeat = () => {
    setLocalSeatConfig([
      ...localSeatConfig,
      {
        seatType: "",
        seatNumber: "",
        seatPrice: "",
        isBooked: false,
        bookedBy: "",
      },
    ]);
  };

  const reloadPage = () => {
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const handleSave = () => {
    try {
      dispatch(
        updateCar({ id: car._id, data: { seatConfig: localSeatConfig } }),
      );
      onClose();
      reloadPage();
    } catch (error) {
      console.error("Error saving seat configuration:", error);
    }
  };

  const bookedCount = localSeatConfig.filter(
    (seat) => seat.bookedBy && seat.bookedBy.trim() !== "",
  ).length;
  const availableCount = localSeatConfig.length - bookedCount;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box
          sx={{
            border: "2px dotted #000",
            borderRadius: 1,
            padding: "8px",
            display: "inline-block",
          }}
        >
          <Typography variant="h6">
            Seat Configuration – Available: {availableCount} | Booked:{" "}
            {bookedCount}
          </Typography>{" "}
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent dividers>
        {localSeatConfig.map((seat, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{ mb: 2, backgroundColor: "#f9f9f9" }}
          >
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Seat {index + 1}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={seat.seatType}
                      onChange={(e) =>
                        handleSeatChange(index, "seatType", e.target.value)
                      }
                      label="Type"
                    >
                      <MenuItem value="AC">AC</MenuItem>
                      <MenuItem value="Non-AC">Non-AC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Number"
                    variant="outlined"
                    value={seat.seatNumber || ""}
                    onChange={(e) =>
                      handleSeatChange(index, "seatNumber", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Price"
                    variant="outlined"
                    type="number"
                    value={seat.seatPrice || ""}
                    onChange={(e) =>
                      handleSeatChange(index, "seatPrice", e.target.value)
                    }
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
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={seat.isBooked || false}
                      onChange={(e) =>
                        handleSeatChange(index, "isBooked", e.target.value)
                      }
                      label="Status"
                    >
                      <MenuItem value={false}>Available</MenuItem>
                      <MenuItem value={true}>Booked</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {seat.isBooked && (
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Booked By"
                      variant="outlined"
                      value={seat.bookedBy || ""}
                      onChange={(e) =>
                        handleSeatChange(index, "bookedBy", e.target.value)
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
        <Box textAlign="right" mt={2}>
          <Button variant="outlined" onClick={addNewSeat}>
            + Add Seat
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

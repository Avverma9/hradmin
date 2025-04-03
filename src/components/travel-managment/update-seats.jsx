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
    console.log("here is car", car);
    console.log("here is localSeatConfig", localSeatConfig);

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
}
, 3000);
}
    const handleSave = () => {
        try {
            dispatch(updateCar({ id: car._id, data: { seatConfig: localSeatConfig } }));
            onClose();
reloadPage();
        } catch (error) {
            console.error("Error saving seat configuration:", error);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Update Seat Configuration</DialogTitle>
            <hr />
            <DialogContent>
                {localSeatConfig.map((seat, index) => (
                    <Box key={index} sx={{ marginBottom: 2 }}>
                        <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Seat {index + 1} Type</InputLabel>
                            <Select
                                value={seat.seatType}  // Default to "AC" if empty
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
 

                            
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label={`Seat ${index + 1} Number`}
                                    variant="outlined"
                                    fullWidth
                                    value={seat.seatNumber || ""}
                                    onChange={(e) => handleSeatChange(index, "seatNumber", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label={`Seat ${index + 1} Price`}
                                    variant="outlined"
                                    fullWidth
                                    value={seat.seatPrice || ""}
                                    onChange={(e) => handleSeatChange(index, "seatPrice", e.target.value)}
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
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Seat {index + 1} Status</InputLabel>
                                    <Select
                                        value={seat.isBooked || false}
                                        onChange={(e) => handleSeatChange(index, "isBooked", e.target.value)}
                                    >
                                        <MenuItem value={false}>Available</MenuItem>
                                        <MenuItem value={true}>Booked</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {seat.isBooked && (
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label={`Seat ${index + 1} Booked By`}
                                        variant="outlined"
                                        fullWidth
                                        value={seat.bookedBy || ""}
                                        onChange={(e) => handleSeatChange(index, "bookedBy", e.target.value)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                ))}
                <Button variant="outlined" onClick={addNewSeat} sx={{ marginBottom: 2 }}>
                    Add More Seats
                </Button>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
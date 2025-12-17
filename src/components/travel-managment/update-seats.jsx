import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
  Paper,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { Close, Add, Save, Cancel, EventSeat } from '@mui/icons-material';
import { FaIndianRupeeSign } from "react-icons/fa6";
import { updateCar } from "../redux/reducers/travel/car";
import { toast } from 'react-toastify';
import { useResponsive } from '../../hooks/use-responsive';

const SeatConfigUpdate = ({ open, onClose, car }) => {
  const dispatch = useDispatch();
  const mdUp = useResponsive('up', 'md');
  const [localSeatConfig, setLocalSeatConfig] = useState([]);

  useEffect(() => {
    if (car?.seatConfig) {
      setLocalSeatConfig(car.seatConfig);
    }
  }, [car]);

  const handleSeatChange = (index, field, value) => {
    setLocalSeatConfig((prev) => {
      const updatedConfig = [...prev];
      const seat = { ...updatedConfig[index] };

      if (field === "isBooked") {
        seat[field] = value;
        if (!value) seat.bookedBy = "";
      } else if (field === "seatPrice") {
        seat[field] = value;
      } else {
        seat[field] = value.toString();
      }

      updatedConfig[index] = seat;
      return updatedConfig;
    });
  };

  const addNewSeat = () => {
    setLocalSeatConfig([
      ...localSeatConfig,
      {
        seatType: "AC",
        seatNumber: `${localSeatConfig.length + 1}`,
        seatPrice: "",
        isBooked: false,
        bookedBy: "",
      },
    ]);
  };

  const removeSeat = (index) => {
    setLocalSeatConfig((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateCar({ id: car._id, data: { seatConfig: localSeatConfig } })
      ).unwrap();
      toast.success("Seat configuration saved successfully!");
      window.location.reload(); // Reload to reflect changes in the car details
      onClose();
    } catch (error) {
      console.error("Error saving seat configuration:", error);
      toast.error("Failed to save seat configuration.");
    }
  };

  const bookedCount = localSeatConfig.filter((seat) => seat.isBooked).length;
  const availableCount = localSeatConfig.length - bookedCount;

    return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={!mdUp}
      PaperProps={{ sx: { borderRadius: mdUp ? 4 : 0 } }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
                Seat Configuration
            </Typography>
            <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      <Box display="flex" gap={2} mt={1} flexWrap={mdUp ? 'nowrap' : 'wrap'}>
            <Chip icon={<EventSeat />} label={`Total: ${localSeatConfig.length}`} color="default" />
            <Chip icon={<EventSeat />} label={`Available: ${availableCount}`} color="success" variant="outlined" />
            <Chip icon={<EventSeat />} label={`Booked: ${bookedCount}`} color="error" variant="outlined" />
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: 'grey.50', p: mdUp ? 2 : 1.5 }}>
      <Box sx={{ maxHeight: mdUp ? '60vh' : 'unset', overflowY: mdUp ? 'auto' : 'visible', p: 0.5 }}>
            {localSeatConfig.map((seat, index) => (
            <Paper
                key={index}
                variant="outlined"
          sx={{ mb: mdUp ? 2 : 1.5, p: mdUp ? 2 : 1.5, borderRadius: 2 }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Seat {index + 1}
                    </Typography>
                    <Button
                        size="small"
                        color="error"
                        onClick={() => removeSeat(index)}
                        startIcon={<Close />}
                    >
                        Remove
                    </Button>
                </Box>
          <Grid container spacing={mdUp ? 2 : 1.5}>
                  <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                          value={seat.seatType}
                          onChange={(e) => handleSeatChange(index, "seatType", e.target.value)}
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
                      onChange={(e) => handleSeatChange(index, "seatNumber", e.target.value)}
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
                      onChange={(e) => handleSeatChange(index, "seatPrice", e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      InputProps={{
                          startAdornment: (
                          <InputAdornment position="start">
                              <FaIndianRupeeSign size={14}/>
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
                          onChange={(e) => handleSeatChange(index, "isBooked", e.target.value)}
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
                          onChange={(e) => handleSeatChange(index, "bookedBy", e.target.value)}
                      />
                      </Grid>
                  )}
                </Grid>
            </Paper>
        ))}
        </Box>
      <Box textAlign="right" mt={mdUp ? 2 : 1.5}>
        <Button variant="outlined" size={mdUp ? 'medium' : 'small'} onClick={addNewSeat} startIcon={<Add />}>
                Add New Seat
            </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: mdUp ? 2 : 1.5, borderTop: 1, borderColor: 'divider' }}>
      <Button onClick={onClose} variant="outlined" color="inherit" size={mdUp ? 'medium' : 'small'} startIcon={<Cancel />}>
          Cancel
        </Button>
      <Button onClick={handleSave} variant="contained" color="primary" size={mdUp ? 'medium' : 'small'} startIcon={<Save />}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SeatConfigUpdate.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  car: PropTypes.object,
};

export default SeatConfigUpdate;

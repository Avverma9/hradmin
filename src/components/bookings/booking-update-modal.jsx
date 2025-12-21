import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Box,
  Grid,
  Modal,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Fade,
  Backdrop
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  AttachMoney,
  Hotel,
  People,
  Cancel,
  Save,
  Close
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { updateBooking } from "../redux/reducers/booking";
import { hotelEmail, role, userName } from "../../../utils/util";
import { useLoader } from "../../../utils/loader";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 800,
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
  p: 0,
  maxHeight: "95vh",
  overflowY: "auto",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const CancellationReasonModal = ({ open, onClose, onConfirm, currentReason }) => {
  const [reason, setReason] = useState(currentReason || "");
  const [customReason, setCustomReason] = useState("");
  
  const predefinedReasons = [
    "Customer requested cancellation",
    "No-show by customer",
    "Overbooking situation",
    "Room maintenance issues",
    "Payment failed",
    "Emergency situation",
    "Weather conditions",
    "Other"
  ];

  const handleConfirm = () => {
    const finalReason = reason === "Other" ? customReason : reason;
    if (finalReason.trim()) {
      onConfirm(finalReason);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      BackdropComponent={Backdrop}
      BackdropProps={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      }}
      PaperProps={{
        style: {
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontWeight: 700
        }}
      >
        <Cancel />
        Cancellation Reason Required
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Please provide a reason for cancelling this booking:
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Reason</InputLabel>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            label="Select Reason"
          >
            {predefinedReasons.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {reason === "Other" && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Custom Reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please specify the reason..."
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<Close />}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<Cancel />}
          disabled={!reason || (reason === "Other" && !customReason.trim())}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
            }
          }}
        >
          Confirm Cancellation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BookingUpdateModal = ({ open, onClose, bookingData, onSave }) => {
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    price: "",
    checkInTime: null,
    checkOutTime: null,
    bookingStatus: "",
    numRooms: "",
    guests: "",
    cancellationReason: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const updated = useSelector((state) => state.booking.updated);

  useEffect(() => {
    if (bookingData) {
      const formatDate = (dateInput) => {
        const date = new Date(dateInput);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setFormData({
        checkInDate: bookingData.checkInDate ? formatDate(bookingData.checkInDate) : "",
        checkOutDate: bookingData.checkOutDate ? formatDate(bookingData.checkOutDate) : "",
        checkInTime: bookingData.checkInTime ? new Date(bookingData.checkInTime) : null,
        checkOutTime: bookingData.checkOutTime ? new Date(bookingData.checkOutTime) : null,
        price: bookingData.price || "",
        bookingStatus: bookingData.bookingStatus || "",
        numRooms: bookingData.numRooms || "",
        guests: bookingData.guests || "",
        cancellationReason: bookingData.cancellationReason || "",
      });
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "bookingStatus" && value === "Cancelled") {
      if (bookingData?.bookingStatus === "Cancelled") {
        setFormData((prevData) => ({
          ...prevData,
          bookingStatus: value,
          cancellationReason: bookingData.cancellationReason || prevData.cancellationReason
        }));
        return;
      }
      setPendingStatus(value);
      setShowCancellationModal(true);
      return;
    }
    
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTimeChange = (name) => (time) => {
    setFormData((prevData) => ({ ...prevData, [name]: time }));
  };

  const handleCancellationConfirm = (reason) => {
    setFormData((prevData) => ({
      ...prevData,
      bookingStatus: "Cancelled",
      cancellationReason: reason
    }));
    setShowCancellationModal(false);
    setPendingStatus("");
  };

  const handleCancellationCancel = () => {
    setShowCancellationModal(false);
    setPendingStatus("");
  };

  const handleSave = async () => {
    setLoading(true);
    showLoader();
    try {
      await dispatch(
        updateBooking({
          bookingId: bookingData.bookingId,
          updatedData: {
            ...formData,
            checkInTime: formData.checkInTime?.toISOString(),
            checkOutTime: formData.checkOutTime?.toISOString(),
            createdBy: {
              user: userName,
              email: hotelEmail
            },
          },
        }),
      );
      onSave(updated);
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return "success";
      case "Pending": return "warning";
      case "Cancelled": return "error";
      case "No-show": return "error";
      case "Checked-in": return "info";
      case "Checked-out": return "default";
      default: return "default";
    }
  };

  const isDisabled = bookingData?.status === "Cancelled" || bookingData?.status === "Checked-out";
  const disableSpecificFields = role === "PMS" || role === "TMS";

  if (role === "CA") {
    return null;
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Hotel />
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Update Booking
                </Typography>
                <Chip 
                  label="PMS"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              <Button
                onClick={onClose}
                sx={{ 
                  color: 'white',
                  minWidth: 'auto',
                  p: 1,
                  borderRadius: 2
                }}
              >
                <Close />
              </Button>
            </Box>

            {/* Current Status Alert */}
            {bookingData?.bookingStatus && (
              <Alert 
                severity={getStatusColor(bookingData.bookingStatus)}
                sx={{ m: 3, mb: 2, borderRadius: 2 }}
              >
                Current Status: <strong>{bookingData.bookingStatus}</strong>
                {bookingData.cancellationReason && (
                  <> | Reason: {bookingData.cancellationReason}</>
                )}
              </Alert>
            )}

            {/* Content */}
            <Box sx={{ p: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={3}>
                  {/* Date Fields */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday color="primary" />
                      Check-in & Check-out Details
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Check-in Date"
                      type="date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      disabled={isDisabled}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Check-out Date"
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      disabled={isDisabled}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  {/* Time Fields */}
                  {(formData.bookingStatus === "Checked-in" || formData.bookingStatus === "Checked-out") && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime color="primary" />
                          Time Details
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TimePicker
                          label="Check-in Time"
                          value={formData.checkInTime}
                          onChange={handleTimeChange("checkInTime")}
                          disabled={isDisabled}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      
                      {formData.bookingStatus === "Checked-out" && (
                        <Grid item xs={12} md={6}>
                          <TimePicker
                            label="Check-out Time"
                            value={formData.checkOutTime}
                            onChange={handleTimeChange("checkOutTime")}
                            disabled={isDisabled}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      )}
                    </>
                  )}

                  {/* Booking Status */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      Booking Status & Details
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Booking Status"
                      name="bookingStatus"
                      value={formData.bookingStatus}
                      onChange={handleChange}
                      disabled={isDisabled}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    >
                      <MenuItem value="Confirmed">
                        <Chip label="Confirmed" color="success" size="small" sx={{ mr: 1 }} />
                        Confirmed
                      </MenuItem>
                      <MenuItem value="Pending">
                        <Chip label="Pending" color="warning" size="small" sx={{ mr: 1 }} />
                        Pending
                      </MenuItem>
                      <MenuItem value="Cancelled" disabled={role !== "Developer" && role !== "Admin"}>
                        <Chip label="Cancelled" color="error" size="small" sx={{ mr: 1 }} />
                        Cancelled
                      </MenuItem>
                      <MenuItem value="No-show">
                        <Chip label="No-show" color="error" size="small" sx={{ mr: 1 }} />
                        No Show
                      </MenuItem>
                      <MenuItem value="Checked-in">
                        <Chip label="Checked-in" color="info" size="small" sx={{ mr: 1 }} />
                        Checked in
                      </MenuItem>
                      <MenuItem value="Checked-out">
                        <Chip label="Checked-out" color="default" size="small" sx={{ mr: 1 }} />
                        Checked out
                      </MenuItem>
                    </TextField>
                  </Grid>

                  {/* Price & Room Details */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={disableSpecificFields}
                      InputProps={{
                        startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Rooms"
                      type="number"
                      name="numRooms"
                      value={formData.numRooms}
                      onChange={handleChange}
                      disabled={disableSpecificFields}
                      InputProps={{
                        startAdornment: <Hotel color="action" sx={{ mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Guests"
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      disabled={disableSpecificFields}
                      InputProps={{
                        startAdornment: <People color="action" sx={{ mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  {/* Cancellation Reason Display */}
                  {formData.bookingStatus === "Cancelled" && formData.cancellationReason && (
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'error.light', 
                          color: 'error.contrastText',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'error.main'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Cancellation Reason:
                        </Typography>
                        <Typography variant="body2">
                          {formData.cancellationReason}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </LocalizationProvider>
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              p: 3,
              gap: 2,
              bgcolor: 'grey.50'
            }}>
              <Button 
                onClick={onClose}
                variant="outlined"
                startIcon={<Close />}
                sx={{ 
                  borderRadius: 2,
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading || isDisabled}
                startIcon={loading ? null : <Save />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                  }
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Cancellation Reason Modal */}
      <CancellationReasonModal
        open={showCancellationModal}
        onClose={handleCancellationCancel}
        onConfirm={handleCancellationConfirm}
        currentReason={formData.cancellationReason}
      />
    </>
  );
};

BookingUpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingData: PropTypes.shape({
    bookingId: PropTypes.string.isRequired,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    price: PropTypes.number.isRequired,
    bookingStatus: PropTypes.string.isRequired,
    numRooms: PropTypes.number.isRequired,
    guests: PropTypes.number.isRequired,
    cancellationReason: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

CancellationReasonModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  currentReason: PropTypes.string
};

export default BookingUpdateModal;
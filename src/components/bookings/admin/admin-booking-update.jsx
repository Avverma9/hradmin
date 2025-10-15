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
  Close,
  AdminPanelSettings
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { updateBooking } from "src/components/redux/reducers/booking";
import { hotelEmail, userName } from "../../../../utils/util";
import { useLoader } from "../../../../utils/loader";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 850,
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
  p: 0,
  maxHeight: "95vh",
  overflowY: "auto",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const AdminCancellationReasonModal = ({ open, onClose, onConfirm, currentReason }) => {
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
    "System error/Double booking",
    "Hotel policy violation",
    "Force majeure",
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
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      BackdropComponent={Backdrop}
      BackdropProps={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      }}
      PaperProps={{
        style: {
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontWeight: 700,
          fontSize: '1.3rem',
          p: 3
        }}
      >
        <Cancel sx={{ fontSize: 28 }} />
        Admin Cancellation - Reason Required
      </DialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Admin Override: You are cancelling this booking with administrative privileges.
          </Typography>
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', fontSize: '1.1rem' }}>
          Please provide a detailed reason for cancelling this booking:
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Cancellation Reason</InputLabel>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            label="Select Cancellation Reason"
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          >
            {predefinedReasons.map((r) => (
              <MenuItem key={r} value={r} sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {r === "Other" && <Cancel color="action" />}
                  {r.includes("Customer") && <People color="action" />}
                  {r.includes("System") && <AdminPanelSettings color="action" />}
                  {r.includes("Payment") && <AttachMoney color="action" />}
                  {r.includes("Room") && <Hotel color="action" />}
                  <Typography>{r}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {reason === "Other" && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Custom Cancellation Reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please provide a detailed explanation for the cancellation..."
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            helperText="This reason will be logged for audit purposes"
          />
        )}

        {reason && reason !== "Other" && (
          <Paper 
            sx={{ 
              p: 2, 
              mt: 2,
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
              Selected Reason:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {reason}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 4, gap: 2, bgcolor: 'grey.50' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<Close />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5
          }}
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
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
            }
          }}
        >
          Confirm Cancellation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminBookingUpdateModal = ({ open, onClose, bookingData, onSave }) => {
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
  const updated = useSelector((state) => state.booking.updated);
  const { showLoader, hideLoader } = useLoader();

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
        })
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

  const isDisabled = bookingData?.bookingStatus === "Cancelled" || bookingData?.bookingStatus === "Checked-out";

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
            {/* Admin Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AdminPanelSettings sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" component="h2" fontWeight={700}>
                    Admin Booking Update
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Full administrative control over booking details
                  </Typography>
                </Box>
                <Chip 
                  label="ADMIN"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              <Button
                onClick={onClose}
                sx={{ 
                  color: 'white',
                  minWidth: 'auto',
                  p: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
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
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Current Status: <strong>{bookingData.bookingStatus}</strong>
                  {bookingData.cancellationReason && (
                    <> | Reason: <em>{bookingData.cancellationReason}</em></>
                  )}
                </Typography>
              </Alert>
            )}

            {/* Content */}
            <Box sx={{ p: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={3}>
                  {/* Date Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
                      <CalendarToday />
                      Booking Dates
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

                  {/* Time Section */}
                  {(formData.bookingStatus === "Checked-in" || formData.bookingStatus === "Checked-out") && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
                          <AccessTime />
                          Check-in/Check-out Times
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

                  {/* Status & Details Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
                      Status & Booking Details
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
                        <Chip label="Confirmed" color="success" size="small" sx={{ mr: 1.5 }} />
                        Confirmed
                      </MenuItem>
                      <MenuItem value="Pending">
                        <Chip label="Pending" color="warning" size="small" sx={{ mr: 1.5 }} />
                        Pending
                      </MenuItem>
                      <MenuItem value="Cancelled">
                        <Chip label="Cancelled" color="error" size="small" sx={{ mr: 1.5 }} />
                        Cancelled
                      </MenuItem>
                      <MenuItem value="No-show">
                        <Chip label="No-show" color="error" size="small" sx={{ mr: 1.5 }} />
                        No Show
                      </MenuItem>
                      <MenuItem value="Checked-in">
                        <Chip label="Checked-in" color="info" size="small" sx={{ mr: 1.5 }} />
                        Checked in
                      </MenuItem>
                      <MenuItem value="Checked-out">
                        <Chip label="Checked-out" color="default" size="small" sx={{ mr: 1.5 }} />
                        Checked out
                      </MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isDisabled}
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
                      disabled={isDisabled}
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
                      disabled={isDisabled}
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

                  {/* Cancellation Reason */}
                  {formData.bookingStatus === "Cancelled" && formData.cancellationReason && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Paper 
                        sx={{ 
                          p: 3, 
                          bgcolor: 'error.light', 
                          color: 'error.contrastText',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'error.main'
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Cancel />
                          Cancellation Reason
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {formData.cancellationReason}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.8 }}>
                          Admin Override - Logged for audit purposes
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
              justifyContent: "space-between",
              alignItems: "center", 
              p: 3,
              gap: 2,
              bgcolor: 'grey.50'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Administrative privileges - All changes are logged
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                    }
                  }}
                >
                  {loading ? "Updating..." : "Update Booking"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Admin Cancellation Reason Modal */}
      <AdminCancellationReasonModal
        open={showCancellationModal}
        onClose={handleCancellationCancel}
        onConfirm={handleCancellationConfirm}
        currentReason={formData.cancellationReason}
      />
    </>
  );
};

AdminBookingUpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingData: PropTypes.shape({
    bookingId: PropTypes.string.isRequired,
    checkInDate: PropTypes.string,
    checkOutDate: PropTypes.string,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    price: PropTypes.number,
    bookingStatus: PropTypes.string,
    numRooms: PropTypes.number,
    guests: PropTypes.number,
    cancellationReason: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

AdminCancellationReasonModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  currentReason: PropTypes.string
};

export default AdminBookingUpdateModal;
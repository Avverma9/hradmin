import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function BookedRoomData({ selectedHotel, openDialog, onClose }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Fallback for totalRooms if value is "null"
  const totalRooms =
    selectedHotel?.totalRooms === "null"
      ? selectedHotel?.initialAvailableRooms
      : selectedHotel?.totalRooms;

  const bookingSummary = selectedHotel?.bookingSummary || {};

  return (
    <Dialog
      open={openDialog}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
        {selectedHotel?.hotelName}
      </DialogTitle>

      <DialogContent dividers>
        {selectedHotel?.note && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {selectedHotel?.note}
          </Typography>
        )}

        <Grid container spacing={2}>
          <InfoItem label="Total Rooms" value={totalRooms === null ? selectedHotel?.actualAvailableRooms : totalRooms } />
          <InfoItem label="Booked Rooms" value={bookingSummary?.Confirmed} />
          <InfoItem
            label="Available Rooms"
            value={selectedHotel?.actualAvailableRooms}
          />
          <InfoItem
            label="Cancelled Booking"
            value={bookingSummary?.Cancelled}
          />
          <InfoItem
            label="Checked In Booking"
            value={bookingSummary?.["Checked-in"]}
          />
          <InfoItem
            label="Checked Out Booking"
            value={bookingSummary?.["Checked-out"]}
          />
          <InfoItem
            label="No Show Booking"
            value={bookingSummary?.["No-show"]}
          />
          <InfoItem label="Failed Booking" value={bookingSummary?.Failed} />
          <InfoItem label="Pending Booking" value={bookingSummary?.Pending} />
          <InfoItem label="Booked before listing" value={selectedHotel?.bookedFromOthers} />
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Reusable sub-component for displaying label/value pairs
function InfoItem({ label, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value ?? "--"}
      </Typography>
    </Grid>
  );
}

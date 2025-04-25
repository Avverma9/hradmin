import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";

export default function BookedRoomData({
    selectedHotel,
    openDialog,
    onClose,
}) {
  return (
    <Dialog open={openDialog} onClose={onClose}>
      <DialogTitle>{selectedHotel?.hotelName}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">Total Rooms:</Typography>
            <Typography variant="body2">{selectedHotel?.totalRooms}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Booked Rooms:</Typography>
            <Typography variant="body2">
              {selectedHotel?.bookedRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Available Rooms:</Typography>
            <Typography variant="body2">
              {selectedHotel?.availableRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Cancelled Booking:</Typography>
            <Typography variant="body2">
              {selectedHotel?.cancelledRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Checked In Booking:</Typography>
            <Typography variant="body2">
              {selectedHotel?.checkedInRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Checked Out Booking:</Typography>
            <Typography variant="body2">
              {selectedHotel?.checkedOutRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">No Show Booking:</Typography>
            <Typography variant="body2">
              {selectedHotel?.noShowRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Failed Booking:</Typography>
            <Typography variant="body2">
              {selectedHotel?.failedRooms}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Pending Booking:</Typography>
            <Typography variant="body2">
              {selectedHotel?.pendingRooms}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

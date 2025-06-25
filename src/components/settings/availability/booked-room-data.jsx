import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
  Paper,
  Stack,
  Chip,
} from '@mui/material';

// Import necessary icons
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NoMeetingRoomIcon from '@mui/icons-material/NoMeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ErrorIcon from '@mui/icons-material/Error';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BlockIcon from '@mui/icons-material/Block';
import KingBedIcon from '@mui/icons-material/KingBed';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';


// Main Stat Card Component
function StatCard({ title, value, icon, color = 'text.primary' }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
      <Stack spacing={1} alignItems="center">
        {icon}
        <Typography variant="h4" component="p" fontWeight="bold" sx={{ color }}>
          {value ?? 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Stack>
    </Paper>
  );
}

// Reusable sub-component for list items
function InfoItem({ label, value, icon }) {
  return (
    <Grid item xs={12} sm={6}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
        <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {value ?? '--'}
          </Typography>
        </Box>
      </Stack>
    </Grid>
  );
}


export default function BookedRoomData({ selectedHotel, openDialog, onClose }) {
  if (!selectedHotel) return null;

  // Simplified data calculation with fallbacks
  const bookingSummary = selectedHotel.bookingSummary || {};
  const totalRooms = selectedHotel.totalRooms !== 'null' && selectedHotel.totalRooms ? selectedHotel.totalRooms : selectedHotel.initialAvailableRooms;
  const availableRooms = selectedHotel.actualAvailableRooms ?? 0;
  const bookedRooms = bookingSummary.Confirmed ?? 0;

  const secondaryStats = [
    { label: "Cancelled Bookings", value: bookingSummary.Cancelled, icon: <CancelIcon color="action" /> },
    { label: "Checked-In Bookings", value: bookingSummary["Checked-in"], icon: <LoginIcon color="action" /> },
    { label: "Checked-Out Bookings", value: bookingSummary["Checked-out"], icon: <LogoutIcon color="action" /> },
    { label: "No-Show Bookings", value: bookingSummary["No-show"], icon: <EventBusyIcon color="action" /> },
    { label: "Pending Bookings", value: bookingSummary.Pending, icon: <PendingActionsIcon color="action" /> },
    { label: "Failed Bookings", value: bookingSummary.Failed, icon: <ErrorIcon color="action" /> },
    { label: "Booked Before Listing", value: selectedHotel.bookedFromOthers, icon: <BlockIcon color="action" /> },
  ];

  return (
    <Dialog
      open={openDialog}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {selectedHotel.hotelName}
        <IconButton aria-label="close" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
        {selectedHotel.note && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            {selectedHotel.note}
          </Typography>
        )}
        
        {/* Key Metrics Dashboard */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <StatCard title="Available Rooms" value={availableRooms} icon={<CheckCircleIcon color="success" sx={{ fontSize: 40 }}/>} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Booked Rooms" value={bookedRooms} icon={<NoMeetingRoomIcon color="error" sx={{ fontSize: 40 }} />} color="error.main" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Total Rooms" value={totalRooms} icon={<KingBedIcon color="info" sx={{ fontSize: 40 }} />} color="info.main" />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }}>
          <Chip label="Booking Status Breakdown" />
        </Divider>

        {/* Detailed List */}
        <Grid container spacing={1}>
          {secondaryStats.map(item => (
            <InfoItem key={item.label} label={item.label} value={item.value} icon={item.icon} />
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
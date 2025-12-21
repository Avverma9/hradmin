import React from 'react';
import {
  Box,
  Avatar,
  Button,
  Typography,
  Divider,
  Grid,
  Chip,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email,
  Phone,
  PersonPin,
  Home,
  CalendarMonth,
  EventBusy,
  ExpandMore,
  Close,
  Bed,
  Apartment,
  AttachMoney,
  People,
  VpnKey,
  ConfirmationNumber,
} from '@mui/icons-material';
import { fDate } from '../../../../utils/format-time';

const stringToColor = (string) => {
  if (!string) return '#cccccc';
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const stringAvatar = (name) => {
  const Sname = name || 'U';
  const nameParts = Sname.split(' ');
  const children = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : Sname[0];
  return {
    sx: {
      bgcolor: stringToColor(Sname),
      width: 120,
      height: 120,
      border: '3px solid',
      borderColor: 'divider',
      fontSize: '3rem',
    },
    children: children.toUpperCase(),
  };
};

const InfoItem = ({ icon, label, value, chip, chipColor = 'default' }) => {
  if (!value && !chip) return null;

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
      {icon}
      <Typography variant="body1" color="text.secondary">
        {label}:
      </Typography>
      {value && <Typography component="span" variant="body1" color="text.primary" fontWeight="500">{value}</Typography>}
      {chip && <Chip label={chip} color={chipColor} size="small" />}
    </Stack>
  );
};

const UserDetailsModal = ({ open, onClose, user }) => {
  if (!user) return null;

  const getStatusInfo = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'confirmed': return { color: 'success', bgColor: 'success.lighter' };
      case 'pending': return { color: 'warning', bgColor: 'warning.lighter' };
      case 'cancelled': return { color: 'error', bgColor: 'error.lighter' };
      default: return { color: 'default', bgColor: (theme) => theme.palette.grey[100] };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          User Details
        </Typography>
        <IconButton aria-label="close" onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: 'background.default' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar src={user.profile?.[0]} {...stringAvatar(user.name)} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">{user.name || 'N/A'}</Typography>
            <Divider sx={{ my: 2 }} />
            <InfoItem icon={<PersonPin color="action" />} label="User ID" value={user.userId} />
            <InfoItem icon={<VpnKey color="action" />} label="Password" value={user.password} />
            <InfoItem icon={<Email color="action" />} label="Email" value={user.email} />
            <InfoItem icon={<Phone color="action" />} label="Mobile" value={user.mobile} />
            {user.address && <InfoItem icon={<Home color="action" />} label="Address" value={user.address} />}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, fontWeight: 'bold' }}>BOOKING HISTORY</Divider>

        {user.bookings?.length > 0 ? (
          user.bookings.map((booking, index) => {
            const statusInfo = getStatusInfo(booking.bookingStatus);
            return (
              <Accordion key={index} defaultExpanded={index === 0} sx={{
                mb: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:before': { display: 'none' },
                boxShadow: 'none',
              }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: statusInfo.bgColor }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" spacing={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {booking.hotelDetails?.hotelName || 'Hotel Information'}
                    </Typography>
                    <Chip label={booking.bookingStatus || 'Unknown'} color={statusInfo.color} size="small" />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <InfoItem icon={<ConfirmationNumber fontSize="small" />} label="Booking ID" value={booking.bookingId} />
                      <InfoItem icon={<Apartment fontSize="small" />} label="City" value={booking.hotelDetails?.hotelCity} />
                      <InfoItem icon={<AttachMoney fontSize="small" />} label="Booking Price" value={`₹${booking.price}`} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoItem icon={<CalendarMonth fontSize="small" />} label="Check-in" value={fDate(booking.checkInDate)} />
                      <InfoItem icon={<CalendarMonth fontSize="small" />} label="Check-out" value={fDate(booking.checkOutDate)} />
                    </Grid>
                  </Grid>

                  {booking.roomDetails?.length > 0 && (
                    <Box mt={2}>
                      <Divider>Room Details</Divider>
                      <Stack spacing={2} mt={2}>
                        {booking.roomDetails.map((room, i) => (
                          <Box key={i} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}>
                            <InfoItem icon={<VpnKey fontSize="small" />} label="Type" value={room.type} />
                            <InfoItem icon={<Bed fontSize="small" />} label="Bed Type" value={room.bedTypes} />
                            {room.capacity && <InfoItem icon={<People fontSize="small" />} label="Capacity" value={`${room.capacity} people`} />}
                            <InfoItem icon={<AttachMoney fontSize="small" />} label="Room Price" value={`₹${room.price}`} />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'grey.100', borderRadius: 2 }}>
            <EventBusy sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>No Bookings Found</Typography>
            <Typography color="text.secondary">This user has not made any bookings yet.</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsModal;
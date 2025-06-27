import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Grid,
  Button,
  Dialog,
  Avatar,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Close,
  Person,
  Mail,
  Phone,
  Business,
  Badge,
  VpnKey,
  Visibility,
  VisibilityOff,
  ContentCopy,
} from '@mui/icons-material';

// Helper component for displaying individual info items
const InfoItem = ({ icon, label, value, children }) => (
  <Grid item xs={12} sm={6}>
    <Box display="flex" alignItems="center" gap={2}>
      <Box color="text.secondary">{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        {children || (
          <Typography variant="body1" fontWeight="500">
            {value || 'N/A'}
          </Typography>
        )}
      </Box>
    </Box>
  </Grid>
);

InfoItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  children: PropTypes.node,
};

// Helper component for displaying active/inactive status
const StatusIndicator = ({ active }) => (
  <Chip
    label={active ? 'Active' : 'Inactive'}
    color={active ? 'success' : 'error'}
    size="small"
    variant="outlined"
  />
);

StatusIndicator.propTypes = { active: PropTypes.bool };

export default function ViewUserModal({ open, onClose, user }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const handleCopyPassword = () => {
    if (user?.password) {
      navigator.clipboard
        .writeText(user.password)
        .then(() => {
          toast.success('Password copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy password: ', err);
          toast.error('Failed to copy password');
        });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="600">
            Partner Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
        {/* User Profile Header */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          gap={3}
          mb={3}
        >
          <Avatar
            src={user?.images?.[0]}
            sx={{ width: 100, height: 100, border: '3px solid', borderColor: 'grey.300' }}
          />
          <Box textAlign={{ xs: 'center', sm: 'left' }}>
            <Typography variant="h5" fontWeight="bold">
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.role}
            </Typography>
            <Box mt={1}>
              <StatusIndicator active={user?.status} />
            </Box>
          </Box>
        </Box>

        {/* Basic Information Section */}
        <Box bgcolor="background.paper" p={3} borderRadius={2} border={1} borderColor="divider" mb={3}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: '600' }}>
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <InfoItem icon={<Mail />} label="Email Address" value={user?.email} />
            <InfoItem icon={<Phone />} label="Mobile Number" value={user?.mobile} />
            <InfoItem icon={<Business />} label="Address" value={user?.address} />
            <InfoItem icon={<VpnKey />} label="Password">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="body1" fontWeight="500">
                  {showPassword ? user?.password : '••••••••'}
                </Typography>
                <Tooltip title={showPassword ? 'Hide Password' : 'Show Password'}>
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy Password">
                  <IconButton onClick={handleCopyPassword} size="small">
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </InfoItem>
          </Grid>
        </Box>

        {/* Hotel Details Section */}
        <Box bgcolor="background.paper" p={3} borderRadius={2} border={1} borderColor="divider">
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: '600' }}>
            Hotel Details ({user?.hotelCount || 0})
          </Typography>
          <Stack spacing={2}>
            {user?.hotelInfo && user.hotelInfo.length > 0 ? (
              user.hotelInfo.map((hotel, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {hotel.hotelName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                    <Business sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2">{hotel.fullAddress || 'N/A'}</Typography>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No hotels found for this partner.
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Updated PropTypes to include hotelCount and hotelInfo
ViewUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    mobile: PropTypes.string,
    address: PropTypes.string,
    password: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.string),
    hotelCount: PropTypes.number,
    hotelInfo: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        fullAddress: PropTypes.string,
      })
    ),
  }),
};
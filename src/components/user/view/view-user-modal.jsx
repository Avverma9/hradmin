import { PropTypes } from 'prop-types';

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
} from '@mui/material';

export default function ViewUserModal({ open, onClose, user }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="auto">
      <DialogTitle>Basic Info</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={3}>
          <Avatar src={user?.images} sx={{ width: 80, height: 80, marginBottom: 1 }} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Full Name:</Typography>
            <Typography>{user?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Email:</Typography>
            <Typography>{user?.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Password:</Typography>
            <Typography>{user?.password}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Mobile Number:</Typography>
            <Typography>{user?.mobile}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Location:</Typography>
            <Typography>{user?.address}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Role:</Typography>
            <Typography>{user?.role}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Status:</Typography>
            <Typography>{user?.status ? 'Active' : 'Inactive'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Password:</Typography>
            <Typography>{user?.password}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ViewUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

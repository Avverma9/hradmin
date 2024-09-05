/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import {
  Button,
  Dialog,
  Container,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// Import your modal components
import UserNotification from './user-notification-modal'; // Adjust the path if necessary
import GlobalNotification from './global-notification-modal'; // Adjust the path if necessary

const Notification = () => {
  const [openUserNotification, setOpenUserNotification] = useState(false);
  const [openGlobalNotification, setOpenGlobalNotification] = useState(false);

  const handleOpenUserNotification = () => {
    setOpenUserNotification(true);
  };

  const handleCloseUserNotification = () => {
    setOpenUserNotification(false);
  };

  const handleOpenGlobalNotification = () => {
    setOpenGlobalNotification(true);
  };

  const handleCloseGlobalNotification = () => {
    setOpenGlobalNotification(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenUserNotification}
        sx={{ mt: 2, mr: 2 }}
      >
        Push User Notification
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpenGlobalNotification}
        sx={{ mt: 2 }}
      >
        Push User Global Notification
      </Button>

      {/* User Notification Modal */}
      <Dialog
        open={openUserNotification}
        onClose={handleCloseUserNotification}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>User Notification</DialogTitle>
        <DialogContent>
          <UserNotification />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserNotification} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Notification Modal */}
      <Dialog
        open={openGlobalNotification}
        onClose={handleCloseGlobalNotification}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Global Notification</DialogTitle>
        <DialogContent>
          <GlobalNotification />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGlobalNotification} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Notification;

import axios from 'axios';
import React, { useState, useEffect } from 'react';

import {
  Table,
  Paper,
  Button,
  Dialog,
  Divider,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import { fDateTime } from 'src/utils/format-time';

import WhoSeen from './who-seen';
import UserNotification from './user-notification-modal';
import GlobalNotification from './global-notification-modal';

const Notification = () => {
  const [notifications, setNotifications] = useState({ User: [], Global: [] });
  const [openUserNotification, setOpenUserNotification] = useState(false);
  const [openGlobalNotification, setOpenGlobalNotification] = useState(false);
  const [openWhoSeen, setOpenWhoSeen] = useState(false);
  const [userIds, setUserIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${localUrl}/find/all/by/list/of/user/for/notification`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleOpenUserNotification = () => setOpenUserNotification(true);
  const handleCloseUserNotification = () => setOpenUserNotification(false);
  const handleOpenGlobalNotification = () => setOpenGlobalNotification(true);
  const handleCloseGlobalNotification = () => setOpenGlobalNotification(false);

  const handleOpenWhoSeen = (ids) => {
    setUserIds(ids);
    setOpenWhoSeen(true);
  };

  const handleCloseWhoSeen = () => setOpenWhoSeen(false);

  const renderTable = (data) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Seen by</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((notification) => (
            <TableRow key={notification._id}>
              <TableCell>{notification.name}</TableCell>
              <TableCell>{notification.message}</TableCell>
              <TableCell>{fDateTime(notification.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => handleOpenWhoSeen(notification.userIds)} // Ensure seenByUserIds is in the expected format
                >
                  View Seen By
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenUserNotification}
        sx={{ mt: 2, mr: 2 }}
      >
        Open User Notification Modal
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpenGlobalNotification}
        sx={{ mt: 2 }}
      >
        Open Global Notification Modal
      </Button>

      {/* Render User Notifications Modal */}
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

      {/* Render Global Notifications Modal */}
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

      {/* Render User Notifications Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        User Notifications
      </Typography>
      {renderTable(notifications.User)}

      {/* Render Global Notifications Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Global Notifications
      </Typography>
      {renderTable(notifications.Global)}

      {/* Render Who Seen Modal */}
      <WhoSeen open={openWhoSeen} onClose={handleCloseWhoSeen} userIds={userIds} />

      <Divider sx={{ mt: 4 }} />
    </Container>
  );
};

export default Notification;

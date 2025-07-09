import axios from "axios";
import { toast } from "react-toastify";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Tab,
  Tabs,
  Card,
  Table,
  Paper,
  Button,
  Dialog,
  Divider,
  Tooltip,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardHeader,
  IconButton,
  DialogTitle,
  CardContent,
  DialogActions,
  DialogContent,
  TableContainer,
  CircularProgress,
  Stack,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from '@mui/icons-material/Visibility';

import { localUrl } from "../../../../utils/util";
import { fDateTime } from "../../../../utils/format-time";

import WhoSeen from "./who-seen";
import UserNotification from "./user-notification-modal";
import GlobalNotification from "./global-notification-modal";

const Notification = () => {
  const [notifications, setNotifications] = useState({ User: [], Global: [] });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("user");

  const [openUserNotification, setOpenUserNotification] = useState(false);
  const [openGlobalNotification, setOpenGlobalNotification] = useState(false);
  const [openWhoSeen, setOpenWhoSeen] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);

  const [seenByUserIds, setSeenByUserIds] = useState([]);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState({ title: '', content: ''});

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${localUrl}/find/all/by/list/of/user/for/notification`);
      setNotifications(response.data || { User: [], Global: [] });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleOpenMessageDialog = (notification) => {
    setSelectedMessage({ title: notification.name, content: notification.message });
    setOpenMessageDialog(true);
  };

  const handleCloseMessageDialog = () => {
    setOpenMessageDialog(false);
  };

  const handleOpenWhoSeen = (seenBy) => {
    const seenIds = seenBy ? Object.keys(seenBy).filter((id) => seenBy[id] === true) : [];
    setSeenByUserIds(seenIds);
    setOpenWhoSeen(true);
  };
  
  const handleDeleteClick = (notification, type) => {
    setNotificationToDelete({ ...notification, type });
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    const { _id, type } = notificationToDelete;
    const isUserType = type === "User";
    const url = isUserType
      ? `${localUrl}/find/all/by/list/of/user/for/notification/and-delete/user/${_id}`
      : `${localUrl}/find/all/by/list/of/user/for/notification/and-delete-global/${_id}`;

    try {
      const response = await axios.delete(url);
      if (response.status === 200) {
        toast.success(`Deleted ${type.toLowerCase()} notification`);
        setNotifications((prev) => ({
          ...prev,
          [type]: prev[type].filter((notif) => notif._id !== _id),
        }));
      }
    } catch (error) {
      console.error(`Error deleting ${type} notification:`, error);
      toast.error(`Failed to delete ${type.toLowerCase()} notification`);
    } finally {
      setOpenDeleteConfirm(false);
      setNotificationToDelete(null);
    }
  };

  const renderTable = (data, type) => (
    <TableContainer component={Paper} sx={{ mt: 2 }} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Seen by</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((notification) => (
              <TableRow key={notification._id}>
                <TableCell>{notification.name}</TableCell>
                <TableCell>
                  <Tooltip title="View Full Message">
                    <IconButton onClick={() => handleOpenMessageDialog(notification)}>
                        <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>{fDateTime(notification.createdAt)}</TableCell>
                <TableCell>
                  <Button variant="contained" color="info" onClick={() => handleOpenWhoSeen(notification.seenBy)} >
                    View Seen By
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="error" onClick={() => handleDeleteClick(notification, type)} >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No notifications available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Card elevation={4}>
          <CardHeader
            title="Notification Management"
            action={
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenUserNotification(true)} >
                  Create User Notification
                </Button>
                <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenGlobalNotification(true)} >
                  Create Global Notification
                </Button>
              </Stack>
            }
          />
          <Divider />
          <CardContent>
            <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth" >
              <Tab label={`User Notifications (${notifications.User.length})`} value="user" />
              <Tab label={`Global Notifications (${notifications.Global.length})`} value="global" />
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {currentTab === "user" && renderTable(notifications.User, "User")}
                  {currentTab === "global" && renderTable(notifications.Global, "Global")}
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* --- Modals --- */}
      <Dialog open={openUserNotification} onClose={() => setOpenUserNotification(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create User Notification</DialogTitle>
        <DialogContent>
          <UserNotification onSuccess={fetchNotifications} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserNotification(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openGlobalNotification} onClose={() => setOpenGlobalNotification(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Global Notification</DialogTitle>
        <DialogContent>
          <GlobalNotification onSuccess={fetchNotifications} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGlobalNotification(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to delete the notification titled "<strong>{notificationToDelete?.name || 'this notification'}</strong>"? This action cannot be undone.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMessageDialog} onClose={handleCloseMessageDialog} fullWidth maxWidth="sm">
        <DialogTitle>{selectedMessage.title}</DialogTitle>
        <DialogContent dividers>
            {/* FIXED: Added robust styling to ensure text wraps correctly */}
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selectedMessage.content}
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseMessageDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <WhoSeen open={openWhoSeen} onClose={() => setOpenWhoSeen(false)} userIds={seenByUserIds} />
    </>
  );
};

export default Notification;
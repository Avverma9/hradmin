import axios from "axios";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";

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
  CircularProgress,
} from "@mui/material";

import { localUrl } from "../../../../utils/util";

import { fDateTime } from "../../../../utils/format-time";

import WhoSeen from "./who-seen";
import UserNotification from "./user-notification-modal";
import GlobalNotification from "./global-notification-modal";

const Notification = () => {
  const [notifications, setNotifications] = useState({ User: [], Global: [] });
  const [loading, setLoading] = useState(true);
  const [openUserNotification, setOpenUserNotification] = useState(false);
  const [openGlobalNotification, setOpenGlobalNotification] = useState(false);
  const [openWhoSeen, setOpenWhoSeen] = useState(false);
  const [userIds, setUserIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${localUrl}/find/all/by/list/of/user/for/notification`,
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleOpenUserNotification = () => setOpenUserNotification(true);
  const handleCloseUserNotification = () => setOpenUserNotification(false);
  const handleOpenGlobalNotification = () => setOpenGlobalNotification(true);
  const handleCloseGlobalNotification = () => setOpenGlobalNotification(false);

  const handleOpenWhoSeen = (ids) => {
    const seenUserIds = ids.filter(
      (id) =>
        notifications.User.some(
          (notification) => notification.seenBy[id] === true,
        ) ||
        notifications.Global.some((notification) => notification.seenBy[id]),
    );
    setUserIds(seenUserIds);
    setOpenWhoSeen(true);
  };

  const handleCloseWhoSeen = () => setOpenWhoSeen(false);

  const handleDeleteGlobalById = async (notificationId) => {
    try {
      const response = await axios.delete(
        `${localUrl}/find/all/by/list/of/user/for/notification/and-delete-global/${notificationId}`,
      );
      if (response.status === 200) {
        toast.success("Deleted a global notification");
        setNotifications((prev) => ({
          ...prev,
          Global: prev.Global.filter((notif) => notif._id !== notificationId),
        }));
      }
    } catch (error) {
      console.error("Error deleting global notification:", error);
      toast.error("Failed to delete global notification");
    }
  };

  const handleDeleteUserById = async (notificationId) => {
    try {
      const response = await axios.delete(
        `${localUrl}/find/all/by/list/of/user/for/notification/and-delete/user/${notificationId}`,
      );
      if (response.status === 200) {
        toast.success("Deleted a user notification");
        setNotifications((prev) => ({
          ...prev,
          User: prev.User.filter((notif) => notif._id !== notificationId),
        }));
      }
    } catch (error) {
      console.error("Error deleting user notification:", error);
      toast.error("Failed to delete user notification");
    }
  };

  const renderTable = (data, type) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Seen by</TableCell>
            <TableCell>Actions</TableCell> {/* Add Actions column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((notification) => (
              <TableRow key={notification._id}>
                <TableCell>{notification.name}</TableCell>
                <TableCell
                  style={{
                    maxWidth: "200px", // Adjust the width as needed
                    overflow: "auto",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {notification.message}
                </TableCell>
                <TableCell>{fDateTime(notification.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleOpenWhoSeen(notification.userIds)}
                  >
                    View Seen By
                  </Button>
                </TableCell>
                <TableCell>
                  {type === "User" ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteUserById(notification._id)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteGlobalById(notification._id)}
                    >
                      Delete
                    </Button>
                  )}
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
    <Container maxWidth="lg">
      <div
        style={{
          border: "1px solid #FF5733", // Change this color as needed
          borderRadius: "4px",
          padding: "10px",
          display: "inline-block", // Adjust width to text size
          marginBottom: "20px",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Notifications
        </Typography>
      </div>

      <Typography variant="body1" gutterBottom>
        There are two types of notification 1st user notification 2nd Global
        notification , <hr />
        In User notification you can send notification to a particular partner{" "}
        <hr />
        In Global notification you can send notification to all partner , <hr />
        View seen by button is used to check who seen your notification
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenUserNotification}
        sx={{ mt: 2, mr: 2 }}
      >
        Create User Notification
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpenGlobalNotification}
        sx={{ mt: 2 }}
      >
        Create Global Notification
      </Button>

      {/* Render User Notifications Modal */}
      <Dialog
        open={openUserNotification}
        onClose={handleCloseUserNotification}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <div
            style={{
              border: "1px solid #FF5733", // Change this color as needed
              borderRadius: "4px",
              padding: "10px",
              display: "inline-block", // Adjust width to text size
              marginBottom: "10px", // Optional, adjust spacing as needed
            }}
          >
            User Notification
          </div>
        </DialogTitle>

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
        <DialogTitle>
          <div
            style={{
              border: "1px solid #FF5733", // Change this color as needed
              borderRadius: "4px",
              padding: "10px",
              display: "inline-block", // Adjust width to text size
              marginBottom: "10px", // Optional, adjust spacing as needed
            }}
          >
            Global Notification
          </div>
        </DialogTitle>

        <DialogContent>
          <GlobalNotification />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGlobalNotification} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render Loading Spinner */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Render User Notifications Table */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            User Notifications
          </Typography>
          {renderTable(notifications.User, "User")}

          {/* Render Global Notifications Table */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Global Notifications
          </Typography>
          {renderTable(notifications.Global, "Global")}
        </>
      )}

      {/* Render Who Seen Modal */}
      <WhoSeen
        open={openWhoSeen}
        onClose={handleCloseWhoSeen}
        userIds={userIds}
      />

      <Divider sx={{ mt: 4 }} />
    </Container>
  );
};

export default Notification;

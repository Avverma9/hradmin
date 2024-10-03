/* eslint-disable no-shadow */
import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Iconify from '../../stuff/iconify';
import Scrollbar from '../../stuff/scrollbar';
import { localUrl } from '../../../../utils/util';
import { fToNow } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const [globalNotification, setGlobalNotification] = useState([]);
  const [userNotification, setUserNotification] = useState([]);
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    async function fetchGlobalNotifications() {
      try {
        const response = await axios.get(
          `${localUrl}/push-a-new-notification-to-the-panel/dashboard/get/${userId}`
        );
        const globalNotifications = response.data.map((notification) => ({
          _id: notification._id,
          title: notification.name,
          description: notification.message,
          avatar: null,
          type: 'global', // Added type for differentiation
          createdAt: new Date(notification.createdAt),
          isUnRead: !notification.seen,
          path: notification.path,
        }));
        setGlobalNotification(globalNotifications);
      } catch (error) {
        console.error('Error fetching globalNotification:', error);
      }
    }

    async function fetchUserNotifications() {
      try {
        const response = await axios.get(
          `${localUrl}/fetch-all-new-notification-to-the-panel/dashboard/get/${userId}`
        );
        const userNotifications = response.data.map((notification) => ({
          _id: notification._id,
          title: notification.name,
          description: notification.message,
          avatar: null, // Handle avatar if applicable
          type: 'user', // Mark as user type notification
          createdAt: new Date(notification.createdAt), // Ensure this is a valid Date object
          isUnRead: notification.seenBy[userId] === false, // Determine unread status based on seenBy
          path: notification.path,
        }));
        setUserNotification(userNotifications);
      } catch (error) {
        console.error('Error fetching user notifications:', error);
      }
    }

    fetchGlobalNotifications();
    fetchUserNotifications();
  }, [userId]);

  const totalUnRead =
    globalNotification.filter((item) => item.isUnRead).length +
    userNotification.filter((item) => item.isUnRead).length;

  const handleOpen = (event) => setOpen(event.currentTarget);
  const handleClose = () => setOpen(null);

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(
        `${localUrl}/fetch-all-new-notification-to-the-panel/and-mark-seen/dashboard/${userId}/all`
      );
      setGlobalNotification(
        globalNotification.map((notification) => ({ ...notification, isUnRead: false }))
      );
      setUserNotification(
        userNotification.map((notification) => ({ ...notification, isUnRead: false }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const endpoint =
        notification.type === 'user'
          ? `${localUrl}/fetch-all-new-notification-to-the-panel/and-mark-seen/dashboard-user/notification/${notification._id}/seen`
          : `${localUrl}/fetch-all-new-notification-to-the-panel/and-mark-seen/dashboard/${userId}/${notification._id}/seen`;

      const payload =
        notification.type === 'user'
          ? { userId } // Additional payload for user notifications
          : null;

      await axios.patch(endpoint, payload);

      navigate(notification.path);

      if (notification.type === 'user') {
        setUserNotification(
          userNotification.map((n) => (n._id === notification._id ? { ...n, isUnRead: false } : n))
        );
      } else {
        setGlobalNotification(
          globalNotification.map((n) =>
            n._id === notification._id ? { ...n, isUnRead: false } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const allNotifications = [...globalNotification, ...userNotification];
  const newNotifications = allNotifications.filter((n) => n.isUnRead);
  const beforeThatNotifications = allNotifications.filter((n) => !n.isUnRead);

  return (
    <>
      <IconButton
        aria-label="Notifications"
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
            height: '80vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                New
              </ListSubheader>
            }
          >
            {newNotifications.slice(0, 2).map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Before that
              </ListSubheader>
            }
          >
            {beforeThatNotifications?.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date).isRequired,
    _id: PropTypes.string.isRequired,
    isUnRead: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    avatar: PropTypes.any,
    type: PropTypes.string.isRequired, // Added type prop
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

function NotificationItem({ notification, onClick }) {
  const { avatar, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
      onClick={onClick}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
            {fToNow(notification.createdAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Divider />
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  return {
    avatar: <img alt={notification.title} src="/assets/icons/ic_notification_package.svg" />,
    title,
  };
}

import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { parseISO, formatISO } from 'date-fns';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { localUrl } from 'src/utils/util';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

const API_URL = `${localUrl}/push-a-new-notification-to-the-panel/dashboard/get/`;

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(null);

  // Assuming userId is retrieved from localStorage or some context
  const userId = localStorage.getItem('user_id') || 'defaultUserId';

  useEffect(() => {
    // Fetch notifications from the API with userId
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}${userId}`);
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const totalUnRead = notifications.filter((item) => !item.seen).length;

  const handleOpen = (event) => setOpen(event.currentTarget);
  const handleClose = () => setOpen(null);

  const handleMarkAllAsRead = () =>
    setNotifications(notifications.map((notification) => ({ ...notification, seen: true })));

  const handleNotificationClick = (notification) => {
    localStorage.setItem('userId', userId); // Save userId in localStorage
    window.location.href = notification.path; // Navigate to the path
  };

  return (
    <>
      <IconButton
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        aria-haspopup="true"
        aria-controls="notifications-popover"
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        id="notifications-popover"
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1.5, ml: 0.75, width: 360 } }}
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
          <List disablePadding>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    path: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    seen: PropTypes.bool.isRequired,
    time: PropTypes.string.isRequired,
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
        ...(notification.seen && { bgcolor: 'action.selected' }),
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
            {formatISO(parseISO(notification.time))}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

const ICONS = {
  chat_message: '/assets/icons/ic_notification_chat.svg',
  mail: '/assets/icons/ic_notification_mail.svg',
};

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.name}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.message}
      </Typography>
    </Typography>
  );

  return {
    avatar: ICONS[notification.type] ? (
      <img alt={notification.name} src={ICONS[notification.type]} />
    ) : null,
    title,
  };
}

import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, List, Badge, Button, Avatar, Divider, Tooltip, Popover, Typography, IconButton,
    ListItemText, ListSubheader, ListItemAvatar, ListItemButton, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab
} from '@mui/material';
import Iconify from '../../stuff/iconify';
import Scrollbar from '../../stuff/scrollbar';
import { localUrl } from '../../../../utils/util';
import { fToNow } from '../../../../utils/format-time';

function renderNotificationContent(notification) {
    const title = (
        <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
            {notification.title}
            <Typography
                component="div"
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    mt: 0.5,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                {notification.description}
            </Typography>
        </Typography>
    );

    if (notification.type === 'global') {
        return {
            avatar: <Iconify icon="ph:globe-hemisphere-west-fill" color="info.main" />,
            title,
        };
    }
    if (notification.type === 'user') {
        return {
            avatar: <Iconify icon="solar:user-circle-bold-duotone" color="warning.main" />,
            title,
        };
    }
    return {
        avatar: <Iconify icon="solar:bell-bing-bold-duotone" />,
        title,
    };
}

function NotificationItem({ notification, onClick }) {
    const { avatar, title } = renderNotificationContent(notification);

    return (
        <ListItemButton
            onClick={onClick}
            sx={{
                py: 1.5, px: 2.5, mt: '1px',
                alignItems: 'flex-start',
                ...(notification.isUnRead && { bgcolor: 'action.selected' }),
                '&:hover': { bgcolor: 'action.hover' }
            }}
        >
            <ListItemAvatar sx={{ mt: 0.5 }}>
                <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
            </ListItemAvatar>
            <ListItemText
                sx={{ minWidth: 0 }}
                primary={title}
                secondary={
                    <Typography
                        variant="caption"
                        sx={{ mt: 0.5, display: 'flex', alignItems: 'center', color: 'text.disabled' }}
                    >
                        <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
                        {fToNow(notification.createdAt)}
                    </Typography>
                }
            />
        </ListItemButton>
    );
}

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        id: PropTypes.string.isRequired,
        isUnRead: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        createdAt: PropTypes.instanceOf(Date).isRequired,
        path: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
};

function AllNotificationsDialog({ open, onClose, notifications, onNotificationClick }) {
    const [currentTab, setCurrentTab] = useState('all');

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const filteredNotifications = useMemo(() => {
        if (currentTab === 'unread') {
            return notifications.filter((n) => n.isUnRead);
        }
        if (currentTab === 'read') {
            return notifications.filter((n) => !n.isUnRead);
        }
        return notifications;
    }, [currentTab, notifications]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
            <DialogTitle sx={{ pb: 1 }}>All Notifications</DialogTitle>
            
            <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="All" value="all" />
                <Tab label="Unread" value="unread" />
                <Tab label="Read" value="read" />
            </Tabs>

            <DialogContent dividers sx={{ p: 0, height: '400px' }}>
                {filteredNotifications.length > 0 ? (
                    <List disablePadding>
                        {filteredNotifications.map((notification) => (
                            <NotificationItem 
                                key={notification.id} 
                                notification={notification} 
                                onClick={() => onNotificationClick(notification)} 
                            />
                        ))}
                    </List>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Iconify icon="solar:chat-round-dots-line-duotone" width={80} sx={{ color: 'text.disabled', mb: 1, mx: 'auto' }}/>
                        <Typography variant="h6">No Notifications</Typography>
                        <Typography color="text.secondary">There are no {currentTab} notifications.</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

AllNotificationsDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    notifications: PropTypes.array,
    onNotificationClick: PropTypes.func,
};

export default function NotificationsPopover() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewAllOpen, setViewAllOpen] = useState(false);
    
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const globalUrl = `${localUrl}/push-a-new-notification-to-the-panel/dashboard/get/${userId}`;
            const userUrl = `${localUrl}/fetch-all-new-notification-to-the-panel/dashboard/get/${userId}`;
            const [globalRes, userRes] = await Promise.all([axios.get(globalUrl), axios.get(userUrl)]);

            const globalNotifications = (globalRes.data || []).map((n) => ({
                id: n._id, title: n.name, description: n.message, type: 'global',
                createdAt: new Date(n.createdAt), isUnRead: !n.seen, path: n.path,
            }));
            const userNotifications = (userRes.data || []).map((n) => ({
                id: n._id, title: n.name, description: n.message, type: 'user',
                createdAt: new Date(n.createdAt), isUnRead: n.seenBy?.[userId] === false, path: n.path,
            }));
            
            const allNotifications = [...globalNotifications, ...userNotifications];
            allNotifications.sort((a, b) => b.createdAt - a.createdAt);
            setNotifications(allNotifications);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError('Could not load notifications.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (open) {
          fetchNotifications();
        }
    }, [open, fetchNotifications]);

    const unreadCount = useMemo(() => notifications.filter((n) => n.isUnRead).length, [notifications]);
    const newNotifications = useMemo(() => notifications.filter((n) => n.isUnRead), [notifications]);
    const readNotifications = useMemo(() => notifications.filter((n) => !n.isUnRead), [notifications]);

    const handleOpen = (event) => setOpen(event.currentTarget);
    const handleClose = () => setOpen(null);

    const handleOpenViewAll = () => {
        setViewAllOpen(true);
        handleClose();
    };
    const handleCloseViewAll = () => setViewAllOpen(false);

    const handleMarkAllAsRead = async () => {
        try {
            const updatedNotifications = notifications.map((n) => ({ ...n, isUnRead: false }));
            setNotifications(updatedNotifications);
            await axios.patch(`${localUrl}/fetch-all-new-notification-to-the-panel/and-mark-seen/dashboard/${userId}/all`);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };
    
    const handleNotificationClick = async (notification, closeDialog = false) => {
        try {
            if (closeDialog) {
                handleCloseViewAll();
            } else {
                handleClose();
            }
            navigate(notification.path);
            
            const updatedNotifications = notifications.map((n) =>
                n.id === notification.id ? { ...n, isUnRead: false } : n
            );
            setNotifications(updatedNotifications);
            
            const endpoint = notification.type === 'user'
                ? `${localUrl}/fetch-all-new-notification-to-the-panel/and-mark-seen/dashboard-user/notification/${notification.id}/seen`
                : `${localUrl}/fetch-all-new-notification-to-the-panel/and-mark-seen/dashboard/${userId}/${notification.id}/seen`;
            const payload = notification.type === 'user' ? { userId } : null;
            await axios.patch(endpoint, payload);
        } catch (err) {
            console.error('Error handling notification click:', err);
        }
    };
    
    const renderPopoverContent = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            );
        }
        if (error) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                    <Iconify icon="solar:danger-triangle-bold-duotone" width={64} sx={{ color: 'error.main', mb: 1 }}/>
                    <Typography variant="h6" gutterBottom>Error</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
                    <Button variant="outlined" onClick={fetchNotifications}>Try Again</Button>
                </Box>
            );
        }
        if (notifications.length === 0) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                    <Iconify icon="solar:chat-round-dots-line-duotone" width={80} sx={{ color: 'text.disabled', mb: 1 }}/>
                    <Typography variant="h6" gutterBottom>No Notifications</Typography>
                    <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
                </Box>
            );
        }
        return (
            <Scrollbar sx={{ height: { xs: 340, sm: 420 } }}>
                {newNotifications.length > 0 && (
                    <List disablePadding subheader={
                        <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                            New
                        </ListSubheader>
                    }>
                        {newNotifications.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} onClick={() => handleNotificationClick(notification)} />
                        ))}
                    </List>
                )}

                {readNotifications.length > 0 && (
                    <List disablePadding subheader={
                        <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                            Before That
                        </ListSubheader>
                    }>
                        {readNotifications.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} onClick={() => handleNotificationClick(notification)} />
                        ))}
                    </List>
                )}
            </Scrollbar>
        );
    };

    return (
        <>
            <IconButton aria-label="Notifications" color={open ? 'primary' : 'default'} onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
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
                        mt: 1.5, ml: 0.75,
                        width: 'calc(100vw - 32px)',
                        maxWidth: 380,
                        display: 'flex', flexDirection: 'column', height: '80vh', maxHeight: 560
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
                     <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">Notifications</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            You have {unreadCount} unread messages
                        </Typography>
                    </Box>
                    {unreadCount > 0 && (
                        <Tooltip title="Mark all as read">
                            <IconButton color="primary" onClick={handleMarkAllAsRead}>
                                <Iconify icon="eva:done-all-fill" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {renderPopoverContent()}
                </Box>
                
                <Divider sx={{ borderStyle: 'dashed' }} />
                
                <Box sx={{ p: 1 }}>
                    <Button fullWidth onClick={handleOpenViewAll}>
                        View All
                    </Button>
                </Box>
            </Popover>

            <AllNotificationsDialog
                open={viewAllOpen}
                onClose={handleCloseViewAll}
                notifications={notifications}
                onNotificationClick={(notification) => handleNotificationClick(notification, true)}
            />
        </>
    );
}
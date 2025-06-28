import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import {
    Box,
    Alert,
    Button,
    Select,
    MenuItem,
    Checkbox,
    Container,
    TextField,
    Typography,
    InputLabel,
    FormControl,
    ListItemText,
    ListSubheader,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { localUrl } from '../../../../utils/util';
import { useMenuItems } from '../../../../utils/additional/menuItems';

const UserNotification = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const paths = useMenuItems();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`);
                setUsers(response.data);
            } catch (err) {
                console.error('Error fetching users:', err);
                toast.error('Error fetching users. Please try again.');
            }
        };

        fetchUsers();
    }, []);

    const roleFilteredUsers = selectedRole
        ? users.filter(user => user.role === selectedRole)
        : users;

    const searchFilteredUsers = roleFilteredUsers.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.mobile && user.mobile.toString().includes(userSearchTerm))
    );

    const uniqueRoles = [...new Set(users.map(user => user.role))];

    const handleUserChange = (event) => {
        setSelectedUserIds(event.target.value);
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
        setSelectedUserIds([]);
    };

    const handleSelectAll = () => {
        const allUserIds = searchFilteredUsers.map(user => user._id);
        setSelectedUserIds(allUserIds);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !message || !selectedPath || selectedUserIds.length === 0) {
            setError('Name, message, path, and at least one user are required.');
            return;
        }

        try {
            await axios.post(
                `${localUrl}/push-a-new-notification-to-the-panel/dashboard/user`,
                {
                    name,
                    message,
                    userIds: selectedUserIds,
                    path: selectedPath,
                }
            );

            setName('');
            setMessage('');
            setSelectedPath('');
            setSelectedUserIds([]);
            setError(null);
            setSelectedRole('');
            setUserSearchTerm('');
            toast.success('You have successfully sent a notification');
            window.location.reload();
        } catch (err) {
            console.error('Error creating notification:', err);
            toast.error('Error creating notification. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Push User Notification
            </Typography>
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                {/* Other TextFields and Selects remain the same */}
                <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <TextField
                    fullWidth
                    label="Message"
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Path</InputLabel>
                    <Select
                        value={selectedPath}
                        onChange={(e) => setSelectedPath(e.target.value)}
                        label="Path"
                        required
                    >
                        {paths.map((option) => (
                            <MenuItem key={option.path} value={option.path}>
                                {option.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Filter by Role</InputLabel>
                    <Select
                        value={selectedRole}
                        onChange={handleRoleChange}
                        label="Filter by Role"
                    >
                        <MenuItem value="">
                            <em>All Roles</em>
                        </MenuItem>
                        {uniqueRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Users</InputLabel>
                    <Select
                        multiple
                        value={selectedUserIds}
                        onChange={handleUserChange}
                        label="Users"
                        renderValue={(selected) =>
                            selected
                                .map((id) => {
                                    const user = users.find((u) => u._id === id);
                                    return user ? user.name : '';
                                })
                                .join(', ')
                        }
                        required
                        // --- YAHAN HEIGHT KO 'height' SE FIX KIYA GAYA HAI ---
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    height: 400, // `maxHeight` ki jagah `height` ka istemal
                                },
                            },
                        }}
                    >
                        <ListSubheader>
                            <TextField
                                size="small"
                                placeholder="Search by name or mobile..."
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </ListSubheader>
                        
                        {searchFilteredUsers.length > 0 ? (
                            searchFilteredUsers.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    <Checkbox checked={selectedUserIds.indexOf(user._id) > -1} />
                                    <ListItemText primary={user.name} secondary={user.mobile} /> {user?.role}
                                </MenuItem>
                            ))
                        ) : (
                            // -- JAB KOI USER NAHI MILEGA TO YEH MESSAGE DIKHEGA --
                            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                No users found.
                            </Typography>
                        )}
                    </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary">
                        Create Notification
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleSelectAll}
                    >
                        Select All Shown
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default UserNotification;
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

// --- Material-UI Imports ---
import {
    Box,
    Grid,
    Card,
    Alert,
    Button,
    Select,
    MenuItem,
    Container,
    TextField,
    Typography,
    InputLabel,
    FormControl,
    Autocomplete,
    CardHeader,
    CardContent,
    CardActions,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// --- Local Imports ---
import { localUrl } from '../../../../utils/util';
import { useMenuItems } from '../../../../utils/additional/menuItems';

const UserNotification = () => {
    // --- State Management ---
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');

    // --- UI/UX State ---
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Custom Hooks ---
    const paths = useMenuItems();

    // --- Data Fetching ---
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`);
                setUsers(response.data || []);
            } catch (err) {
                console.error('Error fetching users:', err);
                toast.error('Could not fetch the user list. Please try refreshing.');
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);
    
    // --- Memoized Derived State for Performance ---
    const uniqueRoles = React.useMemo(() => [...new Set(users.map(user => user.role))], [users]);

    const filteredUsers = React.useMemo(() => {
        if (!selectedRole) {
            return users;
        }
        return users.filter(user => user.role === selectedRole);
    }, [users, selectedRole]);


    // --- Event Handlers ---
    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
        setSelectedUsers([]); // Clear selected users when role changes
    };

    const resetForm = () => {
        setName('');
        setMessage('');
        setSelectedPath('');
        setSelectedUsers([]);
        setSelectedRole('');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !message || !selectedPath || selectedUsers.length === 0) {
            setError('All fields are required, and at least one user must be selected.');
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            await axios.post(
                `${localUrl}/push-a-new-notification-to-the-panel/dashboard/user`,
                {
                    name,
                    message,
                    path: selectedPath,
                    userIds: selectedUsers.map(u => u._id),
                }
            );
            toast.success('Notification sent successfully!');
            resetForm();
        } catch (err) {
            console.error('Error creating notification:', err);
            toast.error(err.response?.data?.message || 'Failed to send notification.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <form onSubmit={handleSubmit} noValidate>
                <Card elevation={3}>
                    <CardHeader
                        title="Push User Notification"
                        subheader="Craft and send a targeted notification to your users"
                    />
                    <CardContent>
                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        
                        <Grid container spacing={4}>
                            {/* Left Column: Notification Details */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Notification Content</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Notification Title"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        required
                                        label="Message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                    />
                                    <FormControl fullWidth required>
                                        <InputLabel>Redirect Path</InputLabel>
                                        <Select
                                            value={selectedPath}
                                            onChange={(e) => setSelectedPath(e.target.value)}
                                            label="Redirect Path"
                                        >
                                            {paths.map((option) => (
                                                <MenuItem key={option.path} value={option.path}>
                                                    {option.title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

                            {/* Right Column: User Selection */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Target Audience</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Filter by Role</InputLabel>
                                        <Select
                                            value={selectedRole}
                                            onChange={handleRoleChange}
                                            label="Filter by Role"
                                        >
                                            <MenuItem value=""><em>All Roles</em></MenuItem>
                                            {uniqueRoles.map((role) => (
                                                <MenuItem key={role} value={role}>{role}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <Autocomplete
                                        multiple
                                        fullWidth
                                        loading={isLoadingUsers}
                                        options={filteredUsers}
                                        getOptionLabel={(user) => user.name || ''}
                                        value={selectedUsers}
                                        onChange={(event, newValue) => {
                                            setSelectedUsers(newValue);
                                        }}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Users"
                                                placeholder="Search by name or email..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {isLoadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option, { selected }) => (
                                            <li {...props}>
                                                <Box sx={{ flexGrow: 1 }}>
                                                   <Typography variant="body1">{option.name}</Typography>
                                                   <Typography variant="body2" color="text.secondary">{option.mobile}</Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{option.role}</Typography>
                                            </li>
                                        )}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Button 
                            variant="text" 
                            onClick={resetForm} 
                            disabled={isSubmitting}
                        >
                            Clear
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting || isLoadingUsers}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </CardActions>
                </Card>
            </form>
        </Container>
    );
};

export default UserNotification;
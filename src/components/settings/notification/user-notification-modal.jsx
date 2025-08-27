import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Card,
    Chip,
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
    Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { localUrl } from '../../../../utils/util';
import { useMenuItems } from '../../../../utils/additional/menuItems';

const UserNotification = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedPathRole, setSelectedPathRole] = useState('All');

    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const paths = useMenuItems();

    useEffect(() => {
        
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`);
                setUsers(response.data || []);
            } catch (err) {
                toast.error('Could not fetch the user list. Please try refreshing.');
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const uniqueRoles = useMemo(() => [...new Set(users.map(user => user.role))], [users]);
    const filteredUsers = useMemo(() => {
        if (!selectedRole) return users;
        return users.filter(user => user.role === selectedRole);
    }, [users, selectedRole]);

    const uniquePathRoles = useMemo(() => ['All', ...new Set(paths.map(p => p.role || 'General'))], [paths]);
    const filteredPaths = useMemo(() => {
        if (selectedPathRole === 'All') return paths;
        return paths.filter(p => (p.role || 'General') === selectedPathRole);
    }, [paths, selectedPathRole]);

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
        setSelectedUsers([]);
    };

    const resetForm = () => {
        setName('');
        setMessage('');
        setSelectedPath('');
        setSelectedUsers([]);
        setSelectedRole('');
        setSelectedPathRole('All');
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
            await axios.post(`${localUrl}/push-a-new-notification-to-the-panel/dashboard/user`, {
                name,
                message,
                path: selectedPath,
                userIds: selectedUsers.map(u => u._id),
            });
            toast.success('Notification sent successfully!');
            resetForm();
        } catch (err) {
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
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Notification Content</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Notification Title"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        required
                                        label="Message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        multiline
                                        rows={4}
                                    />
                                    <FormControl fullWidth required>
                                        <InputLabel>Redirect Path</InputLabel>
                                        <Select
                                            value={selectedPath || ''}
                                            onChange={(e) => setSelectedPath(e.target.value)}
                                            label="Redirect Path"
                                        >
                                            <Box
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{
                                                    position: 'sticky',
                                                    top: -8,
                                                    zIndex: 1,
                                                    bgcolor: 'background.paper',
                                                    p: 1,
                                                    borderBottom: '1px solid #ccc',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Filter by Role</Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {uniquePathRoles.map((role) => (
                                                        <Chip
                                                            key={role}
                                                            label={role}
                                                            size="small"
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPathRole(role);
                                                                setSelectedPath('');
                                                            }}
                                                            color={selectedPathRole === role ? 'primary' : 'default'}
                                                        />
                                                    ))}
                                                </Box>
                                                <Divider sx={{ mt: 1 }} />
                                            </Box>
                                            {filteredPaths.map((option) => (
                                                <MenuItem key={option.path} value={option.path}>
                                                    {option.title} ({option.role || 'General'})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

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
                                        renderOption={(props, option) => (
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
                        <Button variant="text" onClick={resetForm} disabled={isSubmitting}>
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

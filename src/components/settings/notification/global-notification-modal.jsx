import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useMemo } from 'react';
import {
    Box,
    Card,
    Chip,
    Alert,
    Stack,
    Button,
    Select,
    Divider,
    MenuItem,
    Container,
    TextField,
    InputLabel,
    FormControl,
    CardHeader,
    CardContent,
    CardActions,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { localUrl } from '../../../../utils/util';
import { useMenuItems } from '../../../../utils/additional/menuItems';

const GlobalNotification = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [error, setError] = useState(null);
    const [selectedRole, setSelectedRole] = useState('All');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const paths = useMenuItems();

    const uniqueRoles = useMemo(() => ['All', ...new Set(paths.map((path) => path.role || 'General'))], [paths]);

    const filteredPaths = useMemo(() => {
        if (selectedRole === 'All') return paths;
        return paths.filter((path) => (path.role || 'General') === selectedRole);
    }, [paths, selectedRole]);

    const resetForm = () => {
        setName('');
        setMessage('');
        setSelectedPath('');
        setError(null);
        setSelectedRole('All');
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setSelectedPath('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !message || !selectedPath) {
            setError('Notification Title, Message, and a Redirect Path are all required.');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await axios.post(`${localUrl}/push-a-new-notification-to-the-panel/dashboard`, {
                name,
                message,
                path: selectedPath,
            });
            toast.success('Global notification sent successfully!');
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send notification.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <form onSubmit={handleSubmit} noValidate>
                <Card elevation={3}>
                    <CardHeader
                        title="Push Global Notification"
                        subheader="Broadcast a message to all users of the application"
                    />
                    <CardContent>
                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                required
                                label="Notification Title"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <TextField
                                fullWidth
                                required
                                label="Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                multiline
                                rows={4}
                                disabled={isSubmitting}
                            />
                            <FormControl fullWidth required disabled={isSubmitting}>
                                <InputLabel>Redirect Path</InputLabel>
                                <Select
                                    value={selectedPath || ''}
                                    onChange={(e) => setSelectedPath(e.target.value)}
                                    label="Redirect Path"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: { maxHeight: 400 },
                                        },
                                    }}
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
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {uniqueRoles.map((role) => (
            <Chip
                key={role}
                label={role}
                size="small"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    handleRoleChange(role);
                }}
                color={selectedRole === role ? 'primary' : 'default'}
            />
        ))}
    </Stack>
    <Divider sx={{ mt: 1 }} />
</Box>

                                    {filteredPaths.map((option) => (
                                        <MenuItem key={option.path} value={option.path}>
                                            {option.title} - ({option?.role || 'General'})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, px: 3 }}>
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
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Global Notification'}
                        </Button>
                    </CardActions>
                </Card>
            </form>
        </Container>
    );
};

export default GlobalNotification;

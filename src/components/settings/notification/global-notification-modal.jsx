import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState } from 'react';

// --- Material-UI Imports ---
import {
    Box,
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
    CardHeader,
    CardContent,
    CardActions,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// --- Local Imports ---
import { localUrl } from '../../../../utils/util';
import { useMenuItems } from '../../../../utils/additional/menuItems';


const GlobalNotification = () => {
    // --- State Management ---
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [error, setError] = useState(null);
    
    // --- UI/UX State ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Custom Hooks ---
    const paths = useMenuItems();

    // --- Event Handlers ---
    const resetForm = () => {
        setName('');
        setMessage('');
        setSelectedPath('');
        setError(null);
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
            await axios.post(
                `${localUrl}/push-a-new-notification-to-the-panel/dashboard`,
                {
                    name,
                    message,
                    path: selectedPath,
                }
            );

            toast.success('Global notification sent successfully!');
            resetForm(); // Reset form instead of reloading the page
        } catch (err) {
            console.error('Error creating notification:', err);
            toast.error(err.response?.data?.message || 'Failed to send notification.');
        } finally {
            setIsSubmitting(false); // Re-enable the form
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
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                            <FormControl fullWidth required disabled={isSubmitting}>
                                <InputLabel>Redirect Path</InputLabel>
                                <Select
                                    value={selectedPath}
                                    onChange={(e) => setSelectedPath(e.target.value)}
                                    label="Redirect Path"
                                >
                                    {paths.map((option) => (
                                        <MenuItem key={option.path} value={option.path}>
                                            {option.title} -({option?.role})
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
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Avatar,
    IconButton,
    Stack,
    Box,
    TextField,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useDispatch, useSelector } from 'react-redux';
import { addContacts, deleteContact, getContacts } from 'src/components/redux/reducers/messenger/messenger';
import { getAll } from 'src/components/redux/reducers/partner';
import { useLoader } from '../../../../utils/loader';

export default function EditContact({ user, open, onClose }) {
    const dispatch = useDispatch();
    const contacts = useSelector((state) => state.messenger.contacts || []);
    const availableUsers = useSelector((state) => state.partner.allData || []);
    const { showLoader, hideLoader } = useLoader();

    const [searchTerm, setSearchTerm] = useState('');
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignSearch, setAssignSearch] = useState('');

    // Fetch contacts when user changes
    useEffect(() => {
        const fetchContacts = async () => {
            if (user && user._id) {
                try {
                    showLoader();
                    await dispatch(getContacts(user._id));
                } finally {
                    hideLoader();
                }
            }
        };

        fetchContacts();
    }, [dispatch, user]);

    // Fetch available users when opening assign modal
    const handleOpenAssign = () => {
        dispatch(getAll());
        setAssignOpen(true);
    };

    const handleAdd = async (userId) => {
        const payload = {
            id: user._id,
            userId: userId,
        };
        try {
            showLoader();
            await dispatch(addContacts(payload));
            await dispatch(getContacts(user._id)); // Refresh contacts
            await dispatch(getAll()); // Refresh available users
        } finally {
            hideLoader();
        }
    };

    const handleDelete = async (contact) => {
        const payload = {
            id: user._id,
            userId: contact.userId,
        };
        try {
            showLoader();
            await dispatch(deleteContact(payload));
            await dispatch(getContacts(user._id)); // Refresh contacts
        } finally {
            hideLoader();
        }
    };

    const handleCloseAssign = () => setAssignOpen(false);

    // Filter contacts by name
    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter available users:
    // Exclude any user whose name and mobile both match an existing contact
    const filteredAvailableUsers = availableUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(assignSearch.toLowerCase()) &&
            !contacts.some(
                (contact) =>
                    contact.name === user.name &&
                    contact.mobile === user.mobile
            )
    );

    return (
        <>
            {/* Main Contact Dialog */}
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Messenger Setup</DialogTitle>
                <DialogContent dividers sx={{ minHeight: 300 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button variant="contained" onClick={handleOpenAssign}>
                            Assign
                        </Button>
                    </Stack>

                    {filteredContacts.length > 0 ? (
                        <Stack spacing={2}>
                            {filteredContacts.map((contact) => (
                                <Box
                                    key={contact._id || contact.mobile}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    p={1}
                                    border="1px solid #e0e0e0"
                                    borderRadius={2}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar>{contact.name?.charAt(0)?.toUpperCase()}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {contact.name}{' '}
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="textSecondary"
                                                >
                                                    ({contact.role})
                                                </Typography>
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {contact.mobile}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton edge="end" color="error" aria-label="delete" onClick={() => handleDelete(contact)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2">No contacts available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Assign New User Modal */}
            <Dialog open={assignOpen} onClose={handleCloseAssign} maxWidth="sm" fullWidth>
                <DialogTitle>Assign</DialogTitle>
                <DialogContent dividers sx={{ minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Search users"
                        value={assignSearch}
                        onChange={(e) => setAssignSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />

                    {filteredAvailableUsers.length > 0 ? (
                        <Stack spacing={2}>
                            {filteredAvailableUsers.map((user) => (
                                <Box
                                    key={user._id}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    p={1}
                                    border="1px solid #e0e0e0"
                                    borderRadius={2}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {user.name}{' '}
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="textSecondary"
                                                >
                                                    ({user.role})
                                                </Typography>
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {user.mobile}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton
                                        edge="end"
                                        color="primary"
                                        aria-label="add"
                                        onClick={() => handleAdd(user._id)}
                                    >
                                        <AddCircleIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <Typography>No users available to assign.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssign}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

EditContact.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

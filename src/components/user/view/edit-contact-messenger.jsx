import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getContacts } from 'src/components/redux/reducers/messenger/messenger';

export default function EditContact({ user, open, onClose }) {
    const dispatch = useDispatch()
    const contacts = useSelector((state) => state.messenger.contacts)
    console.log("jsjpaosd",user._id)
    useEffect(() => {
        const id = user._id
        dispatch(getContacts(id))
    }, [dispatch])
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Messenger Setup</DialogTitle>
            <DialogContent dividers>
                {contacts && contacts.length > 0 ? (
                    <ul>
                        {contacts.map((contact, index) => (
                            <li key={index}>
                                <Typography variant="body1"><strong>Name:</strong> {contact.name}</Typography>
                                <Typography variant="body1"><strong>role:</strong> {contact.role}</Typography>
                                <Typography variant="body1"><strong>Phone:</strong> {contact.mobile}</Typography>
                                <hr />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Typography variant="body2">No contacts available.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

EditContact.propTypes = {
    user: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
};

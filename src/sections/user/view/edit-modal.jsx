import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

export default function EditUserModal({ open, onClose, user, onSubmit }) {
  const [name, setName] = useState(user.name || '');
  const [mobile, setMobile] = useState(user.mobile || '');
  const [email, setEmail] = useState(user.email || '');
  const [status, setStatus] = useState(user.status || '');

  const handleSubmit = () => {
    // Prepare updated user object
    const updatedUser = {
      ...user,
      name,
      mobile,
      email,
      status,
    };

    onSubmit(updatedUser); // Pass updated user object to onSubmit function
    onClose(); // Close modal
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Mobile"
          fullWidth
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Status"
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

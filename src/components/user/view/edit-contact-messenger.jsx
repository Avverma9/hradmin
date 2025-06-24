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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Slide,
  Tooltip,
} from '@mui/material';
import { Search, Delete, AddCircle, Close, GroupAdd, PersonOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { addContacts, deleteContact, getContacts } from 'src/components/redux/reducers/messenger/messenger';
import { getAll } from 'src/components/redux/reducers/partner';
import { useLoader } from '../../../../utils/loader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EmptyState = ({ title, description }) => (
  <Box textAlign="center" p={5} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
    <PersonOff sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="caption" color="text.secondary">{description}</Typography>
  </Box>
);
EmptyState.propTypes = { title: PropTypes.string, description: PropTypes.string };

const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#ccc',
      borderRadius: '6px',
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#aaa',
    }
};

export default function EditContact({ user, open, onClose }) {
  const dispatch = useDispatch();
  const contacts = useSelector((state) => state.messenger.contacts || []);
  const availableUsers = useSelector((state) => state.partner.allData || []);
  const { showLoader, hideLoader } = useLoader();

  const [searchTerm, setSearchTerm] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');

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
    if (open) {
      fetchContacts();
    }
  }, [dispatch, user, open]);

  const handleOpenAssign = () => {
    dispatch(getAll());
    setAssignOpen(true);
  };

  const handleCloseAssign = () => {
    setAssignOpen(false);
    setAssignSearch('');
  }

  const handleAdd = async (contactId) => {
    const payload = { id: user._id, userId: contactId };
    try {
      showLoader();
      await dispatch(addContacts(payload));
      await dispatch(getContacts(user._id));
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (contact) => {
    const payload = { id: user._id, userId: contact.userId };
    try {
      showLoader();
      await dispatch(deleteContact(payload));
      await dispatch(getContacts(user._id));
    } finally {
      hideLoader();
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(assignSearch.toLowerCase()) &&
      u._id !== user._id &&
      !contacts.some((contact) => contact.userId === u._id)
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, height: '90vh', maxHeight: '700px' } }}>
        <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
              Manage Messenger Contacts
            </Typography>
            <IconButton onClick={onClose} size="small"><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'grey.100', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment> }}
            />
            <Button variant="contained" onClick={handleOpenAssign} startIcon={<GroupAdd />} sx={{ textTransform: 'none', px: 3, bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}>
              Add
            </Button>
          </Stack>
          <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <List sx={{ p: 0, flex: 1, overflowY: 'auto', ...scrollbarStyles }}>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <React.Fragment key={contact.userId}>
                    <ListItem
                      secondaryAction={
                        <Tooltip title="Delete Contact">
                          <IconButton edge="end" color="error" onClick={() => handleDelete(contact)} sx={{ transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'scale(1.2)', bgcolor: 'error.lighter' } }}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={{ py: 1.5, pr: 10, '&:hover': { bgcolor: 'action.hover', transition: 'background-color 0.2s ease-in-out' } }}
                    >
                      <ListItemAvatar>
                        <Avatar src={contact.images} sx={{ width: 48, height: 48 }}>{contact.name?.charAt(0)?.toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="subtitle1" fontWeight="500" noWrap>{contact.name}</Typography>}
                        secondary={`${contact.role} • ${contact.mobile}`}
                      />
                    </ListItem>
                    {index < filteredContacts.length - 1 && <Divider component="li" variant="inset" />}
                  </React.Fragment>
                ))
              ) : (
                <EmptyState title="No Contacts Found" description='Click "Add" to assign a new contact.' />
              )}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button onClick={onClose} color="inherit" variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignOpen} onClose={handleCloseAssign} maxWidth="sm" fullWidth TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 4, height: '90vh', maxHeight: '700px' } }}>
        <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider', background: 'linear-gradient(45deg, #212121 30%, #424242 90%)', color: 'white' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="600">
                    Add New Contacts
                </Typography>
                <IconButton onClick={handleCloseAssign} size="small" sx={{ color: 'white' }}><Close /></IconButton>
            </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search users to add..."
            value={assignSearch}
            onChange={(e) => setAssignSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment> }}
            sx={{ mb: 2 }}
          />
          <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <List sx={{ p: 0, flex: 1, overflowY: 'auto', ...scrollbarStyles }}>
              {filteredAvailableUsers.length > 0 ? (
                filteredAvailableUsers.map((u, index) => (
                  <React.Fragment key={u._id}>
                    <ListItem
                      secondaryAction={
                        <Tooltip title="Add to Contacts">
                          <IconButton edge="end" color="primary" onClick={() => handleAdd(u._id)} sx={{ transition: 'all 0.3s cubic-bezier(.17,.67,.83,.67)', '&:hover': { transform: 'scale(1.2) rotate(90deg)', bgcolor: 'primary.lighter' } }}>
                            <AddCircle />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={{ py: 1.5, pr: 10, '&:hover': { bgcolor: 'action.hover', transition: 'background-color 0.2s ease-in-out' } }}
                    >
                      <ListItemAvatar>
                        <Avatar src={u.images} sx={{ width: 48, height: 48 }}>{u.name.charAt(0).toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={<Typography variant="subtitle1" fontWeight="500" noWrap>{u.name}</Typography>} secondary={u.role} />
                    </ListItem>
                    {index < filteredAvailableUsers.length - 1 && <Divider component="li" variant="inset" />}
                  </React.Fragment>
                ))
              ) : (
                <EmptyState title="No Users Available" description="All users may already be in your contact list." />
              )}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseAssign} color="inherit" variant="contained">Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

EditContact.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

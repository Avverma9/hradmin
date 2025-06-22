import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Switch, FormControlLabel } from '@mui/material';

import Iconify from '../../components/stuff/iconify/iconify';



export default function UserTableRow({
  selected,
  name,
  email,
  password,
  status,
  avatarUrl,
  handleClick,
  handleDelete,
  handleEdit,
  handleView,
  handleStatusChange,
  handleContact
}) {
  const [open, setOpen] = useState(null);
  const [showEditContact, setShowEditContact] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };
  const handleMessengerSetupClick = () => {
    handleContact(); // Call the passed prop
    handleCloseMenu();
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleEditClick = () => {
    handleEdit();
    handleCloseMenu();
  };

  const handleViewClick = () => {
    handleView();
    handleCloseMenu();
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setShowPassword(true);
    setTimeout(() => setShowPassword(false), 3000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" noWrap>
              {email}
            </Typography>
            <IconButton onClick={handleCopyEmail} size="small">
              <Iconify icon="eva:copy-fill" />
            </IconButton>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" noWrap>
              {showPassword ? password : '••••••••••'}
            </Typography>
            <IconButton onClick={handleCopyPassword} size="small">
              <Iconify icon="eva:copy-fill" />
            </IconButton>
          </Stack>
        </TableCell>

        <TableCell>
          <FormControlLabel
            control={
              <Switch
                checked={status === 'Active'}
                onChange={() => handleStatusChange(name)}
                color="primary"
              />
            }
            label={status}
          />
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 180 },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Update
        </MenuItem>
        <MenuItem onClick={handleMessengerSetupClick}>
          <Iconify icon="mdi:message-text" sx={{ mr: 2 }} />
          Messenger
        </MenuItem>

        <MenuItem onClick={handleViewClick}>
          <Iconify icon="eva:eye-fill" sx={{ mr: 2 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete();
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  selected: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleView: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
  handleContact: PropTypes.func.isRequired, // ✅ Add this
};

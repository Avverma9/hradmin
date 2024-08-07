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

import Iconify from 'src/components/iconify';

export default function UserTableRow({
  selected,
  name,
  email,
  status,
  avatarUrl,
  handleClick,
  handleDelete,
  handleEdit, // Receive handleEdit as prop
  handleView,
  handleStatusChange,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleEditClick = () => {
    handleEdit(); // Invoke handleEdit function passed as prop
    handleCloseMenu(); // Close the menu after triggering edit action
  };
  const handleViewClick = () => {
    handleView(); // Invoke handleEdit function passed as prop
    handleCloseMenu(); // Close the menu after triggering edit action
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

        <TableCell>{email}</TableCell>

        <TableCell>
          <FormControlLabel
            control={
              <Switch
                checked={status === 'Active'} // Assuming status is 'active' or 'inactive'
                onChange={() => handleStatusChange(name)} // Pass the name or ID to identify user
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
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
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
  status: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired, // Ensure handleEdit is defined as a function prop
  handleView: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
};

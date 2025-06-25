import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Avatar,
  Button,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  TableContainer,
  TableSortLabel,
  TablePagination,
  Skeleton,
  Stack,
  InputAdornment,
  Table,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { visuallyHidden } from '@mui/utils';
import { userDetails } from 'src/components/redux/reducers/user';
import UserDetailsModal from './user-details';
import { useLoader } from '../../../../utils/loader';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  const nameParts = name.split(' ');
  const children = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : name[0];
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: children.toUpperCase(),
  };
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

const headCells = [
  { id: 'profile', label: 'Profile' },
  { id: 'name', label: 'User' },
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'actions', label: 'Actions', disableSorting: true },
];

function UserTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(property);
  };

  return (
    <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
            {headCell.disableSorting ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const AllUser = () => {
  const { userData } = useSelector((state) => state.user);
  const { showLoader, hideLoader, isLoading } = useLoader();

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const dispatch = useDispatch();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (userData && userData.length > 0) return;

    const fetchUserDetails = async () => {
      showLoader();
      try {
        await dispatch(userDetails());
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        hideLoader();
      }
    };
    fetchUserDetails();
  }, [dispatch, showLoader, hideLoader, userData]);

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const visibleUsers = useMemo(() => {
    const filtered = userData.filter(
      (user) =>
        user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.mobile?.includes(debouncedSearchTerm)
    );
    return stableSort(filtered, getComparator(order, orderBy));
  }, [userData, debouncedSearchTerm, order, orderBy]);

  const paginatedUsers = visibleUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from(new Array(rowsPerPage)).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="circular" width={40} height={40} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="80%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="90%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="70%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={64} height={36} />
          </TableCell>
        </TableRow>
      ));
    }
    if (visibleUsers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length} align="center" sx={{ py: 10 }}>
            <PeopleOutlineIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? 'No Users Match Your Search' : 'No Users Found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search criteria.' : 'There is no user data to display.'}
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
    return paginatedUsers.map((user) => (
      <TableRow key={user.userId} hover>
        <TableCell>
          <Avatar
            alt={user.name}
            src={user.profile?.[0]}
            {...(user.profile?.[0] ? {} : stringAvatar(user.name || 'No Name'))}
          />
        </TableCell>
        <TableCell>{user.name || '-'}</TableCell>
        <TableCell>{user.email || '-'}</TableCell>
        <TableCell>{user.mobile || '-'}</TableCell>
        <TableCell>
          <Button variant="contained" color="primary" size="small" onClick={() => handleOpen(user)}>
            View
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ p: 2 }}
        >
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            User Management
          </Typography>
          <TextField
            label="Search by Name, Email, or Mobile"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 350 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Divider />
        <TableContainer>
          <Table>
            <UserTableHead order={order} orderBy={orderBy} onRequestSort={handleSortRequest} />
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={visibleUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
      {selectedUser && <UserDetailsModal user={selectedUser} open={open} onClose={handleClose} />}
    </Box>
  );
};

export default AllUser;
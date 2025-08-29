// src/sections/user/view/user-view.js (या आपकी फ़ाइल का नाम)

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// MUI Imports
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// Redux and Local Project Imports
import { useDispatch, useSelector } from 'react-redux';
import {
  addPartner,
  deletePartner,
  findPartnerByQuery,
  getAll,
  updatedPartner,
  updateStatus,
} from 'src/components/redux/reducers/partner';

import { exportToExcel } from '../../../../utils/exportFunction';
import { useLoader } from '../../../../utils/loader';
import { useDragScroll } from '../../../../utils/dragScroll';
import Iconify from '../../../components/stuff/iconify/iconify';
import TableNoData from '../table-no-data';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, getComparator } from '../utils';

// Modal Imports
import EditUserModal from './edit-modal';
import ViewUserModal from './view-user-modal';
import AddUserModal from './add-partner-modal';
import EditContact from './edit-contact-messenger';

// ----------------------------------------------------------------------

// Helper component for truncated text with a tooltip on hover
const TruncatedCell = ({ value, width = 150 }) => (
  <Tooltip title={value || ''} arrow placement="top">
    <Typography
      variant="body2"
      noWrap
      sx={{
        maxWidth: width,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {value || '-'}
    </Typography>
  </Tooltip>
);

TruncatedCell.propTypes = {
  value: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};


// Table Row Component
function UserTableRow({
  selected, name, avatarUrl, email, city, password, status,
  handleClick, handleEdit, handleDelete, handleContact, handleView, handleStatusChange
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => setOpen(event.currentTarget);
  const handleCloseMenu = () => setOpen(null);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>
        <TableCell component="th" scope="row" sx={{ padding: '0 16px' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <TruncatedCell value={name} width={180} />
          </Stack>
        </TableCell>
        <TableCell><TruncatedCell value={email} width={220} /></TableCell>
        <TableCell><TruncatedCell value={city} width={120} /></TableCell>
        <TableCell><TruncatedCell value={password} width={120} /></TableCell>
        <TableCell>
          <Chip label={status} color={status === 'Active' ? 'success' : 'error'} size="small" />
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}><Iconify icon="eva:more-vertical-fill" /></IconButton>
        </TableCell>
      </TableRow>
      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleView(); handleCloseMenu(); }}><Iconify icon="eva:eye-fill" sx={{ mr: 2 }} />View</MenuItem>
        <MenuItem onClick={() => { handleEdit(); handleCloseMenu(); }}><Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />Edit</MenuItem>
        <MenuItem onClick={() => { handleContact(); handleCloseMenu(); }}><Iconify icon="eva:message-square-fill" sx={{ mr: 2 }} />Contact</MenuItem>
        <MenuItem onClick={() => { handleStatusChange(); handleCloseMenu(); }}><Iconify icon="eva:power-fill" sx={{ mr: 2 }} />Toggle Status</MenuItem>
        <MenuItem onClick={() => { handleDelete(); handleCloseMenu(); }} sx={{ color: 'error.main' }}><Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />Delete</MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
    selected: PropTypes.bool,
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
    email: PropTypes.string,
    city: PropTypes.string,
    password: PropTypes.string,
    status: PropTypes.string,
    handleClick: PropTypes.func,
    handleEdit: PropTypes.func,
    handleDelete: PropTypes.func,
    handleContact: PropTypes.func,
    handleView: PropTypes.func,
    handleStatusChange: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContactModal, setEditContactModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const { showLoader, hideLoader } = useLoader();
  const data = useSelector((state) => state.partner.allData);
  const dispatch = useDispatch();
  const tableRef = useDragScroll();
  
  // Data fetching and state synchronization
  useEffect(() => { dispatch(getAll()); }, [dispatch, refresh]);
  useEffect(() => { if (data) setUsers(Array.isArray(data) ? data : []); }, [data]);

  // All handler functions are defined here
  const handleFilterByName = (event) => { setPage(0); setFilterName(event.target.value); };
  const handleTriggerSearch = () => { if (filterName.trim()) { setFilterCity(''); setFilterRole(''); dispatch(findPartnerByQuery(filterName.trim())); } };
  const handleFilterByCity = (event) => { const value = event.target.value; setPage(0); setFilterCity(value); setFilterName(''); setFilterRole(''); if (value) dispatch(findPartnerByQuery(value)); else dispatch(getAll()); };
  const handleFilterByRole = (event) => { const value = event.target.value; setPage(0); setFilterRole(value); setFilterName(''); setFilterCity(''); if (value) dispatch(findPartnerByQuery(value)); else dispatch(getAll()); };
  const handleClearFilters = () => { setFilterName(''); setFilterCity(''); setFilterRole(''); dispatch(getAll()); };
  const handleEdit = (user) => { setEditUser(user); setEditModalOpen(true); };
  const handleContact = (user) => { setEditContact(user); setEditContactModal(true); };
  const handleView = (user) => { setViewUser(user); setViewModalOpen(true); };
  const handleCloseViewModal = () => setViewModalOpen(false);
  const handleAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);
  const handleCloseEditModal = () => setEditModalOpen(false);
  const handleContactClose = () => setEditContactModal(false);
  const handleSort = (event, id) => { const isAsc = orderBy === id && order === 'asc'; setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(id); };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const handleExport = () => exportToExcel([...users].sort(getComparator(order, orderBy)));
  
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };
  
  const handleSubmitEdit = async (updatedUser) => {
    showLoader();
    try {
      const formData = new FormData();
      Object.keys(updatedUser).forEach(key => {
        if (key === 'images' && updatedUser.images) formData.append('images', updatedUser.images);
        else if (updatedUser[key] !== null) formData.append(key, updatedUser[key]);
      });
      await dispatch(updatedPartner({ userId: updatedUser._id, formData }));
      setRefresh((prev) => !prev);
      toast.success('Partner updated successfully');
    } catch { toast.error('Something went wrong!'); }
    finally { hideLoader(); handleCloseEditModal(); }
  };

  const handleAdd = async (newUser) => {
    showLoader();
    try {
      await dispatch(addPartner(newUser));
      setRefresh((prev) => !prev);
      toast.success('Partner added successfully');
    } catch { toast.error('Something went wrong!'); }
    finally { hideLoader(); handleCloseAddModal(); }
  };

  const handleDeleteSelected = async (idsToDelete = selected) => {
    if (window.confirm(`Are you sure you want to delete ${idsToDelete.length} selected item(s)?`)) {
      showLoader();
      try {
        await Promise.all(idsToDelete.map(id => dispatch(deletePartner(id))));
        setRefresh((prev) => !prev);
        setSelected([]);
        toast.success('Selected partners deleted');
      } catch { toast.warning('Something went wrong!'); }
      finally { hideLoader(); }
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      await dispatch(updateStatus({ userId, newStatus: !currentStatus }));
      setRefresh(p => !p);
      toast.success('Status updated successfully');
    } catch { toast.error('Something went wrong!'); }
  };

  const sortedUsers = [...users].sort(getComparator(order, orderBy));
  const notFound = !sortedUsers.length && (!!filterName || !!filterCity || !!filterRole);

  return (
    <Container maxWidth="auto">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Partners</Typography>
        <Button variant="contained" color="inherit" onClick={handleAddModal} startIcon={<Iconify icon="eva:plus-fill" />}>New User</Button>
      </Stack>
      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          filterCity={filterCity}
          filterRole={filterRole}
          onFilterName={handleFilterByName}
          onFilterCity={handleFilterByCity}
          onFilterRole={handleFilterByRole}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          onDelete={() => handleDeleteSelected()}
          onTriggerSearch={handleTriggerSearch}
        />
        <TableContainer ref={tableRef} sx={{ overflowX: 'auto', maxHeight: 600, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
          <Table stickyHeader>
            <UserTableHead
              order={order}
              orderBy={orderBy}
              rowCount={users.length}
              numSelected={selected.length}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              headLabel={[
                { id: 'name', label: 'Name' }, { id: 'email', label: 'Email' }, { id: 'city', label: 'City' },
                { id: 'password', label: 'Password' }, { id: 'status', label: 'Status' }, { id: '' }
              ]}
            />
            <TableBody>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <UserTableRow
                    key={row._id}
                    selected={selected.indexOf(row._id) !== -1}
                    name={`${row.name} (${row.role})`}
                    avatarUrl={row.images && row.images.length > 0 ? row.images[0] : ''}
                    email={row.email}
                    city={row.city || "Not Given"}
                    password={row.password}
                    status={row?.status ? 'Active' : 'Inactive'}
                    handleClick={(event) => handleClick(event, row._id)}
                    handleDelete={() => handleDeleteSelected([row._id])}
                    handleEdit={() => handleEdit(row)}
                    handleContact={() => handleContact(row)}
                    handleView={() => handleView(row)}
                    handleStatusChange={() => handleStatusChange(row._id, row.status)}
                  />
                ))}
              <TableEmptyRows height={77} emptyRows={emptyRows(page, rowsPerPage, users.length)} />
              {notFound && <TableNoData query={filterName || filterCity || filterRole} />}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[25, 50, 100, 150, 200, 300, 1000]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      {/* Modals */}
      <EditContact open={editContactModal} user={editContact || {}} onClose={handleContactClose} />
      <AddUserModal open={addModalOpen} onClose={handleCloseAddModal} onSubmit={handleAdd} />
      {editUser && <EditUserModal open={editModalOpen} onClose={handleCloseEditModal} user={editUser} onSubmit={handleSubmitEdit} />}
      {viewUser && <ViewUserModal open={viewModalOpen} onClose={handleCloseViewModal} user={viewUser} />}
    </Container>
  );
}

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { exportToExcel } from '../../../../utils/exportFunction';
import { useLoader } from '../../../../utils/loader';
import { useDragScroll } from '../../../../utils/dragScroll';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPartner,
  deletePartner,
  findPartnerByQuery,
  getAll,
  updatedPartner,
  updateStatus,
} from 'src/components/redux/reducers/partner';

import Iconify from '../../../components/stuff/iconify/iconify';
import EditUserModal from './edit-modal';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import ViewUserModal from './view-user-modal';
import UserTableHead from '../user-table-head';
import AddUserModal from './add-partner-modal';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, getComparator } from '../utils';
import EditContact from './edit-contact-messenger';

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

  const { showLoader, hideLoader } = useLoader();
  const [editUser, setEditUser] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContactModal, setEditContactModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const data = useSelector((state) => state.partner.allData);
  const dispatch = useDispatch();
  const tableRef = useDragScroll();
  
  // Initial data fetch and refresh
  useEffect(() => {
    dispatch(getAll());
  }, [dispatch, refresh]);

  useEffect(() => {
    if (data) {
      setUsers(Array.isArray(data) ? data : []);
    }
  }, [data]);


  // --- Filter Handlers (New Logic) ---

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleTriggerSearch = () => {
    if (filterName.trim()) {
      setFilterCity('');
      setFilterRole('');
      dispatch(findPartnerByQuery(filterName.trim()));
    }
  };

  const handleFilterByCity = (event) => {
    const value = event.target.value;
    setPage(0);
    setFilterCity(value);
    setFilterName('');
    setFilterRole('');
    if (value) {
      dispatch(findPartnerByQuery(value));
    } else {
      dispatch(getAll());
    }
  };

  const handleFilterByRole = (event) => {
    const value = event.target.value;
    setPage(0);
    setFilterRole(value);
    setFilterName('');
    setFilterCity('');
    if (value) {
      dispatch(findPartnerByQuery(value));
    } else {
      dispatch(getAll());
    }
  };

  const handleClearFilters = () => {
    setFilterName('');
    setFilterCity('');
    setFilterRole('');
    dispatch(getAll()); // Fetch all data when filters are cleared
  };


  // --- All other handlers ---
  const handleEdit = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };
   const handleContact = (user) => {
    setEditContact(user);
    setEditContactModal(true);
  };

  const handleView = (user) => {
    setViewUser(user);
    setViewModalOpen(true);
  };
  const handleCloseViewModal = () => setViewModalOpen(false);
  const handleAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);
  const handleCloseEditModal = () => setEditModalOpen(false);
  const handleContactClose = () => setEditContactModal(false);

  const handleSubmitEdit = async (updatedUser) => {
    showLoader();
    try {
      const formData = new FormData();
      Object.keys(updatedUser).forEach(key => {
        if(key === 'images' && updatedUser.images) {
          formData.append('images', updatedUser.images);
        } else if (updatedUser[key] !== null) {
          formData.append(key, updatedUser[key]);
        }
      });
      await dispatch(updatedPartner({ userId: updatedUser._id, formData }));
      setRefresh((prev) => !prev);
      toast.success('Partner updated successfully');
    } catch {
      toast.error('Something went wrong!');
    } finally {
      hideLoader();
      handleCloseEditModal();
    }
  };

  const handleAdd = async (newUser) => {
    showLoader();
    try {
      await dispatch(addPartner(newUser));
      setRefresh((prev) => !prev);
      toast.success('Partner added successfully');
    } catch {
      toast.error('Something went wrong!');
    } finally {
      hideLoader();
      handleCloseAddModal();
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} selected items?`)) {
      showLoader();
      try {
        await Promise.all(selected.map(id => dispatch(deletePartner(id))));
        setRefresh((prev) => !prev);
        setSelected([]);
        toast.success('Selected partners deleted');
      } catch {
        toast.warning('Something went wrong!');
      } finally {
        hideLoader();
      }
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users?.map((n) => n._id);
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
    else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex),selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const sortedUsers = [...users].sort(getComparator(order, orderBy));
  const notFound = !sortedUsers.length && (!!filterName || !!filterCity || !!filterRole);

  const handleExport = () => exportToExcel(sortedUsers);

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      await dispatch(updateStatus({ userId, newStatus: !currentStatus }));
      setRefresh(p => !p);
    } catch {
      toast.error('Something went wrong!');
    }
  };

  return (
    <Container maxWidth="auto">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Partners</Typography>
        <Button
          variant="contained"
          color="inherit"
          onClick={handleAddModal}
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          New User
        </Button>
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
          onDelete={handleDeleteSelected}
          onTriggerSearch={handleTriggerSearch}
        />

        <TableContainer
          ref={tableRef}
          sx={{
            overflowX: 'auto',
            maxHeight: 600,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <Table stickyHeader>
            <UserTableHead
              order={order}
              orderBy={orderBy}
              rowCount={users.length}
              numSelected={selected.length}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              headLabel={[
                { id: 'name', label: 'Name' },
                { id: 'email', label: 'Email' },
                { id: 'city', label: 'City' },
                { id: 'password', label: 'Password' },
                { id: 'status', label: 'Status' },
                { id: '' },
              ]}
            />
            <TableBody>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <UserTableRow
                    key={row._id}
                    name={`${row.name} (${row.role})`}
                    email={row.email}
                    city={row.city || "Not Given"}
                    password={row.password}
                    status={row?.status ? 'Active' : 'Inactive'}
                    avatarUrl={row.images && row.images.length > 0 ? row.images[0] : ''}
                    selected={selected.indexOf(row._id) !== -1}
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

      <EditContact
        open={editContactModal}
        user={editContact || {}}
        onClose={handleContactClose}
      />

      <AddUserModal open={addModalOpen} onClose={handleCloseAddModal} onSubmit={handleAdd} />
      {editUser && <EditUserModal open={editModalOpen} onClose={handleCloseEditModal} user={editUser} onSubmit={handleSubmitEdit} />}
      {viewUser && <ViewUserModal open={viewModalOpen} onClose={handleCloseViewModal} user={viewUser} />}
    </Container>
  );
}
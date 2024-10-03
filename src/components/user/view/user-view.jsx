/* eslint-disable no-shadow */
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';

import {
  Card,
  Stack,
  Table,
  Button,
  Container,
  TableBody,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { localUrl } from '../../../../utils/util';
import LinearLoader from '../../../../utils/Loading';
import { exportToExcel } from '../../../../utils/exportFunction';

import Iconify from '../../../components/stuff/iconify/iconify';
import Scrollbar from '../../../components/stuff/scrollbar/scrollbar';

import EditUserModal from './edit-modal';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import ViewUserModal from './view-user-modal';
import UserTableHead from '../user-table-head';
import AddUserModal from './add-partner-modal';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false); // State to manage refresh

  useEffect(() => {
    setLoading(true);
    fetchUsers(); // Fetch users on component mount and refresh
  }, [refresh]); // Re-fetch data when refresh state changes

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleView = (user) => {
    setViewUser(user);
    setViewModalOpen(true);
  };

  const handleAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditUser(null);
    setEditModalOpen(false);
  };

  const handleCloseViewModal = () => {
    setViewUser(null);
    setViewModalOpen(false);
  };

  const handleSubmitEdit = async (updatedUser) => {
    try {
      setLoading(true);

      // Create a FormData object
      const formData = new FormData();

      // Append non-file fields
      formData.append('_id', updatedUser._id);
      formData.append('name', updatedUser.name);
      formData.append('email', updatedUser.email);
      formData.append('mobile', updatedUser.mobile);
      formData.append('address', updatedUser.address);
      formData.append('password', updatedUser.password);
      formData.append('role', updatedUser.role);
      formData.append('status', updatedUser.status ? 'true' : 'false');

      // Append file if available
      if (updatedUser.images) {
        formData.append('images', updatedUser.images);
      }

      // Make the PATCH request with FormData
      const response = await axios.patch(
        `${localUrl}/update/dashboard/updated/partner/${updatedUser._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Required for file uploads
          },
        }
      );

      if (response.status === 200) {
        toast.success('Successfully updated');
        setRefresh((prev) => !prev); // Trigger refresh
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  };

  const handleAdd = async (newUser) => {
    try {
      const response = await axios.post(`${localUrl}/create/dashboard/user`, newUser);
      if (response.status === 201) {
        toast.success('Successfully added');
        setRefresh((prev) => !prev); // Trigger refresh
      }
    } catch (error) {
      toast.error('Something went wrong!', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${localUrl}/delete/dashboard/delete/partner/${id}`);
      if (response.status === 200) {
        toast.success('Successfully deleted');
        setRefresh((prev) => !prev); // Trigger refresh
      }
    } catch (error) {
      toast.warning('Something went wrong!', error);
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // Function to export data to Excel using the utility function
  const handleExport = () => {
    // Implement export logic here, e.g., exporting `users` data
    exportToExcel(users);
  };

  // Function to handle status change using API
  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus; // Toggle the current status
      const response = await axios.put(`${localUrl}/update/dashboard/user-status/${userId}`, {
        status: newStatus,
      });
      if (response.status === 200) {
        // Update local users state
        const updatedUsers = users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        );
        toast.success(`Status Changed to ${newStatus === true ? 'Active' : 'Inactive'}`);
        setUsers(updatedUsers);
      }
    } catch (error) {
      toast.error('Something went wrong!', error);
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  if (error) {
    return <Typography>Error: {error.message}</Typography>;
  }

  return (
    <Container>
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
          onFilterName={handleFilterByName}
          onExport={handleExport}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: '100%' }}>
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
                  { id: 'password', label: 'Password' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row._id}
                      name={`${row.name} (${row.role})`}
                      email={row.email}
                      password={row.password}
                      status={row?.status ? 'Active' : 'Inactive'}
                      avatarUrl={row.avatarUrl || row.images}
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                      handleDelete={() => handleDelete(row._id)}
                      handleEdit={() => handleEdit(row)}
                      handleSubmitEdit={() => handleSubmitEdit(row._id)}
                      handleView={() => handleView(row)}
                      handleStatusChange={() => handleStatusChange(row._id, row.status)} // Pass user ID and current status
                    />
                  ))}

                <TableEmptyRows
                  height={17}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      <AddUserModal open={addModalOpen} onClose={handleCloseAddModal} onSubmit={handleAdd} />
      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        user={editUser || {}}
        onSubmit={handleSubmitEdit}
      />
      <ViewUserModal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        user={viewUser || {}}
        onSubmit={handleView}
      />
    </Container>
  );
}

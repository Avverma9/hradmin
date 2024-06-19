/* eslint-disable no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import { useState, useEffect } from 'react';

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

import  { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';

import EditUserModal from './edit-modal';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import AddUserModal from './add-partner-modal';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import Iconify from '../../../components/iconify/iconify';
import Scrollbar from '../../../components/scrollbar/scrollbar';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false); // State to manage refresh

  useEffect(() => {
    setLoading(true);
    fetch(`${localUrl}/login/dashboard/get/all/user`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [refresh]); // Re-fetch data when refresh state changes

  const handleEdit = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleAddModal = (newUser) => {
    setAddModalOpen(true);
  };
  const handleCloseAddModal = (newUser) => {
    setAddModalOpen(false);
  };
  const handleCloseEditModal = () => {
    setEditUser(null);
    setEditModalOpen(false);
  };

  const handleSubmitEdit = async (updatedUser) => {
    try {
      const response = await axios.patch(
        `${localUrl}/update/dashboard/updated/partner/${updatedUser._id}`,
        updatedUser
      );
      if (response.status === 200) {
        setRefresh((prev) => !prev); // Trigger refresh
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAdd = async (newUser) => {
    try {
      const response = await axios.patch(`${localUrl}/create/dashboard/user`, newUser);
      if (response.status === 201) {
        setRefresh((prev) => !prev); // Trigger refresh
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${localUrl}/delete/dashboard/delete/partner/${id}`);
      if (response.status === 200) {
        setRefresh((prev) => !prev); // Trigger refresh
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
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
        <Typography variant="h4">Dashboard Partners</Typography>

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
                  { id: 'mobile', label: 'Mobile' },
                  { id: 'email', label: 'Email' },
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
                      name={row.name}
                      mobile={row.mobile}
                      email={row.email}
                      status={row?.status === true ? 'active' : 'inactive'}
                      avatarUrl={row.avatarUrl || row.images}
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                      handleDelete={() => handleDelete(row._id)} // Pass handleDelete function to delete button
                      handleEdit={() => handleEdit(row)} // Pass handleEdit function to edit button
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
        user={editUser || {}} // Pass empty object if editUser is null
        onSubmit={handleSubmitEdit}
      />
    </Container>
  );
}

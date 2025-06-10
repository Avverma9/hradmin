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
import { exportToExcel } from '../../../../utils/exportFunction';
import Iconify from '../../../components/stuff/iconify/iconify';
import EditUserModal from './edit-modal';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import ViewUserModal from './view-user-modal';
import UserTableHead from '../user-table-head';
import AddUserModal from './add-partner-modal';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPartner,
  deletePartner,
  getAll,
  updatedPartner,
  updateStatus,
} from 'src/components/redux/reducers/partner';
import { useLoader } from '../../../../utils/loader';
import { useDragScroll } from '../../../../utils/dragScroll';
import EditContact from './edit-contact-messenger';

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [users, setUsers] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
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

  useEffect(() => {
    showLoader();
    const fetchUsers = async () => {
      try {
        await dispatch(getAll());
      } catch (error) {
        setError(error);
        toast.error('Error fetching users');
      } finally {
        hideLoader();
      }
    };
    fetchUsers();
  }, [dispatch, refresh]);

  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleContact = (user) => {
    setEditContact(user);
    setEditContactModal(true);
  };

  const handleContactClose = () => {
    setEditContact(null);
    setEditContactModal(false);
  };

  const handleView = (user) => {
    setViewUser(user);
    setViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setViewUser(null);
    setViewModalOpen(false);
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



  const handleSubmitEdit = async (updatedUser) => {
    try {
      showLoader();
      const formData = new FormData();
      formData.append('_id', updatedUser._id);
      formData.append('name', updatedUser.name);
      formData.append('email', updatedUser.email);
      formData.append('mobile', updatedUser.mobile);
      formData.append('address', updatedUser.address);
      formData.append('password', updatedUser.password);
      formData.append('role', updatedUser.role);
      formData.append('status', updatedUser.status ? 'true' : 'false');
      if (updatedUser.images) formData.append('images', updatedUser.images);
      await dispatch(updatedPartner({ userId: updatedUser._id, formData }));
      setRefresh((prev) => !prev);
    } catch {
      toast.error('Something went wrong!');
    } finally {
      hideLoader();
    }
  };

  const handleAdd = async (newUser) => {
    showLoader();
    try {
      await dispatch(addPartner(newUser));
      setRefresh((prev) => !prev);
    } catch {
      toast.error('Something went wrong!');
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePartner(id));
      setRefresh((prev) => !prev);
    } catch {
      toast.warning('Something went wrong!');
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users?.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = [...selected, name];
    else newSelected = selected.filter((item) => item !== name);
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

  const handleExport = () => {
    exportToExcel(users);
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await dispatch(updateStatus({ userId, newStatus }));
      const updatedUsers = users?.map((user) =>
        user._id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
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
          onFilterName={handleFilterByName}
          onExport={handleExport}
        />

        <TableContainer
          ref={tableRef}
          sx={{
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: 600,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
            cursor: 'grab',
            '&.active': { cursor: 'grabbing' },
            minWidth: 900,
          }}
        >
          <Table>
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
              sx={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'background.paper',
                zIndex: 2,
              }}
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
                    handleContact={() => handleContact(row)}
                    handleSubmitEdit={() => handleSubmitEdit(row)}
                    handleView={() => handleView(row)}
                    handleStatusChange={() => handleStatusChange(row._id, row.status)}
                  />
                ))}

              <TableEmptyRows height={17} emptyRows={emptyRows(page, rowsPerPage, users.length)} />
              {notFound && <TableNoData query={filterName} />}
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
      <EditUserModal open={editModalOpen} onClose={handleCloseEditModal} user={editUser || {}} onSubmit={handleSubmitEdit} />
      <ViewUserModal open={viewModalOpen} onClose={handleCloseViewModal} user={viewUser || {}} onSubmit={handleView} />
    </Container>
  );
}
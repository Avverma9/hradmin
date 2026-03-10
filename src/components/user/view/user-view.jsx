import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
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
import EditUserModal from './edit-modal';
import ViewUserModal from './view-user-modal';
import AddUserModal from './add-partner-modal';
import EditContact from './edit-contact-messenger';
import { useResponsive } from '../../../hooks/use-responsive';

function StatsCard({ title, value, icon, color = 'primary' }) {
  const theme = useTheme();
  return (
    <Card 
      variant="outlined"
      sx={{ borderRadius: 1 }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: theme.palette[color].main, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function UserTableRow({
  selected,
  row,
  handleClick,
  handleEdit,
  handleDelete,
  handleContact,
  handleView,
  handleStatusToggle,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <TableRow 
        hover 
        selected={selected}
        sx={{
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.8),
          },
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox 
            checked={selected} 
            onChange={(e) => handleClick(e, row._id)}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Switch
            checked={row.status}
            onChange={() => handleStatusToggle(row._id, row.status)}
            color="primary"
            size="small"
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={openMenu} size="small">
            <Iconify icon="eva:more-vertical-fill" width={18} />
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar 
              src={row.images?.[0]}
              sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
            >
              {!row.images?.[0] && row.name[0]}
            </Avatar>
            <Typography variant="body2" fontWeight="500">
              {row.name}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {row.email}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {row.role || 'Partner'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {row.city || '—'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontFamily="monospace">
            {'•'.repeat(row.password?.length || 8)}
          </Typography>
        </TableCell>
      </TableRow>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 180, borderRadius: 1, boxShadow: theme.shadows[3] }
        }}
      >
        <MenuItem onClick={() => { handleView(row); closeMenu(); }} sx={{ py: 1, typography: 'body2' }}>
          <Iconify icon="eva:eye-fill" sx={{ mr: 1.5, width: 18 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => { handleEdit(row); closeMenu(); }} sx={{ py: 1, typography: 'body2' }}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 1.5, width: 18 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { handleContact(row); closeMenu(); }} sx={{ py: 1, typography: 'body2' }}>
          <Iconify icon="eva:message-square-fill" sx={{ mr: 1.5, width: 18 }} /> Contacts
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { handleDelete(row); closeMenu(); }} sx={{ py: 1, typography: 'body2', color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 1.5, width: 18 }} /> Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  selected: PropTypes.bool,
  row: PropTypes.object,
  handleClick: PropTypes.func,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  handleContact: PropTypes.func,
  handleView: PropTypes.func,
  handleStatusToggle: PropTypes.func,
};

export default function UserPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.partner.allData);
  const { showLoader, hideLoader } = useLoader();
  const mdUp = useResponsive('up', 'md');
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [mobileRow, setMobileRow] = useState(null);

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [editUser, setEditUser] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContactModal, setEditContactModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const tableRef = useDragScroll();

  useEffect(() => {
    dispatch(getAll());
  }, [dispatch, refresh]);

  useEffect(() => {
    if (data) setUsers(Array.isArray(data) ? data : []);
  }, [data]);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status).length;
  const inactiveUsers = totalUsers - activeUsers;
  const roles = [...new Set(users.map(u => u.role))].length;

  const handleSort = (e, prop) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };

  const filtered = users
    .filter((u) => u.name.toLowerCase().includes(filterName.toLowerCase()))
    .filter((u) => (filterCity ? u.city === filterCity : true))
    .filter((u) => (filterRole ? u.role === filterRole : true));

  const sortedUsers = filtered.sort(getComparator(order, orderBy));
  const emptyRowsCount = emptyRows(page, rowsPerPage, sortedUsers.length);
  const notFound = !sortedUsers.length && !!(filterName || filterCity || filterRole);

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(sortedUsers.map((u) => u._id));
    else setSelected([]);
  };

  const handleClick = (e, id) => {
    const idx = selected.indexOf(id);
    let newSel = [];
    if (idx === -1) newSel = [...selected, id];
    else newSel = selected.filter((s) => s !== id);
    setSelected(newSel);
  };

  const handleStatusToggle = (id, status) => {
    dispatch(updateStatus({ userId: id, newStatus: !status }))
      .then(() => {
        setRefresh((p) => !p);
        toast.success(`Status updated successfully`);
      })
      .catch(() => toast.error('Status update failed'));
  };

  const handleDeleteSelected = (ids = selected) => {
    if (window.confirm(`Delete ${ids.length} item(s)?`)) {
      showLoader();
      Promise.all(ids.map((id) => dispatch(deletePartner(id))))
        .then(() => {
          toast.success('Partners deleted successfully');
          setSelected([]);
          setRefresh((p) => !p);
        })
        .catch(() => toast.error('Delete failed'))
        .finally(hideLoader);
    }
  };

  const openMobileMenu = (e, row) => {
    setMobileAnchorEl(e.currentTarget);
    setMobileRow(row);
  };

  const closeMobileMenu = () => {
    setMobileAnchorEl(null);
    setMobileRow(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="600">
          Partner Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setAddModalOpen(true)}
          startIcon={<Iconify icon="eva:plus-fill" />}
          disableElevation
        >
          Add Partner
        </Button>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Partners" value={totalUsers} icon={<Iconify icon="eva:people-fill" width={24} />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Active Partners" value={activeUsers} icon={<Iconify icon="eva:checkmark-circle-2-fill" width={24} />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Inactive Partners" value={inactiveUsers} icon={<Iconify icon="eva:close-circle-fill" width={24} />} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Different Roles" value={roles} icon={<Iconify icon="eva:shield-fill" width={24} />} color="info" />
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 1 }}>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          filterCity={filterCity}
          filterRole={filterRole}
          onFilterName={(e) => setFilterName(e.target.value)}
          onFilterCity={(e) => { setFilterCity(e.target.value); setFilterName(''); setFilterRole(''); }}
          onFilterRole={(e) => { setFilterRole(e.target.value); setFilterName(''); setFilterCity(''); }}
          onClearFilters={() => { setFilterName(''); setFilterCity(''); setFilterRole(''); }}
          onExport={() => exportToExcel(sortedUsers)}
          onDelete={() => handleDeleteSelected()}
          onTriggerSearch={() => dispatch(findPartnerByQuery(filterName.trim()))}
        />
        <Divider />

        {mdUp ? (
          <TableContainer
            ref={tableRef}
            sx={{
              maxHeight: 600,
              width: '100%',
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: 'background.paper' }}>
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < sortedUsers.length}
                      checked={sortedUsers.length > 0 && selected.length === sortedUsers.length}
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>
                  {[
                    { id: 'status', label: 'Status', width: '8%' },
                    { id: 'actions', label: 'Act', width: '5%' },
                    { id: 'name', label: 'Partner', width: '25%' },
                    { id: 'email', label: 'Email', width: '22%' },
                    { id: 'role', label: 'Role', width: '15%' },
                    { id: 'city', label: 'Location', width: '15%' },
                    { id: 'password', label: 'Password', width: '10%' },
                  ].map((column) => (
                    <TableCell
                      key={column.id}
                      sx={{
                        bgcolor: 'background.paper',
                        fontWeight: 600,
                        width: column.width,
                        cursor: column.id !== 'actions' ? 'pointer' : 'default',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                      }}
                      onClick={column.id !== 'actions' ? (e) => handleSort(e, column.id) : undefined}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {column.label}
                        {orderBy === column.id && (
                          <Iconify icon={order === 'asc' ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} width={14} />
                        )}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <UserTableRow
                    key={row._id}
                    selected={selected.includes(row._id)}
                    row={row}
                    handleClick={handleClick}
                    handleEdit={(r) => { setEditUser(r); setEditModalOpen(true); }}
                    handleContact={(r) => { setEditContact(r); setEditContactModal(true); }}
                    handleView={(r) => { setViewUser(r); setViewModalOpen(true); }}
                    handleDelete={() => handleDeleteSelected([row._id])}
                    handleStatusToggle={handleStatusToggle}
                  />
                ))}
                <TableEmptyRows height={43} emptyRows={emptyRowsCount} />
                {notFound && <TableNoData query={filterName || filterCity || filterRole} />}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 1 }}>
            <Stack spacing={1}>
              {selected.length > 0 && (
                <Stack direction="row" spacing={1} alignItems="center" px={1}>
                  <Typography variant="caption" color="text.secondary">
                    {selected.length} selected
                  </Typography>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteSelected()}>
                    Delete
                  </Button>
                </Stack>
              )}
              {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <Card
                  key={row._id}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                >
                  <CardContent sx={{ py: 1, px: 1, '&:last-child': { pb: 1 } }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Checkbox checked={selected.includes(row._id)} onChange={(e) => handleClick(e, row._id)} size="small" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {row.email}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Switch checked={row.status} onChange={() => handleStatusToggle(row._id, row.status)} color="primary" size="small" />
                        <IconButton onClick={(e) => openMobileMenu(e, row)} size="small">
                          <Iconify icon="eva:more-vertical-fill" width={18} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {notFound && <TableNoData query={filterName || filterCity || filterRole} />}
            </Stack>

            <Popover
              open={Boolean(mobileAnchorEl)}
              anchorEl={mobileAnchorEl}
              onClose={closeMobileMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 160, borderRadius: 1 } }}
            >
              <MenuItem onClick={() => { setViewUser(mobileRow); setViewModalOpen(true); closeMobileMenu(); }} sx={{ py: 1, typography: 'body2' }}>
                <Iconify icon="eva:eye-fill" sx={{ mr: 1, width: 16 }} /> View
              </MenuItem>
              <MenuItem onClick={() => { setEditUser(mobileRow); setEditModalOpen(true); closeMobileMenu(); }} sx={{ py: 1, typography: 'body2' }}>
                <Iconify icon="eva:edit-fill" sx={{ mr: 1, width: 16 }} /> Edit
              </MenuItem>
              <MenuItem onClick={() => { setEditContact(mobileRow); setEditContactModal(true); closeMobileMenu(); }} sx={{ py: 1, typography: 'body2' }}>
                <Iconify icon="eva:message-square-fill" sx={{ mr: 1, width: 16 }} /> Contacts
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={() => { handleDeleteSelected([mobileRow?._id]); closeMobileMenu(); }} sx={{ py: 1, typography: 'body2', color: 'error.main' }}>
                <Iconify icon="eva:trash-2-outline" sx={{ mr: 1, width: 16 }} /> Delete
              </MenuItem>
            </Popover>
          </Box>
        )}

        <Divider />
        <TablePagination
          component="div"
          count={sortedUsers.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[25, 50, 100]}
          sx={{
            '& .MuiTablePagination-toolbar': { minHeight: 48 },
          }}
        />
      </Card>

      {editContact && (
        <EditContact
          open={editContactModal}
          user={editContact}
          onClose={() => { setEditContactModal(false); setEditContact(null); }}
        />
      )}
      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={async (u) => {
          await dispatch(addPartner(u)).unwrap();
          setAddModalOpen(false);
          setRefresh((p) => !p);
          toast.success('Partner added successfully');
        }}
      />
      {editUser && (
        <EditUserModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditUser(null); }}
          user={editUser}
          onSubmit={async (u) => {
            await dispatch(updatedPartner({ userId: u._id, formData: u })).unwrap();
            setRefresh((p) => !p);
            toast.success('Partner updated successfully');
          }}
        />
      )}
      {viewUser && (
        <ViewUserModal
          open={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setViewUser(null); }}
          user={viewUser}
        />
      )}
    </Container>
  );
}
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

function StatsCard({ title, value, icon, color = 'primary', trend }) {
  const theme = useTheme();
  return (
    <Card 
      elevation={3}
      sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" fontWeight="bold" color={`${color}.main`} gutterBottom>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              {title}
            </Typography>
            {trend && (
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              borderRadius: '50%',
              p: 2,
              color: 'white',
              boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.3)}`,
            }}
          >
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
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          },
          transition: 'all 0.2s ease-in-out',
          border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox 
            checked={selected} 
            onChange={(e) => handleClick(e, row._id)}
            sx={{
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              }
            }}
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={row.status}
              onChange={() => handleStatusToggle(row._id, row.status)}
              color="success"
              size="small"
              sx={{
                '& .MuiSwitch-thumb': {
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                },
              }}
            />
            <Typography 
              variant="caption" 
              fontWeight="medium"
              color={row.status ? 'success.main' : 'text.secondary'}
            >
              {row.status ? 'Active' : 'Inactive'}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Tooltip title="More Actions">
            <IconButton 
              onClick={openMenu} 
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }
              }}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar 
              src={row.images?.[0]}
              sx={{ 
                width: 48, 
                height: 48,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
              }}
            >
              {!row.images?.[0] && row.name[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" noWrap fontWeight="600">
                {row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.role || 'Partner'}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="body2" noWrap>
            {row.email}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={row.role || 'Partner'} 
            size="small" 
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" noWrap>
            {row.city || '—'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" noWrap fontFamily="monospace">
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
          sx: { 
            borderRadius: 2, 
            boxShadow: theme.shadows[8],
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }
        }}
      >
        {[
          { label: 'View Details', icon: 'eva:eye-fill', action: handleView, color: 'primary' },
          { label: 'Edit Partner', icon: 'eva:edit-fill', action: handleEdit, color: 'warning' },
          { label: 'Messenger Contacts', icon: 'eva:message-square-fill', action: handleContact, color: 'info' },
          { label: 'Delete', icon: 'eva:trash-2-outline', action: handleDelete, color: 'error' },
        ].map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              item.action(row);
              closeMenu();
            }}
            sx={{ 
              py: 1.5,
              px: 2,
              color: theme.palette[item.color].main,
              '&:hover': {
                backgroundColor: alpha(theme.palette[item.color].main, 0.1),
              }
            }}
          >
            <Iconify icon={item.icon} sx={{ mr: 2 }} />
            {item.label}
          </MenuItem>
        ))}
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

  // Stats calculations
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
        toast.success(`Status ${!status ? 'activated' : 'deactivated'} successfully`);
      })
      .catch(() => toast.error('Status update failed'));
  };

  const handleDeleteSelected = (ids = selected) => {
    if (confirm(`Delete ${ids.length} item(s)?`)) {
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: 3,
          color: 'white'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              🤝 Partner Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your business partners and their access levels
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={() => setAddModalOpen(true)}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9),
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Add New Partner
          </Button>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Partners"
            value={totalUsers}
            icon={<Iconify icon="eva:people-fill" width={28} />}
            color="primary"
            trend={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Partners"
            value={activeUsers}
            icon={<Iconify icon="eva:checkmark-circle-2-fill" width={28} />}
            color="success"
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Inactive Partners"
            value={inactiveUsers}
            icon={<Iconify icon="eva:close-circle-fill" width={28} />}
            color="error"
            trend={-3.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Different Roles"
            value={roles}
            icon={<Iconify icon="eva:shield-fill" width={28} />}
            color="info"
            trend={0}
          />
        </Grid>
      </Grid>

      {/* Toolbar Card */}
      <Card sx={{ mb: 3, borderRadius: 3, overflow:'hidden' }}>
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
      </Card>

      {/* Main Listing Card (responsive) */}
      <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold">
            Partners List ({sortedUsers.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all your business partners
          </Typography>
        </Box>

        {mdUp ? (
          <TableContainer
            ref={tableRef}
            sx={{
              maxHeight: 700,
              width: '100%',
              '&::-webkit-scrollbar': { width: 8, height: 8 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 4,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.5) },
              },
              '&::-webkit-scrollbar-track': { backgroundColor: alpha(theme.palette.grey[300], 0.1) },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < sortedUsers.length}
                      checked={sortedUsers.length > 0 && selected.length === sortedUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {[
                    { id: 'status', label: 'Status', width: '10%' },
                    { id: 'actions', label: 'Actions', width: '10%' },
                    { id: 'name', label: 'Partner', width: '25%' },
                    { id: 'email', label: 'Email Address', width: '20%' },
                    { id: 'role', label: 'Role', width: '15%' },
                    { id: 'city', label: 'Location', width: '15%' },
                    { id: 'password', label: 'Password', width: '5%' },
                  ].map((column) => (
                    <TableCell
                      key={column.id}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        width: column.width,
                        cursor: column.id !== 'actions' ? 'pointer' : 'default',
                        '&:hover': column.id !== 'actions' ? { bgcolor: alpha(theme.palette.primary.main, 0.1) } : {},
                      }}
                      onClick={column.id !== 'actions' ? (e) => handleSort(e, column.id) : undefined}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {column.label}
                        {orderBy === column.id && (
                          <Iconify icon={order === 'asc' ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} width={16} />
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
                    handleEdit={(r) => {
                      setEditUser(r);
                      setEditModalOpen(true);
                    }}
                    handleContact={(r) => {
                      setEditContact(r);
                      setEditContactModal(true);
                    }}
                    handleView={(r) => {
                      setViewUser(r);
                      setViewModalOpen(true);
                    }}
                    handleDelete={() => handleDeleteSelected([row._id])}
                    handleStatusToggle={handleStatusToggle}
                  />
                ))}
                <TableEmptyRows height={73} emptyRows={emptyRowsCount} />
                {notFound && <TableNoData query={filterName || filterCity || filterRole} />}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 1.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < sortedUsers.length}
                    checked={sortedUsers.length > 0 && selected.length === sortedUsers.length}
                    onChange={handleSelectAll}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Select all
                  </Typography>
                </Stack>
                {selected.length > 0 && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {selected.length} selected
                    </Typography>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteSelected()}>
                      Delete
                    </Button>
                  </Stack>
                )}
              </Stack>
              {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <Card
                  key={row._id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <CardContent sx={{ py: 1, px: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
                      >
                        <Checkbox
                          checked={selected.includes(row._id)}
                          onChange={(e) => handleClick(e, row._id)}
                          size="small"
                        />
                        <Avatar
                          src={row.images?.[0]}
                          sx={{ width: 40, height: 40, border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}` }}
                        >
                          {!row.images?.[0] && row.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            noWrap
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {row.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {(row.role || 'Partner') + ' • ' + (row.city || '—')}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {row.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Switch
                          checked={row.status}
                          onChange={() => handleStatusToggle(row._id, row.status)}
                          color="success"
                          size="small"
                        />
                        <Tooltip title="More Actions">
                          <IconButton
                            onClick={(e) => openMobileMenu(e, row)}
                            size="small"
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </Tooltip>
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
              PaperProps={{ sx: { borderRadius: 2 } }}
            >
              {[
                { label: 'View Details', icon: 'eva:eye-fill', action: () => { setViewUser(mobileRow); setViewModalOpen(true); } },
                { label: 'Edit Partner', icon: 'eva:edit-fill', action: () => { setEditUser(mobileRow); setEditModalOpen(true); } },
                { label: 'Messenger Contacts', icon: 'eva:message-square-fill', action: () => { setEditContact(mobileRow); setEditContactModal(true); } },
                { label: 'Delete', icon: 'eva:trash-2-outline', action: () => handleDeleteSelected([mobileRow?._id]) },
              ].map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => { item.action(); closeMobileMenu(); }}
                  sx={{ py: 1, px: 2 }}
                >
                  <Iconify icon={item.icon} sx={{ mr: 1 }} />
                  <Typography variant="body2">{item.label}</Typography>
                </MenuItem>
              ))}
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
          rowsPerPageOptions={[25, 50, 100, 200]}
          sx={{
            '& .MuiTablePagination-toolbar': { px: 3, py: 2 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontWeight: 500 },
          }}
        />
      </Card>

      {/* Modals */}
      {editContact && (
        <EditContact
          open={editContactModal}
          user={editContact}
          onClose={() => {
            setEditContactModal(false);
            setEditContact(null);
          }}
        />
      )}
      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(u) => {
          dispatch(addPartner(u))
            .then(() => {
              setRefresh((p) => !p);
              toast.success('Partner added successfully');
            })
            .catch(() => toast.error('Failed to add partner'));
        }}
      />
      {editUser && (
        <EditUserModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditUser(null);
          }}
          user={editUser}
          onSubmit={(u) => {
            dispatch(updatedPartner({ userId: u._id, formData: u }))
              .then(() => {
                setRefresh((p) => !p);
                toast.success('Partner updated successfully');
              })
              .catch(() => toast.error('Failed to update partner'));
          }}
        />
      )}
      {viewUser && (
        <ViewUserModal
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setViewUser(null);
          }}
          user={viewUser}
        />
      )}
    </Container>
  );
}

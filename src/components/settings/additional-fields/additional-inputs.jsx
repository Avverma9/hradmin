import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  InputAdornment,
  Skeleton,
  Paper,
  Grid,
  Divider,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TablePagination,
} from '@mui/material';

// Import all necessary icons
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import KingBedIcon from '@mui/icons-material/KingBed';
import DeckIcon from '@mui/icons-material/Deck';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

// Import all required redux actions
import {
  addBedTypes, deleteBedTypes, getBedTypes,
  addAmenity, getAmenities, deleteAmenity,
  addMenu, deleteMenu, getMenuItems,
  addRole, getRole, deleteRole,
  addRoomTypes, deleteRoomTypes, getRoomTypes,
  addTravelAmenity, deleteTravelAmenity, getTravelAmenities
} from 'src/components/redux/reducers/additional-fields/additional';

// --- Reusable, Professionally Styled Management Card ---
const ManagementCard = ({
  title,
  icon,
  items,
  loading,
  onAdd,
  onDelete,
  renderForm,
  renderItem,
  searchKey = 'name',
  paginationEnabled = false,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredItems = Array.isArray(items)
    ? items.filter((item) =>
        item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const itemsToDisplay = paginationEnabled
    ? filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredItems;

  return (
    <Card elevation={4} sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={icon}
        title={<Typography variant="h6">{title}</Typography>}
        sx={{ bgcolor: 'action.hover' }}
      />
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Accordion expanded={isFormOpen} onChange={(e, expanded) => setIsFormOpen(expanded)} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="500">Add New</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {renderForm({ loading, onSuccess: () => setIsFormOpen(false) })}
          </AccordionDetails>
        </Accordion>
        
        <TextField
          fullWidth
          placeholder={`Search ${title}...`}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
          }}
          sx={{ my: 2 }}
        />
        
        <Box sx={{ height: 300, overflowY: 'auto', pr: 0.5 }}>
          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={50} sx={{ borderRadius: 1.5 }} />
              ))}
            </Stack>
          ) : itemsToDisplay.length > 0 ? (
            <List dense>
              {itemsToDisplay.map((item) => (
                <ListItem
                  key={item._id}
                  sx={{ '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1.5 }}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => onDelete(item._id)} disabled={loading}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  {renderItem(item)}
                </ListItem>
              ))}
            </List>
          ) : (
            <Stack justifyContent="center" alignItems="center" sx={{ height: '100%', color: 'text.secondary' }}>
              <PlaylistAddCheckIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography>No items found.</Typography>
            </Stack>
          )}
        </Box>
        
        {paginationEnabled && (
          <>
            <Divider sx={{ mt: 'auto', pt: 2 }} />
            <TablePagination
              component="div"
              count={filteredItems.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};


// --- Section Components ---

const RoleSection = () => {
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.additional.role);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => { dispatch(getRole()).finally(() => setLoading(false)); }, [dispatch]);

  const handleAdd = async (e, onSuccess) => {
    e.preventDefault(); if (!name.trim()) return; setLoading(true);
    await dispatch(addRole(name)); setName('');
    await dispatch(getRole()).finally(() => setLoading(false));
    onSuccess();
  };

  const handleDelete = async (id) => { setLoading(true); await dispatch(deleteRole(id)); await dispatch(getRole()).finally(() => setLoading(false)); };

  return (
    <ManagementCard
      title="Roles"
      icon={<AdminPanelSettingsIcon color="primary"/>}
      items={roles}
      loading={loading}
      onAdd={handleAdd}
      onDelete={handleDelete}
      searchKey="role"
      renderForm={({ loading: formLoading, onSuccess }) => (
        <form onSubmit={(e) => handleAdd(e, onSuccess)}>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label="New Role" variant="filled" size="small" value={name} onChange={(e) => setName(e.target.value)} disabled={formLoading} />
            <Button type="submit" variant="contained" endIcon={<AddIcon />} disabled={formLoading}>Add</Button>
          </Stack>
        </form>
      )}
      renderItem={(item) => <ListItemText primary={item.role} />}
    />
  );
};

const MenuItemSection = () => {
    const dispatch = useDispatch();
    const menuItems = useSelector((state) => state.additional.menuItems);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', path: '', role: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => { dispatch(getMenuItems()).finally(() => setLoading(false)); }, [dispatch]);
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleAdd = async (e, onSuccess) => {
        e.preventDefault();
        const { title, path, role } = formData;
        if (!title.trim() || !path.trim() || !role.trim()) return;
        setLoading(true);
        await dispatch(addMenu(formData));
        setFormData({ title: '', path: '', role: '' });
        await dispatch(getMenuItems()).finally(() => setLoading(false));
        onSuccess();
    };

    const handleDelete = async (id) => { setLoading(true); await dispatch(deleteMenu(id)); await dispatch(getMenuItems()).finally(() => setLoading(false)); };
    
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <ManagementCard
            title="Menu Items"
            icon={<MenuBookIcon color="primary"/>}
            items={menuItems}
            loading={loading}
            onAdd={handleAdd}
            onDelete={handleDelete}
            searchKey="title"
            paginationEnabled
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            renderForm={({ loading: formLoading, onSuccess }) => (
                <form onSubmit={(e) => handleAdd(e, onSuccess)}>
                    <Stack spacing={1.5}>
                        <TextField label="Title" name="title" size="small" variant="filled" value={formData.title} onChange={handleChange} disabled={formLoading} />
                        <TextField label="Path" name="path" size="small" variant="filled" value={formData.path} onChange={handleChange} disabled={formLoading} />
                        <TextField label="Role" name="role" size="small" variant="filled" value={formData.role} onChange={handleChange} disabled={formLoading} />
                        <Button type="submit" variant="contained" endIcon={<AddIcon />} disabled={formLoading}>Add Menu Item</Button>
                    </Stack>
                </form>
            )}
            renderItem={(item) => <ListItemText primary={item.title} secondary={`${item.path} — Role: ${item.role}`} />}
        />
    );
};

const createSimpleSection = (config) => () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.additional[config.stateKey]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => { dispatch(config.getThunk()).finally(() => setLoading(false)); }, [dispatch]);
  
  const handleAdd = async (e, onSuccess) => {
    e.preventDefault(); 
    if (!name.trim()) return; 
    setLoading(true);
    // This payload is a raw string, correct for Roles, BedTypes, RoomTypes, and HotelAmenities
    await dispatch(config.addThunk(name));
    setName('');
    await dispatch(config.getThunk()).finally(() => setLoading(false));
    onSuccess();
  };

  const handleDelete = async (id) => { setLoading(true); await dispatch(config.deleteThunk(id)); await dispatch(config.getThunk()).finally(() => setLoading(false)); };

  return (
    <ManagementCard
      title={config.title}
      icon={config.icon}
      items={items}
      loading={loading}
      onAdd={handleAdd}
      onDelete={handleDelete}
      renderForm={({ loading: formLoading, onSuccess }) => (
        <form onSubmit={(e) => handleAdd(e, onSuccess)}>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label={`New ${config.title.slice(0, -1)}`} variant="filled" size="small" value={name} onChange={(e) => setName(e.target.value)} disabled={formLoading} />
            <Button type="submit" variant="contained" endIcon={<AddIcon />} disabled={formLoading}>Add</Button>
          </Stack>
        </form>
      )}
      renderItem={(item) => <ListItemText primary={item.name} />}
    />
  );
};

// Based on the latest server errors, addAmenity expects a simple string payload.
const AmenitySection = createSimpleSection({ title: 'Hotel Amenities', icon: <DeckIcon color="primary"/>, stateKey: 'hotelAmenities', getThunk: getAmenities, addThunk: addAmenity, deleteThunk: deleteAmenity });
const RoomTypesSection = createSimpleSection({ title: 'Room Types', icon: <MeetingRoomIcon color="primary"/>, stateKey: 'roomTypes', getThunk: getRoomTypes, addThunk: addRoomTypes, deleteThunk: deleteRoomTypes });
const BedTypesSection = createSimpleSection({ title: 'Bed Types', icon: <KingBedIcon color="primary"/>, stateKey: 'bedTypes', getThunk: getBedTypes, addThunk: addBedTypes, deleteThunk: deleteBedTypes });

// --- Standalone Component ONLY for Travel Amenities due to its unique array payload ---
const TravelAmenitiesSection = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.additional.travelAmenities);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => { dispatch(getTravelAmenities()).finally(() => setLoading(false)); }, [dispatch]);

  const handleAdd = async (e, onSuccess) => {
    e.preventDefault(); if (!name.trim()) return; setLoading(true);
    // Corrected payload based on backend code: it must be an object with a "name" key holding an array.
    await dispatch(addTravelAmenity({ name: [name] }));
    setName('');
    await dispatch(getTravelAmenities()).finally(() => setLoading(false));
    onSuccess();
  };

  const handleDelete = async (id) => { setLoading(true); await dispatch(deleteTravelAmenity(id)); await dispatch(getTravelAmenities()).finally(() => setLoading(false)); };

  return (
    <ManagementCard
      title="Travel Amenities"
      icon={<FlightTakeoffIcon color="primary"/>}
      items={items}
      loading={loading}
      onAdd={handleAdd}
      onDelete={handleDelete}
      renderForm={({ loading: formLoading, onSuccess }) => (
        <form onSubmit={(e) => handleAdd(e, onSuccess)}>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label="New Travel Amenity" variant="filled" size="small" value={name} onChange={(e) => setName(e.target.value)} disabled={formLoading} />
            <Button type="submit" variant="contained" endIcon={<AddIcon />} disabled={formLoading}>Add</Button>
          </Stack>
        </form>
      )}
      renderItem={(item) => <ListItemText primary={item.name} />}
    />
  );
};


// --- Main Page Component ---
const AdditionalInputs = () => {
  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Settings
          </Typography>
          <Typography color="text.secondary">
            Manage additional fields and options used throughout the application.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}><RoleSection /></Grid>
            <Grid item xs={12} md={12} lg={8}><MenuItemSection /></Grid>
            <Grid item xs={12} md={6} lg={4}><RoomTypesSection /></Grid>
            <Grid item xs={12} md={6} lg={4}><BedTypesSection /></Grid>
            <Grid item xs={12} md={6} lg={4}><AmenitySection /></Grid>
            <Grid item xs={12} md={6} lg={4}><TravelAmenitiesSection /></Grid>
        </Grid>
    </Box>
  );
};

export default AdditionalInputs;
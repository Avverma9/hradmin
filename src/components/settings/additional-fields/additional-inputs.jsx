import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Checkbox,
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
    MenuItem,
    ListItemSecondaryAction,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TablePagination,
    Switch,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Chip,
    FormControlLabel,
    LinearProgress
} from '@mui/material';
import { useLocation } from 'react-router-dom';

// Import all necessary icons
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import KingBedIcon from '@mui/icons-material/KingBed';
import DeckIcon from '@mui/icons-material/Deck';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import BeachAccessIcon from '@mui/icons-material/BeachAccess'; // Icon for Tour Themes

// Import all required redux actions
import {
    addBedTypes, deleteBedTypes, getBedTypes,
    addAmenity, getAmenities, deleteAmenity,
    addMenu, deleteMenu, getMenuItems,
    addRole, getRole, deleteRole,
    addRoomTypes, deleteRoomTypes, getRoomTypes,
    addTravelAmenity, deleteTravelAmenity, getTravelAmenities,
    getTourThemes, addTourTheme, deleteTourThemes,
    changeMenuStatus,
    reorderMenuItems
} from 'src/components/redux/reducers/additional-fields/additional';

// --- Reusable Confirmation Dialog ---
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description }) => (
    <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {description}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">
                Cancel
            </Button>
            <Button onClick={onConfirm} color="primary" autoFocus>
                Confirm
            </Button>
        </DialogActions>
    </Dialog>
);


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
    renderList,
    defaultFormOpen = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(defaultFormOpen);

    useEffect(() => {
        if (defaultFormOpen) {
            setIsFormOpen(true);
        }
    }, [defaultFormOpen]);

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
                        renderList ? (
                            renderList({ items: itemsToDisplay, loading })
                        ) : (
                            <List dense>
                                {itemsToDisplay.map((item) => (
                                    <ListItem
                                        key={item._id}
                                        sx={{ '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1.5, pr: '100px' }} // Adjusted padding for actions
                                        secondaryAction={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {/* This is a generic structure; specific actions are passed via renderItem */}
                                            </Stack>
                                        }
                                    >
                                        {renderItem(item, loading)}
                                    </ListItem>
                                ))}
                            </List>
                        )
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
            renderItem={(item) => (
                <>
                    <ListItemText primary={item.role} />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => handleDelete(item._id)} disabled={loading}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </ListItemSecondaryAction>
                </>
            )}
        />
    );
};

const MenuItemSection = ({ defaultFormOpen = false }) => {
    const dispatch = useDispatch();
    const menuItems = useSelector((state) => state.additional.menuItems);
    const roleItems = useSelector((state) => state.additional.role);
    const [loading, setLoading] = useState(true);
    const [syncingOrder, setSyncingOrder] = useState(false);
    const [draggedMenuItemId, setDraggedMenuItemId] = useState(null);
    const [orderedMenuItems, setOrderedMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        parentLink: '',
        childLink: '',
        route: '',
        isParentOnly: false,
        role: ['Admin', 'Developer'],
        icon: 'MdDashboard',
        status: 'active',
        order: '',
    });
    const [confirmState, setConfirmState] = useState({ open: false, item: null });
    const getMenuItemId = (item) => item?._id || item?.id || item?.path;

    const sortMenuItems = (items = []) => (
        [...items].sort((a, b) => {
            const orderA = Number.isFinite(Number(a?.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
            const orderB = Number.isFinite(Number(b?.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
            if (orderA !== orderB) return orderA - orderB;
            const parentA = String(a?.parentLink || '');
            const parentB = String(b?.parentLink || '');
            if (parentA !== parentB) return parentA.localeCompare(parentB);
            const pathA = String(a?.path || a?.childLink || '');
            const pathB = String(b?.path || b?.childLink || '');
            return pathA.localeCompare(pathB);
        })
    );

    const buildOrderedMenuItems = (items = []) =>
        sortMenuItems(items).map((item, index) => ({
            ...item,
            order: index + 1,
        }));

    const roleOptions = Array.from(
        new Set([
            'Admin',
            'Developer',
            'PMS',
            'TMS',
            'CA',
            'Rider',
            ...(Array.isArray(roleItems) ? roleItems.map((item) => item?.role).filter(Boolean) : []),
        ])
    );

    useEffect(() => {
        dispatch(getRole());
        dispatch(getMenuItems()).finally(() => setLoading(false));
    }, [dispatch]);

    useEffect(() => {
        setOrderedMenuItems(buildOrderedMenuItems(Array.isArray(menuItems) ? menuItems : []));
    }, [menuItems]);
    
    const handleChange = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'role') {
            setFormData((prev) => ({
                ...prev,
                role: typeof value === 'string' ? value.split(',') : value,
            }));
            return;
        }

        if (name === 'isParentOnly') {
            setFormData((prev) => ({ ...prev, isParentOnly: Boolean(checked) }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleAdd = async (e, onSuccess) => {
        e.preventDefault();
        const { parentLink, childLink, route, role, isParentOnly } = formData;
        if (
            !parentLink.trim() ||
            (!isParentOnly && !childLink.trim() && !route.trim()) ||
            !Array.isArray(role) ||
            role.length === 0
        ) return;
        setLoading(true);
        await dispatch(addMenu(formData));
        setFormData({
            parentLink: '',
            childLink: '',
            route: '',
            isParentOnly: false,
            role: ['Admin', 'Developer'],
            icon: 'MdDashboard',
            status: 'active',
            order: '',
        });
        await dispatch(getMenuItems()).finally(() => setLoading(false));
        onSuccess();
    };

    const handleDelete = async (id) => { setLoading(true); await dispatch(deleteMenu(id)); await dispatch(getMenuItems()).finally(() => setLoading(false)); };

    const handleStatusChangeClick = (item) => {
        setConfirmState({ open: true, item });
    };

    const handleConfirmClose = () => {
        setConfirmState({ open: false, item: null });
    };

    const handleConfirmStatusChange = async () => {
        if (!confirmState.item) return;
        setLoading(true);
        const nextStatus = confirmState.item.isActive === false ? 'active' : 'inactive';
        await dispatch(changeMenuStatus({ id: confirmState.item._id, status: nextStatus }));
        await dispatch(getMenuItems()).finally(() => setLoading(false));
        handleConfirmClose();
    };

    const handleDropToReorder = async (dropTargetId) => {
        if (!draggedMenuItemId || !dropTargetId || draggedMenuItemId === dropTargetId) {
            setDraggedMenuItemId(null);
            return;
        }

        const fromIndex = orderedMenuItems.findIndex((item) => getMenuItemId(item) === draggedMenuItemId);
        const toIndex = orderedMenuItems.findIndex((item) => getMenuItemId(item) === dropTargetId);

        if (fromIndex < 0 || toIndex < 0) {
            setDraggedMenuItemId(null);
            return;
        }

        const nextItems = [...orderedMenuItems];
        const [movedItem] = nextItems.splice(fromIndex, 1);
        nextItems.splice(toIndex, 0, movedItem);

        const reindexedItems = nextItems.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setOrderedMenuItems(reindexedItems);
        setDraggedMenuItemId(null);
        setSyncingOrder(true);

        await dispatch(reorderMenuItems(reindexedItems));
        await dispatch(getMenuItems());
        setSyncingOrder(false);
    };


    return (
        <>
            <ConfirmationDialog
                open={confirmState.open}
                onClose={handleConfirmClose}
                onConfirm={handleConfirmStatusChange}
                title="Change Status"
                description={`Are you sure you want to ${confirmState.item && (confirmState.item.isActive === false ? 'activate' : 'deactivate')} this menu item?`}
            />
            <ManagementCard
                title="Menu Items"
                icon={<MenuBookIcon color="primary"/>}
                items={orderedMenuItems}
                loading={loading || syncingOrder}
                onAdd={handleAdd}
                onDelete={handleDelete}
                searchKey="parentLink"
                defaultFormOpen={defaultFormOpen}
                renderForm={({ loading: formLoading, onSuccess }) => (
                    <form onSubmit={(e) => handleAdd(e, onSuccess)}>
                        <Stack spacing={1.5}>
                            <Typography variant="caption" color="text.secondary">
                                Drag rows from handle to reorder sidebar items. Order updates instantly.
                            </Typography>
                            <TextField label="Parent Link" name="parentLink" size="small" variant="filled" value={formData.parentLink} onChange={handleChange} disabled={formLoading} />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="isParentOnly"
                                        checked={Boolean(formData.isParentOnly)}
                                        onChange={handleChange}
                                        disabled={formLoading}
                                    />
                                }
                                label="Parent Only (child route optional)"
                            />
                            <TextField
                                label="Child Link"
                                name="childLink"
                                placeholder="/dashboard/bookings"
                                size="small"
                                variant="filled"
                                value={formData.childLink}
                                onChange={handleChange}
                                disabled={formLoading}
                            />
                            <TextField
                                label="Route (optional, can be used instead of Child Link)"
                                name="route"
                                placeholder="/dashboard"
                                size="small"
                                variant="filled"
                                value={formData.route}
                                onChange={handleChange}
                                disabled={formLoading}
                            />
                            <TextField
                                label="Icon Key"
                                name="icon"
                                size="small"
                                variant="filled"
                                value={formData.icon}
                                onChange={handleChange}
                                disabled={formLoading}
                            />
                            <TextField
                                select
                                label="Status"
                                name="status"
                                size="small"
                                variant="filled"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={formLoading}
                            >
                                <MenuItem value="active">active</MenuItem>
                                <MenuItem value="inactive">inactive</MenuItem>
                            </TextField>
                            <TextField
                                label="Order (optional)"
                                name="order"
                                size="small"
                                variant="filled"
                                type="number"
                                value={formData.order}
                                onChange={handleChange}
                                disabled={formLoading}
                            />
                            <TextField
                                select
                                label="Roles"
                                name="role"
                                size="small"
                                variant="filled"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={formLoading}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (Array.isArray(selected) ? selected.join(', ') : selected),
                                }}
                            >
                                {roleOptions.map((roleName) => (
                                    <MenuItem key={roleName} value={roleName}>
                                        <Checkbox checked={Array.isArray(formData.role) && formData.role.includes(roleName)} />
                                        <ListItemText primary={roleName} />
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button type="submit" variant="contained" endIcon={<AddIcon />} disabled={formLoading}>Add Menu Item</Button>
                        </Stack>
                    </form>
                )}
                renderItem={() => null}
                renderList={({ items, loading: itemLoading }) => (
                    <>
                        {syncingOrder && <LinearProgress sx={{ mb: 1 }} />}
                        <List dense>
                            {items.map((item) => {
                                const itemId = getMenuItemId(item);
                                const isActive = item.isActive !== undefined ? item.isActive : true;
                                const isDragging = draggedMenuItemId === itemId;

                                return (
                                    <ListItem
                                        key={itemId}
                                        draggable={!itemLoading}
                                        onDragStart={() => setDraggedMenuItemId(itemId)}
                                        onDragEnd={() => setDraggedMenuItemId(null)}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={(event) => {
                                            event.preventDefault();
                                            handleDropToReorder(itemId);
                                        }}
                                        sx={{
                                            '&:hover': { bgcolor: 'action.hover' },
                                            borderRadius: 1.5,
                                            pr: '100px',
                                            opacity: isDragging ? 0.65 : 1,
                                            cursor: itemLoading ? 'progress' : 'grab',
                                            border: isDragging ? '1px dashed' : '1px solid transparent',
                                            borderColor: isDragging ? 'primary.main' : 'transparent',
                                        }}
                                    >
                                        <DragIndicatorIcon fontSize="small" sx={{ mr: 1.5, color: 'text.disabled' }} />
                                        <ListItemText
                                            primary={`${item.parentLink} (Order: ${item.order || '-'})`}
                                            secondary={`${item.path || (item.isParentOnly ? '# (Parent Only)' : item.childLink)} — Role: ${item.role}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Chip label={isActive ? 'Active' : 'Inactive'} color={isActive ? 'success' : 'default'} size="small" />
                                                <Switch
                                                    edge="end"
                                                    onChange={() => handleStatusChangeClick(item)}
                                                    checked={isActive}
                                                    disabled={itemLoading}
                                                />
                                                <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => handleDelete(item._id)} disabled={itemLoading}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </>
                )}
            />
        </>
    );
};


const createSimpleSection = (config) => () => {
    const dispatch = useDispatch();
    const items = useSelector((state) => state.additional[config.stateKey]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');

    useEffect(() => { dispatch(config.getThunk()).finally(() => setLoading(false)); }, [dispatch, config.getThunk]);
    
    const handleAdd = async (e, onSuccess) => {
        e.preventDefault(); 
        if (!name.trim()) return; 
        setLoading(true);
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
             renderItem={(item, itemLoading) => (
                <>
                    <ListItemText primary={item.name} />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => handleDelete(item._id)} disabled={itemLoading}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </ListItemSecondaryAction>
                </>
            )}
        />
    );
};



const AmenitySection = createSimpleSection({ title: 'Hotel Amenities', icon: <DeckIcon color="primary"/>, stateKey: 'hotelAmenities', getThunk: getAmenities, addThunk: addAmenity, deleteThunk: deleteAmenity });
const RoomTypesSection = createSimpleSection({ title: 'Room Types', icon: <MeetingRoomIcon color="primary"/>, stateKey: 'roomTypes', getThunk: getRoomTypes, addThunk: addRoomTypes, deleteThunk: deleteRoomTypes });
const BedTypesSection = createSimpleSection({ title: 'Bed Types', icon: <KingBedIcon color="primary"/>, stateKey: 'bedTypes', getThunk: getBedTypes, addThunk: addBedTypes, deleteThunk: deleteBedTypes });
const TourThemesSection = createSimpleSection({ title: 'Tour Themes', icon: <BeachAccessIcon color="primary"/>, stateKey: 'tourThemes', getThunk: getTourThemes, addThunk: addTourTheme, deleteThunk: deleteTourThemes });

const TravelAmenitiesSection = () => {
    const dispatch = useDispatch();
    const items = useSelector((state) => state.additional.travelAmenities);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');

    useEffect(() => { dispatch(getTravelAmenities()).finally(() => setLoading(false)); }, [dispatch]);

    const handleAdd = async (e, onSuccess) => {
        e.preventDefault(); if (!name.trim()) return; setLoading(true);
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
            renderItem={(item, itemLoading) => (
                <>
                    <ListItemText primary={item.name} />
                     <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => handleDelete(item._id)} disabled={itemLoading}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </ListItemSecondaryAction>
                </>
            )}
        />
    );
};


// --- Main Page Component ---
const AdditionalInputs = () => {
    const location = useLocation();
    const isAddMenuItemRoute = location.pathname === '/add-menu-item';

    if (isAddMenuItemRoute) {
        return (
            <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Menu Management
                    </Typography>
                    <Typography color="text.secondary">
                        Add, update status, delete, and drag to reorder sidebar menu items.
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <MenuItemSection defaultFormOpen />
                    </Grid>
                </Grid>
            </Box>
        );
    }

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
                <Grid item xs={12} md={6} lg={4}><RoomTypesSection /></Grid>
                <Grid item xs={12} md={6} lg={4}><BedTypesSection /></Grid>
                <Grid item xs={12} md={6} lg={4}><AmenitySection /></Grid>
                <Grid item xs={12} md={6} lg={4}><TravelAmenitiesSection /></Grid>
                <Grid item xs={12} md={6} lg={4}><TourThemesSection /></Grid>
            </Grid>
        </Box>
    );
};

export default AdditionalInputs;

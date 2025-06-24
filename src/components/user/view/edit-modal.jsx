import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

import { Close, Person, VpnKey, Business,   Visibility, VisibilityOff, Phone, Mail, Add, Cancel } from '@mui/icons-material';
import {
  Box,
  Grid,
  Chip,
  Card,
  Button,
  Dialog,
  Select,
  Avatar,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  CardHeader,
  CardContent,
  FormControl,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';

import { useDispatch } from 'react-redux';
import { addMenu, deleteMenu } from 'src/components/redux/reducers/partner';
import { useMenuItems } from '../../../../utils/additional/menuItems';
import { useRole } from '../../../../utils/additional/role';

const StatusIndicator = ({ active }) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Box
      component="span"
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: active ? 'success.main' : 'error.main',
      }}
    />
    <Typography variant="body2" sx={{ color: active ? 'success.dark' : 'error.dark' }}>
      {active ? 'Active' : 'Inactive'}
    </Typography>
  </Box>
);

StatusIndicator.propTypes = { active: PropTypes.bool };

const EditUserModal = ({ open, onClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [openSelect, setOpenSelect] = useState(false);
  const [initialMenuItems, setInitialMenuItems] = useState([]);
  const [assignedSearchTerm, setAssignedSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const paths = useMenuItems();
  const role = useRole();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id || '',
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        address: user.address || '',
        password: user.password ||'',
        role: user.role || '',
        status: user.status || false,
      });
      
      const currentItems = Array.isArray(user.menuItems) ? user.menuItems : [];
      setSelectedMenuItems(currentItems);
      setInitialMenuItems(currentItems);
      setImagePreview(user.images || '');
      setImageFile(null);
      setAssignedSearchTerm('');
      setShowPassword(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'status' ? value === 'true' || value === true : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(user.images || '');
  };

  const handleAddMenuItems = async () => {
    const itemsToAdd = selectedMenuItems
      .filter(item => !initialMenuItems.some(existing => existing.path === item.path));

    if (itemsToAdd.length === 0) {
      toast.info('No new menu items selected to add.');
      setOpenSelect(false);
      return;
    }

    try {
      const payload = { 
        userId: user._id, 
        matchedMenuItems: itemsToAdd.map(item => ({ title: item.title, path: item.path })) 
      };
      await dispatch(addMenu(payload));
      toast.success('Menu items added successfully!');
      
      setInitialMenuItems([...selectedMenuItems]); 
      setOpenSelect(false);
    } catch (error) {
      console.error('Error adding menu items:', error);
      toast.error('Failed to add menu items');
    }
  };

  const handleDeleteMenuItem = async (itemToDelete) => {
    try {
      await dispatch(deleteMenu({ id: user._id, menuId: itemToDelete._id }));
      
      const updatedItems = selectedMenuItems.filter((item) => item.path !== itemToDelete.path);
      setSelectedMenuItems(updatedItems);
      setInitialMenuItems(updatedItems);

      toast.success('Menu item deleted.');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleSubmit = () => {
    const updatedUserPayload = {
      ...formData,
      images: imageFile, 
    };
    
    onSubmit(updatedUserPayload);
    onClose();
  };
  
  const filteredAssignedItems = selectedMenuItems.filter(item => 
    item.title.toLowerCase().includes(assignedSearchTerm.toLowerCase())
  );
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" fontWeight="600">
            Edit Partner Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={imagePreview} sx={{ width: {xs: 100, sm: 140}, height: {xs: 100, sm: 140}, border: '3px solid', borderColor: 'grey.300' }} />
                    {imageFile && (
                        <IconButton
                          size="small"
                          onClick={handleRemoveImage}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            color: 'black',
                            boxShadow: 1,
                            '&:hover': {
                              bgcolor: 'white',
                            },
                          }}
                        >
                          <Close sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                    )}
                </Box>
                <Typography variant="h6" gutterBottom noWrap sx={{ mt: 2 }}>{formData.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom noWrap>{formData.email}</Typography>
                <StatusIndicator active={formData.status} />
                <Button variant="outlined" component="label" color="inherit" sx={{ mt: 3, textTransform: 'none' }}>
                  Upload Photo
                  <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
             <Card variant="outlined" sx={{ mb: { xs: 2, sm: 3 } }}>
              <CardHeader title="Account Information" titleTypographyProps={{ fontWeight: '600' }} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField name="name" label="Name" fullWidth value={formData.name || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} /></Grid>
                  <Grid item xs={12} sm={6}><TextField name="mobile" label="Mobile" fullWidth value={formData.mobile || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} /></Grid>
                  <Grid item xs={12}><TextField name="email" label="Email" fullWidth value={formData.email || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Mail color="action" /></InputAdornment> }} /></Grid>
                  <Grid item xs={12}><TextField name="address" label="Address" fullWidth value={formData.address || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Business color="action" /></InputAdornment> }} /></Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select name="role" value={formData.role || ''} onChange={handleChange} label="Role">
                        {role.map((item) => ( <MenuItem key={item._id} value={item.role}>{item.role}</MenuItem> ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <TextField 
                       name="password" 
                       type={showPassword ? 'text' : 'password'}
                       label="New Password" 
                       position="start"
                       fullWidth 
                       value={formData.password || ''} 
                       onChange={handleChange} 
                       InputProps={{ 
                         startAdornment: (
                           <InputAdornment position="start">
                             <VpnKey color="action" />
                           </InputAdornment>
                         ),
                         endAdornment: (
                           <InputAdornment position="end">
                             <IconButton
                               aria-label="toggle password visibility"
                               onClick={handleClickShowPassword}
                               onMouseDown={handleMouseDownPassword}
                               edge="end"
                             >
                               {showPassword ? <VisibilityOff /> : <Visibility />}
                             </IconButton>
                           </InputAdornment>
                         ),
                       }} 
                     />
                   </Grid>
                 
                
                
                </Grid>
              </CardContent>
            </Card>

             <Card variant="outlined">
              <CardHeader title="Menu Permissions" titleTypographyProps={{ fontWeight: '600' }}/>
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Assign Menu Items</InputLabel>
                  <Select
                    multiple
                    open={openSelect}
                    onOpen={() => setOpenSelect(true)}
                    onClose={() => setOpenSelect(false)}
                    value={selectedMenuItems}
                    onChange={(e) => setSelectedMenuItems(e.target.value)}
                    renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(item => <Chip key={item.path} label={item.title} size="small" />)}</Box>}
                  >
                    {paths.map((path) => (
                      <MenuItem key={path._id} value={path}>
                        <Checkbox checked={selectedMenuItems.some(item => item.path === path.path)} />
                        <ListItemText primary={path.title} />
                      </MenuItem>
                    ))}
                     <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button onClick={() => setOpenSelect(false)} variant="outlined" color="inherit" startIcon={<Cancel />}>Cancel</Button>
                          <Button onClick={handleAddMenuItems} variant="contained" color="primary" startIcon={<Add />}>Add Items</Button>
                      </Box>
                  </Select>
                </FormControl>
                
                <TextField 
                  label="Search Assigned Items..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={assignedSearchTerm}
                  onChange={(e) => setAssignedSearchTerm(e.target.value)}
                  sx={{ mt: 3, mb: 1.5 }}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, p: 2, borderRadius: 2, bgcolor: 'grey.100', minHeight: '80px', maxHeight: '150px', overflowY: 'auto' }}>
                  {filteredAssignedItems.length > 0 ? (
                    filteredAssignedItems.map((item) => (
                      <Chip
                        key={item.path}
                        label={item.title}
                        onDelete={() => handleDeleteMenuItem(item)}
                        sx={{ bgcolor: 'white', border: 1, borderColor: 'grey.300' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', width: '100%', textAlign: 'center', p: 1, alignSelf: 'center' }}>
                      {selectedMenuItems.length > 0 ? 'No items match your search.' : 'No menu items have been assigned.'}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

EditUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    mobile: PropTypes.string,
    address: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.bool,
    images: PropTypes.string,
    menuItems: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      path: PropTypes.string,
    })),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EditUserModal;

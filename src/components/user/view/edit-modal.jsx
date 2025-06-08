/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

import { Close } from '@mui/icons-material';
import {
    Box,
    Grid,
    Button,
    Dialog,
    Select,
    Avatar,
    Divider,
    MenuItem,
    Checkbox,
    TextField,
    InputLabel,
    Typography,
    IconButton,
    FormControl,
    DialogTitle,
    ListItemText,
    DialogActions,
    DialogContent,
} from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { addMenu, deleteMenu, updatePartnerImage } from 'src/components/redux/reducers/partner';
import { useMenuItems } from '../../../../utils/additional/menuItems';
import { useRole } from '../../../../utils/additional/role';

const EditUserModal = ({ open, onClose, user, onSubmit }) => {
    const [selectedMenuItems, setSelectedMenuItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSelect, setOpenSelect] = useState(false);
    const paths = useMenuItems()
    const role = useRole()
    const dispatch = useDispatch();
    const partnerImage = useSelector((state) => state.partner.partnerImage);
    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        email: '',
        mobile: '',
        address: '',
        password: '',
        role: '',
        status: false,
        images: '',
        imageUrl: '',
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                _id: user._id,
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                address: user.address || '',
                password: user.password || '',
                role: user.role || '',
                status: user.status || false,
                images: user.images || '',
                imageUrl: user.images || '',
            });
            setSelectedMenuItems(user.menuItems || []);
        }
    }, [user]);
    console.log("user data", user._id)
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'status' ? value === 'true' : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async () => {
        const matchedMenuItems = selectedMenuItems.map((item) => {
            return {
                title: item.title,  // We use the title as name
                path: item.path    // Path remains the same
            };
        });


        const updatedUser = {
            ...formData,
            menuItems: matchedMenuItems,
        };


        // Handle image upload if a new image file is selected
        if (imageFile) {
            const formDataToSend = new FormData();
            formDataToSend.append('image', imageFile);
            try {
                await dispatch(updatePartnerImage({ userId: user._id, formDataToSend }));
                updatedUser.imageUrl = partnerImage.imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image');
                return; // Stop further execution on error
            }
        }
        onSubmit(updatedUser);
        onClose();
    };

    const handleAddMenuItems = async () => {
        if (selectedMenuItems.length === 0) return;

        const matchedMenuItems = selectedMenuItems.map((item) => {
            return {
                title: item.title,  // Send the `title` of the menu item
                path: item.path    // Send the `path` of the menu item
            };
        });

        try {
            await dispatch(addMenu({ userId: user._id, matchedMenuItems }));
        } catch (error) {
            console.error('Error adding menu items:', error);
            toast.error('Failed to add menu items');
        }
    };

    const handleCancel = () => {
        setOpenSelect(false);
    };

    const handleDeleteMenuItem = async (item) => {
        try {
            const payload = {
                id: user._id,
                menuId: item._id
            }
            await dispatch(deleteMenu(payload));
            const updatedMenuItems = selectedMenuItems.filter((menu) => menu !== item);
            setSelectedMenuItems(updatedMenuItems);
        } catch (error) {
            console.error('Error deleting menu item:', error);
            toast.error('Failed to delete menu item');
        }
    };

    const filteredMenuItems = selectedMenuItems.filter(
        (item) =>
            typeof item === 'object' &&
            typeof item.title === 'string' &&
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log("fileterf ,", filteredMenuItems)
    console.log("selecrted menu", selectedMenuItems)
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({
                ...prev,
                images: file, // Set file object directly here
                imageUrl: URL.createObjectURL(file), // For preview
            }));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    position: 'relative',
                    py: 2,
                }}
            >
                Edit User Information
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10, color: '#fff' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#fafafa', padding: '2rem' }}>
                <Box display="flex" justifyContent="center" mb={3}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar src={formData.imageUrl} sx={{ width: 100, height: 100, mb: 2, border: '2px solid #1976d2' }} />
                        <Button variant="contained" component="label" color="primary">
                            Upload Photo
                            <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                        </Button>
                    </Box>
                </Box>
                <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={2}>
                        {['name', 'email', 'mobile', 'address', 'password'].map((field) => (
                            <Grid item xs={12} sm={6} key={field}>
                                <TextField
                                    name={field}
                                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                                    placeholder={`Enter ${field}`}
                                    fullWidth
                                    value={formData[field]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1565c0',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Select Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    sx={{ borderRadius: '8px' }}
                                    label="Select Role"
                                >
                                    {role.map((item) => (
                                        <MenuItem key={item._id} value={item.role}>
                                            {item.role}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Select Status</InputLabel>
                                <Select name="status" value={formData.status} onChange={handleChange} sx={{ borderRadius: '8px' }}>
                                    <MenuItem value>Active</MenuItem>
                                    <MenuItem value={false}>Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Assign Menu Items</InputLabel>
                                <div style={{ position: 'relative' }}>
                                    <Select
                                        open={openSelect}
                                        multiple
                                        value={selectedMenuItems}
                                        onChange={(e) => setSelectedMenuItems(e.target.value)}
                                        onOpen={() => setOpenSelect(true)} // When dropdown opens, set open to true
                                        onClose={() => setOpenSelect(false)} // When dropdown closes, set open to false
                                        renderValue={(selected) => selected.map(item => item.title).join(', ')} // Use `title` here to display selected items
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: '600px', // Set max height to 400px
                                                    overflowY: 'auto', // Enable vertical scrolling
                                                    paddingBottom: '40px', // Increased space at the bottom for both buttons
                                                },
                                            },
                                        }}
                                        sx={{ borderRadius: '8px', width: '100%' }}
                                    >
                                        {paths.map((path) => (
                                            <MenuItem key={path._id} value={path}>
                                                <Checkbox checked={selectedMenuItems.some(item => item.path === path.path)} />
                                                <ListItemText
                                                    primary={path.title}
                                                    secondary={path.role ? `Role: ${path.role}` : 'No specific role'}
                                                />
                                            </MenuItem>
                                        ))}


                                        {/* Buttons for Add and Cancel */}
                                        <div
                                            style={{
                                                position: 'sticky',
                                                bottom: '-10px', // Position buttons at the bottom
                                                left: 0,
                                                right: 0,
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '0 10px',
                                                zIndex: 1,
                                            }}
                                        >
                                            <Button
                                                onClick={handleCancel}
                                                variant="contained"
                                                color="secondary"
                                                sx={{
                                                    width: '45%', // Button takes up half width
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddMenuItems}
                                                variant="contained"
                                                color="primary"
                                                sx={{
                                                    width: '45%', // Button takes up half width
                                                }}
                                            >
                                                Add Menu Items
                                            </Button>
                                        </div>
                                    </Select>


                                </div>
                            </FormControl>
                        </Grid>

                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                        Current Menu Items
                    </Typography>
                    <Grid item xs={12}>
                        <TextField
                            label="Search Menu Items"
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1565c0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                            }}
                        />
                    </Grid>
                    <Box
                        sx={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '10px',
                            backgroundColor: '#f0f4f8',
                            mt: 1,
                        }}
                    >
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.3s',
                                        '&:hover': {
                                            backgroundColor: '#e0f7fa',
                                        },
                                    }}
                                >
                                    <Typography variant="body1">{item.title}</Typography>
                                    <Button variant="outlined" color="error" onClick={() => handleDeleteMenuItem(item)} sx={{ ml: 1 }}>
                                        Delete
                                    </Button>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center' }}>
                                No menu items found
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Save Changes
                </Button>
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
        password: PropTypes.string,
        role: PropTypes.string,
        status: PropTypes.bool,
        images: PropTypes.string,
        menuItems: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default EditUserModal;

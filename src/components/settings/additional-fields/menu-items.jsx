import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Stack,
    Skeleton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { addMenu, deleteMenu, getMenuItems } from 'src/components/redux/reducers/additional-fields/additional';

const MenuItem = () => {
    const dispatch = useDispatch();
    const menuItems = useSelector((state) => state.additional.menuItems);

    const [formData, setFormData] = useState({
        title: '',
        path: '',
        role: '',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        dispatch(getMenuItems()).finally(() => setLoading(false));
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAddMenu = async (e) => {
        e.preventDefault();
        const { title, path, role } = formData;
        if (!title.trim() || !path.trim() || !role.trim()) return;

        setLoading(true);
        await dispatch(addMenu(formData));
        setFormData({ title: '', path: '', role: '' });
        await dispatch(getMenuItems());
        setLoading(false);
    };

    const handleDeleteMenu = async (id) => {
        setLoading(true);
        await dispatch(deleteMenu(id));
        await dispatch(getMenuItems());
        setLoading(false);
    };

    // Filter by search term
    const filteredItems = Array.isArray(menuItems)
        ? menuItems.filter((item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', mt: 5, height: 500, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" align="center" gutterBottom>
                Menu Items
            </Typography>

            <form onSubmit={handleAddMenu}>
                <Stack spacing={2} mb={2}>
                    <TextField
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        disabled={loading}
                    />
                    <TextField
                        label="Path"
                        name="path"
                        value={formData.path}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        disabled={loading}
                    />
                    <TextField
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        disabled={loading}
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        Add Menu Item
                    </Button>
                </Stack>
            </form>

            {/* Search box */}
            <TextField
                label="Search by Title"
                variant="standard"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
            />

            {/* Scrollable List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Stack spacing={1}>
                    {loading ? (
                        // Show 6 skeleton rows while loading
                        Array.from(new Array(6)).map((_, index) => (
                            <Skeleton
                                key={index}
                                variant="rectangular"
                                height={50}
                                sx={{ borderRadius: 1, mb: 1 }}
                            />
                        ))
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Box
                                key={item._id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.5,
                                }}
                            >
                                <Box sx={{ flex: 1, pr: 2 }}>
                                    <Typography variant="body1" noWrap>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {item.path} — {item.role}
                                    </Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteMenu(item._id)}
                                    disabled={loading}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary" align="center">
                            No menu items found.
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default MenuItem;

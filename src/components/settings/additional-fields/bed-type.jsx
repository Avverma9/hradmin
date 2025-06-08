import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Typography,
    Skeleton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { addBedTypes, deleteBedTypes, getBedTypes } from 'src/components/redux/reducers/additional-fields/additional';

const BedTypes = () => {
    const dispatch = useDispatch();
    const bedTypes = useSelector((state) => state.additional.bedTypes);

    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        dispatch(getBedTypes()).finally(() => setLoading(false));
    }, [dispatch]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        await dispatch(addBedTypes(name));
        setName('');
        await dispatch(getBedTypes());
        setLoading(false);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        await dispatch(deleteBedTypes(id));
        await dispatch(getBedTypes());
        setLoading(false);
    };

    const filtered = Array.isArray(bedTypes)
        ? bedTypes.filter((type) =>
            type.name.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
                Bed Types
            </Typography>

            <form onSubmit={handleAdd}>
                <Stack spacing={2} mb={2}>
                    <TextField
                        label="New Bed Type"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        variant="standard"
                        disabled={loading}
                    />
                    <Button variant="contained" type="submit" disabled={loading}>
                        Add Bed Type
                    </Button>
                </Stack>
            </form>

            <TextField
                label="Search Bed Types"
                variant="standard"
                fullWidth
                sx={{ mb: 2 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />

            {/* List container with fixed height and scroll */}
            <Box
                sx={{
                    height: 300,
                    overflowY: 'auto',
                    p: 1,
                }}
            >
                <Stack spacing={1}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                        ))
                    ) : filtered.length > 0 ? (
                        filtered.map((type) => (
                            <Box
                                key={type._id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.5,
                                }}
                            >
                                <Typography variant="body1" noWrap sx={{ flex: 1, pr: 2 }}>
                                    {type.name}
                                </Typography>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(type._id)}
                                    disabled={loading}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary" align="center">
                            No bed types found.
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default BedTypes;

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Typography,
    Skeleton,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux';
import {
    addTravelAmenity,
    deleteTravelAmenity,
    getTravelAmenities,
} from 'src/components/redux/reducers/additional-fields/additional';

const TravelAmenities = () => {
    const dispatch = useDispatch();
    const travelAmenities = useSelector((state) => state.additional.travelAmenities);
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        dispatch(getTravelAmenities()).finally(() => setLoading(false));
    }, [dispatch]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await dispatch(addTravelAmenity({ name }));
        setName('');
        await dispatch(getTravelAmenities());
        setLoading(false);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        await dispatch(deleteTravelAmenity(id));
        await dispatch(getTravelAmenities());
        setLoading(false);
    };

    const filtered = Array.isArray(travelAmenities)
        ? travelAmenities.filter((item) =>
            item?.name?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    return (
        <Box sx={{ width: '100%', maxWidth: 450, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Travel Amenities
            </Typography>

            <form onSubmit={handleAdd}>
                <Stack direction="row" spacing={1} mb={2}>
                    <TextField
                        fullWidth
                        label="New Amenity"
                        variant="standard"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                    <Button type="submit" variant="contained" disabled={loading}>
                        Add
                    </Button>
                </Stack>
            </form>

            <TextField
                fullWidth
                placeholder="Search amenities..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <Box
                sx={{
                    height: 300,
                    overflowY: 'auto',
                    pr: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                    ))
                ) : filtered.length > 0 ? (
                    filtered.map((item) => (
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
                            <Typography variant="body1" noWrap>
                                {item.name}
                            </Typography>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(item._id)}
                                disabled={loading}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))
                ) : (
                    <Typography color="text.secondary" align="center">
                        No amenities found.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default TravelAmenities;

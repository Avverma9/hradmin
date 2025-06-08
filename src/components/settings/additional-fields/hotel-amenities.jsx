import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addAmenity,
    getAmenities,
    deleteAmenity,
} from 'src/components/redux/reducers/additional-fields/additional';

import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Stack,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const Amenity = () => {
    const dispatch = useDispatch();
    const [amenityInput, setAmenityInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const hotelAmenities = useSelector((state) => state.additional.hotelAmenities);

    useEffect(() => {
        dispatch(getAmenities());
    }, [dispatch]);

    const handleAddAmenity = async (e) => {
        e.preventDefault();
        if (!amenityInput.trim()) return;

        await dispatch(addAmenity({ name: amenityInput }));
        setAmenityInput('');
        dispatch(getAmenities());
    };

    const handleDeleteAmenity = async (id) => {
        await dispatch(deleteAmenity(id));
        dispatch(getAmenities());
    };

    const filteredAmenities = hotelAmenities?.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" align="center" gutterBottom>
               Hotel Amenities
            </Typography>

            <form onSubmit={handleAddAmenity}>
                <Stack direction="row" spacing={1} mb={2}>
                    <TextField
                        fullWidth
                        label="New Amenity"
                        variant="standard"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Add
                    </Button>
                </Stack>
            </form>

            <TextField
                fullWidth
                placeholder="Search amenities..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredAmenities && filteredAmenities.length > 0 ? (
                    filteredAmenities.map((item) => (
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
                                onClick={() => handleDeleteAmenity(item._id)}
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

export default Amenity;

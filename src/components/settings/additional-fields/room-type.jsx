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
import { addRoomTypes, deleteRoomTypes, getRoomTypes } from 'src/components/redux/reducers/additional-fields/additional';

const RoomTypes = () => {
  const dispatch = useDispatch();
  const roomTypes = useSelector((state) => state.additional.roomTypes);

  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show skeleton loading while fetching
    setLoading(true);
    dispatch(getRoomTypes()).finally(() => setLoading(false));
  }, [dispatch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await dispatch(addRoomTypes(name));
    setName('');
    await dispatch(getRoomTypes());
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    await dispatch(deleteRoomTypes(id));
    await dispatch(getRoomTypes());
    setLoading(false);
  };

  const filtered = Array.isArray(roomTypes)
    ? roomTypes.filter((type) =>
        type.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Room Types
      </Typography>

      <form onSubmit={handleAdd}>
        <Stack spacing={2} mb={2}>
          <TextField
            label="New Room Type"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="standard"
            disabled={loading}
          />
          <Button variant="contained" type="submit" disabled={loading}>
            Add Room Type
          </Button>
        </Stack>
      </form>

      <TextField
        label="Search Room Types"
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
          height: 300, // fixed height for scroll
          overflowY: 'auto',
          p: 1,
        }}
      >
        <Stack spacing={1}>
          {loading ? (
            // Show 5 skeleton rows while loading
            Array.from(new Array(5)).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={40}
                sx={{ borderRadius: 1, mb: 1 }}
              />
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
              No room types found.
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default RoomTypes;

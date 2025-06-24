import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add, Delete, LocationCity, PhotoCamera, Clear } from '@mui/icons-material';

import { localUrl } from '../../../../utils/util';

const TravelLocation = () => {
  const [travelData, setTravelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const fetchTravelData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${localUrl}/get-all/travel/location`);
      setTravelData(response.data.map((item, index) => ({ ...item, serialId: index + 1 })));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch locations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTravelData();
  }, [fetchTravelData]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        setImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    }
  };

  const clearImages = () => {
      setImages([]);
      setImagePreviews([]);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    formData.append('location', location);

    try {
      const response = await axios.post(`${localUrl}/add-a/travel/location`, formData);
      if (response.status === 201) {
        toast.success('Added a new travel location');
        setLocation('');
        setImages([]);
        setImagePreviews([]);
        fetchTravelData(); // Re-fetch data to show the new location
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to add location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${localUrl}/delete-by-id/travel/location/${id}`);
      toast.success('Successfully deleted');
      fetchTravelData();
    } catch (error) {
      toast.error("It seem's an error !");
    }
  };

  const columns = [
    { field: 'serialId', headerName: 'ID', width: 90 },
    { field: 'location', headerName: 'Location', width: 200 },
    {
      field: 'images',
      headerName: 'Images',
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {(params.value || []).map((image, index) => (
            <Avatar key={index} src={image} variant="rounded" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
            <Delete />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = travelData.map(item => ({ id: item._id, ...item }));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Travel Locations
        </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Add New Location
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                label="Location Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                InputProps={{
                    startAdornment: <LocationCity sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCamera />}
                sx={{ my: 2 }}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
              {imagePreviews.length > 0 && (
                <Paper variant='outlined' sx={{p:1, mb: 2}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2">Image Previews</Typography>
                        <IconButton onClick={clearImages} size="small"><Clear/></IconButton>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {imagePreviews.map((src, i) => <Avatar key={i} src={src} variant="rounded" />)}
                    </Stack>
                </Paper>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting || !location || images.length === 0}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Add />}
              >
                {isSubmitting ? 'Adding...' : 'Add Location'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ height: '75vh', width: '100%', borderRadius: 3 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[25, 50,100]}
              initialState={{
                  pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                  },
              }}
              slots={{
                  toolbar: GridToolbar,
              }}
              sx={{ border: 0 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TravelLocation;

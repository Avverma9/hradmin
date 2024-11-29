import axios from 'axios';
import { toast } from 'react-toastify';
import { AiOutlineDelete } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Table,
  Paper,
  Button,
  TableRow,
  TextField,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  CircularProgress,
} from '@mui/material';
import { localUrl } from '../../../../utils/util';


const TravelLocation = () => {
  const [travelData, setTravelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [isCreated, setIsCreated] = useState(false);

  const fetchTravelData = async () => {
    try {
      const response = await axios.get(`${localUrl}/get-all/travel/location`);
      setTravelData(response.data.map((item, index) => ({ ...item, id: index + 1 })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    formData.append('location', location);

    try {
      const response = await axios.post(`${localUrl}/add-a/travel/location`, formData);
      if (response.status === 201) {
        toast.success('Added a new travel location');
        setIsCreated(true);
        fetchTravelData();
      }
    } catch (error) {
      console.error('Error:', error);
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="auto" >
      <Typography variant="h4" component="h1" gutterBottom>
        Travel Locations
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Location"
          variant="outlined"
          fullWidth
          margin="normal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <TextField
          type="file"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{ multiple: true }}
          onChange={(e) => setImages([...e.target.files])}
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit
        </Button>
        {isCreated && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            <strong>Success!</strong> Travel location created successfully!
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {travelData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {row.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Travel location ${index + 1}`}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(row._id)}>
                    <AiOutlineDelete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TravelLocation;

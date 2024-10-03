import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, Container, TextField, ButtonGroup, Grid, LinearProgress } from '@mui/material';
import { localUrl } from '../../../../../utils/util';
import ProductCard from './all-hotel-card';
import AddFoodModal from '../../manage-foods';

export default function ProductsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptedFilter, setIsAcceptedFilter] = useState(null); // null means no filter applied

  useEffect(() => {
    getAllHotels();
  }, []);

  const getAllHotels = async () => {
    try {
      const response = await fetch(`${localUrl}/get/all/hotels`);
      const res = await response.json();
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHotel(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredData = data.filter((hotel) => {
    const matchesSearchQuery =
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery);

    const matchesAcceptedFilter =
      isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;

    return matchesSearchQuery && matchesAcceptedFilter;
  });

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  const filteredCount = filteredData.length;

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hotels ({filteredCount})
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <TextField
          label="Search hotel or owner name ..."
          variant="outlined"
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <ButtonGroup variant="contained" sx={{ ml: 2 }}>
          <Button onClick={() => setIsAcceptedFilter(null)}>All</Button>
          <Button onClick={() => setIsAcceptedFilter(true)}>Accepted</Button>
          <Button onClick={() => setIsAcceptedFilter(false)}>Not Accepted</Button>
        </ButtonGroup>
      </Stack>

      <Grid container spacing={2}> {/* Decreased gap from 3 to 2 */}
        {filteredData.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <ProductCard
              product={product}
              onAddFood={() => handleOpenModal(product)} // Pass handleOpenModal to ProductCard
            />
          </Grid>
        ))}
      </Grid>

      {selectedHotel && (
        <AddFoodModal
          open={isModalOpen}
          onClose={handleCloseModal}
          hotelId={selectedHotel._id} // Pass the selected hotel's ID or other relevant data
        />
      )}
    </Container>
  );
}

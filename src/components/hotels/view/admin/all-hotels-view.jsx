import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, Container, TextField, ButtonGroup, Grid, LinearProgress, Autocomplete } from '@mui/material';
import ProductCard from './all-hotel-card';
import AddFoodModal from '../../manage-foods';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHotels, getHotelsByFilters, getHotelsCity } from 'src/components/redux/reducers/hotel';
import { useLoader } from '../../../../../utils/loader';

export default function ProductsView() {
  const dispatch = useDispatch();
  const byCity = useSelector((state) => state.hotel.byCity);
  const byFilter = useSelector((state) => state.hotel.byFilter);
  const { showLoader, hideLoader } = useLoader();
  const [selectedCity, setSelectedCity] = useState('All City');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptedFilter, setIsAcceptedFilter] = useState(null);
  const data = useSelector((state) => state.hotel.data);

  useEffect(() => {
    getHotels();
  }, []);

  const getHotels = async () => {
    showLoader();
    try {
      await dispatch(getAllHotels());
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      hideLoader();
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

  const filteredData = selectedCity !=="All City" && selectedCity ? byFilter?.data : data?.filter((hotel) => {
    const matchesSearchQuery =
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery);

    const matchesAcceptedFilter =
      isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;

    return matchesSearchQuery && matchesAcceptedFilter;
  });

  const filteredCount = filteredData.length;


  useEffect(() => {
    dispatch(getHotelsCity())
  }, [dispatch])
  const handleCityChange = async (event) => {
    try {
      setSelectedCity(event.target.value);
      showLoader()
      await dispatch(getHotelsByFilters(event.target.value));
    } catch (error) {
      console.error("It seems an error", error)
    } finally {
      hideLoader()
    }

  };
  return (
    <Container maxWidth="auto">
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
          label="Search hotel "
          variant="outlined"
          onChange={handleSearchChange}
          sx={{ width: 150 }}
        />
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={["All City", ...byCity]}
            value={selectedCity}
            sx={{ width: 150 }}
            onChange={(event, newValue) => handleCityChange({ target: { value: newValue } })}
            renderInput={(params) => (
              <TextField {...params} label="Filter by city" variant="outlined" fullWidth />
            )}
          />
        </Grid>


        <ButtonGroup variant="contained" sx={{ ml: 2 }}>
          <Button onClick={() => setIsAcceptedFilter(null)}>All</Button>
          <Button onClick={() => setIsAcceptedFilter(true)}>Accepted</Button>
          <Button onClick={() => setIsAcceptedFilter(false)}>Not Accepted</Button>
        </ButtonGroup>
      </Stack>

      <Grid container spacing={2}>
        {' '}
        {/* Decreased gap from 3 to 2 */}
        {filteredData.map((product) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={product._id}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
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

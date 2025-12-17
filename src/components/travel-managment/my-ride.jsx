import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// MUI Components
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Skeleton,
  Stack,
} from "@mui/material";
import { useResponsive } from "../../hooks/use-responsive";

// MUI Icons
import {
  EventSeat,
  LocalGasStation,
  Work,
  Speed,
  LocationOn,
  Map,
  CalendarToday,
  Edit,
  Settings,
  NoCrash,
  Person,
  AssignmentInd, // A better icon for this context
} from "@mui/icons-material";

// Local Imports
import { getCarByOwnerId, updateCar } from "../redux/reducers/travel/car";
import CarUpdate from "./car-update";
import SeatConfigUpdate from "./update-seats";
import { fDate } from "../../../utils/format-time";
import { useLoader } from "../../../utils/loader";
import { getCarOwnerByEmail } from "../redux/reducers/travel/carOwner";
import { userId } from "../../../utils/util";

// ... (The DetailItem and MyCarCard components remain unchanged)
const DetailItem = ({ icon, text }) => (
    <Grid item xs={6} display="flex" alignItems="center" gap={1}>
      {React.cloneElement(icon, {
        sx: { fontSize: "1.1rem", color: "text.secondary" },
      })}
      <Typography variant="body2" noWrap>
        {text}
      </Typography>
    </Grid>
  );
  
  DetailItem.propTypes = {
    icon: PropTypes.node.isRequired,
    text: PropTypes.string.isRequired,
  };
  
  const MyCarCard = ({ car, onUpdateCar, onUpdateSeats, onStatusChange, mdUp }) => {
    const handleCarImage = (carData) =>
      carData?.images &&
      Array.isArray(carData.images) &&
      carData.images.length > 0
        ? carData.images[0]
        : "https://placehold.co/600x400/e0e0e0/757575?text=Car";
  
    const availableSeats =
      car.seatConfig?.filter((seat) => !seat.bookedBy).length || 0;
    const bookedSeats = car.seatConfig?.length - availableSeats || 0;
  
    return (
      <Card
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          mb: { xs: 1.25, sm: 1.75 },
          borderRadius: 3,
          transition: "box-shadow 0.3s",
          "&:hover": { boxShadow: 4 },
        }}
        className="hover:ring-1 hover:ring-blue-200"
      >
        <CardMedia
          component="img"
          sx={{
            width: { xs: "100%", sm: 200 },
            height: { xs: 160, sm: "auto" },
            objectFit: "cover",
          }}
          className="sm:rounded-l-3xl"
          image={handleCarImage(car)}
          alt={`${car.make} ${car.model}`}
        />
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <CardContent sx={{ flex: "1 0 auto", p: { xs: 1.5, sm: 2 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              gap={1}
              flexWrap="wrap"
            >
              <Box>
                <Typography component="div" variant="h6" fontWeight="bold">
                  {car.make} {car.model}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {car.color} • {car.vehicleNumber}
                </Typography>
              </Box>
              {car.recommended && (
                <Chip label="Recommended" color="success" size="small" />
              )}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={mdUp ? 1.5 : 1}>
              <DetailItem
                icon={<LocalGasStation />}
                text={car.fuelType || "N/A"}
              />
              <DetailItem
                icon={<EventSeat />}
                text={car.seater ? `${car.seater} Seater` : "N/A"}
              />
              <DetailItem
                icon={<Work />}
                text={car.luggage ? `${car.luggage} Luggage` : "N/A"}
              />
              <DetailItem
                icon={<Speed />}
                text={car.extraKm ? `₹${car.extraKm}/km` : "N/A"}
              />
              <DetailItem
                icon={<Person />}
                text={car.perPersonCost ? `₹${car.perPersonCost}/person` : "N/A"}
              />
              <DetailItem
                icon={<LocationOn />}
                text={car.pickupP ? `From: ${car.pickupP}` : "N/A"}
              />
              <DetailItem
                icon={<Map />}
                text={car.dropP ? `To: ${car.dropP}` : "N/A"}
              />
              <Grid item xs={12} display="flex" alignItems="center" gap={1}>
                <CalendarToday
                  sx={{ fontSize: "1.1rem", color: "text.secondary" }}
                />
                <Typography variant="body2">
                  {fDate(car.pickupD)} to {fDate(car.dropD)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "auto", sm: "repeat(3, auto)" },
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              p: { xs: 1, sm: 1.25 },
              bgcolor: "grey.50",
            }}
          >
            <Box className="rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
              <Typography variant="h6" fontWeight="bold">
                ₹{car.price}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Full ride
              </Typography>
            </Box>
            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography variant="body2" fontWeight="bold">
                Seats: {availableSeats} Available
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({bookedSeats} Booked)
              </Typography>
            </Box>
            <Box display="flex" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
              <FormControl
                variant="standard"
                sx={{ minWidth: { xs: 120, sm: 150 } }}
                size="small"
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={car.runningStatus || ""}
                  onChange={(e) => onStatusChange(e, car)}
                  label="Status"
                >
                  <MenuItem value="On A Trip">On A Trip</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              display="flex"
              justifyContent={{ xs: "flex-start", sm: "flex-end" }}
              gap={1}
              gridColumn={{ xs: "1 / -1", sm: "auto" }}
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => onUpdateCar(car)}
                startIcon={<Edit />}
                sx={{ flex: mdUp ? "initial" : 1, minWidth: 120 }}
              >
                Details
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onUpdateSeats(car)}
                startIcon={<Settings />}
                sx={{ flex: mdUp ? "initial" : 1, minWidth: 120 }}
              >
                Seats
              </Button>
            </Box>
          </CardActions>
        </Box>
      </Card>
    );
  };
  
  MyCarCard.propTypes = {
    car: PropTypes.object.isRequired,
    onUpdateCar: PropTypes.func.isRequired,
    onUpdateSeats: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    mdUp: PropTypes.bool,
  };

const MyCar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const mdUp = useResponsive("up", "md");

  const { ownerCar: carData, loading } = useSelector((state) => state.car);
  const { data: ownerData } = useSelector((state) => state.owner);
  const { showLoader, hideLoader } = useLoader();

  const [openCarUpdate, setOpenCarUpdate] = useState(false);
  const [openSeatConfig, setOpenSeatConfig] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // First, fetch the owner data.
  useEffect(() => {
    if (userId) {
      dispatch(getCarOwnerByEmail());
    }
  }, [userId, dispatch]);

  // THEN, if owner data exists, fetch the cars.
  useEffect(() => {
    if (ownerData && ownerData.length > 0 && userId) {
      try {
        showLoader();
        dispatch(getCarByOwnerId(userId))
          .unwrap()
          .finally(() => hideLoader());
      } catch (error) {
        console.error("Error fetching cars:", error);
        hideLoader();
      }
    }
  }, [ownerData, userId, dispatch]);

  const handleUpdateCar = (car) => {
    setSelectedCar(car);
    setOpenCarUpdate(true);
  };

  const handleUpdateSeats = (car) => {
    setSelectedCar(car);
    setOpenSeatConfig(true);
  };

  const handleCloseCarUpdate = () => {
    setOpenCarUpdate(false);
    setSelectedCar(null);
  };

  const handleCloseSeatConfig = () => {
    setOpenSeatConfig(false);
    setSelectedCar(null);
  };

  const handleChangeRunningStatus = (e, car) => {
    const newStatus = e.target.value;
    dispatch(updateCar({ id: car._id, data: { runningStatus: newStatus } }))
      .unwrap()
      .then(() => {
        dispatch(getCarByOwnerId(userId));
      })
      .catch((error) => {
        console.error("Error updating car status:", error);
      });
  };

  const handleNavigateToOwnerForm = () => {
    navigate("/add-an-car-owner");
  };

  return (
    <Container maxWidth="lg" sx={{ py: mdUp ? 3 : 2 }}>
      <Typography variant={mdUp ? "h4" : "h5"} fontWeight="bold" gutterBottom>
        My Cars
      </Typography>
      <main>
        {!(ownerData && ownerData.length > 0) ? (
          // ** ENHANCED SECTION **
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 5 },
              mt: { xs: 3, sm: 4 },
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <AssignmentInd sx={{ fontSize: 60, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              Complete Your Owner Profile
            </Typography>
            <Typography color="text.secondary" textAlign="center" maxWidth="md">
              To add and manage your cars, you first need to fill out your owner
              details.
            </Typography>
            <Button
              variant="contained"
              size={mdUp ? "large" : "medium"}
              onClick={handleNavigateToOwnerForm}
              sx={{ mt: 2 }}
            >
              Fill the Form
            </Button>
          </Paper>
        ) : loading ? (
          <Stack spacing={2}>
            <Skeleton
              variant="rectangular"
              height={190}
              sx={{ borderRadius: 3 }}
            />
            <Skeleton
              variant="rectangular"
              height={190}
              sx={{ borderRadius: 3 }}
            />
          </Stack>
        ) : carData?.length > 0 ? (
          carData.map((car) => (
            <MyCarCard
              key={car._id}
              car={car}
              onUpdateCar={handleUpdateCar}
              onUpdateSeats={handleUpdateSeats}
              onStatusChange={handleChangeRunningStatus}
              mdUp={mdUp}
            />
          ))
        ) : (
          <Paper
            variant="outlined"
            sx={{ textAlign: "center", p: 5, borderRadius: 3 }}
          >
            <NoCrash sx={{ fontSize: 60, color: "grey.400" }} />
            <Typography variant="h6" mt={2}>
              No cars found.
            </Typography>
            <Typography color="text.secondary">
              You can add a new car now.
            </Typography>
          </Paper>
        )}
      </main>

      {openCarUpdate && selectedCar && (
        <CarUpdate
          open={openCarUpdate}
          onClose={handleCloseCarUpdate}
          car={selectedCar}
        />
      )}

      {openSeatConfig && selectedCar && (
        <SeatConfigUpdate
          open={openSeatConfig}
          onClose={handleCloseSeatConfig}
          car={selectedCar}
        />
      )}
    </Container>
  );
};

export default MyCar;
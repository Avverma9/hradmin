import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";

// MUI Components
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
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
} from "@mui/icons-material";

// Local Imports
import { getCarByOwnerId, updateCar } from "../redux/reducers/travel/car";
import CarUpdate from "./car-update";
import SeatConfigUpdate from "./update-seats";
import { fDate } from "../../../utils/format-time";
import { useLoader } from "../../../utils/loader";

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

const MyCarCard = ({ car, onUpdateCar, onUpdateSeats, onStatusChange }) => {
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
        mb: 2,
        borderRadius: 3,
        transition: "box-shadow 0.3s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: { xs: "100%", sm: 200 },
          height: { xs: 160, sm: "auto" },
          objectFit: "cover",
        }}
        image={handleCarImage(car)}
        alt={`${car.make} ${car.model}`}
      />
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
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
          <Grid container spacing={1.5}>
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            bgcolor: "grey.50",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold">
              ₹{car.price}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Full ride
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" fontWeight="bold">
              Seats: {availableSeats} Available
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({bookedSeats} Booked)
            </Typography>
          </Box>
          <FormControl variant="standard" sx={{ minWidth: 120 }} size="small">
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
        </CardActions>
        <CardActions
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            p: 1.5,
            pt: 0,
            bgcolor: "grey.50",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => onUpdateCar(car)}
            startIcon={<Edit />}
          >
            Details
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onUpdateSeats(car)}
            startIcon={<Settings />}
          >
            Seats
          </Button>
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
};

const MyCar = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");
  const { ownerCar: carData, loading } = useSelector((state) => state.car);
  const { showLoader, hideLoader, isLoading } = useLoader();

  const [openCarUpdate, setOpenCarUpdate] = useState(false);
  const [openSeatConfig, setOpenSeatConfig] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    if (userId) {
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
  }, [userId, dispatch]);

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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Cars
      </Typography>
      <main>
        {loading ? (
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
              You have not added any cars yet.
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

import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../../../utils/loader";
import {
  deleteTourImage,
  fetchSeatMap,
  tourByOwner,
  updateTourImage,
} from "../redux/reducers/tour/tour";

// MUI Imports
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Icons
import {
  Add,
  AirlineSeatReclineExtra,
  AirlineSeatReclineNormal,
  Close,
  CurrencyRupee,
  Delete,
  Edit,
  ExpandMore,
  Image as ImageIcon,
  LocationOn,
  NightsStay,
  Star,
  Visibility,
  WbSunny,
  DirectionsBus,
  CheckCircle,
  Cancel,
  Circle as SteeringIcon,
} from "@mui/icons-material";

/* ================= STYLED COMPONENTS ================= */

const GradientCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  overflow: "hidden",
  border: "none",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.12)",
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 280,
  overflow: "hidden",
  background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 100%)",
  },
}));

const FloatingBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 2,
  backdropFilter: "blur(10px)",
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: 12,
  padding: "6px 12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  "& .MuiChip-icon": {
    marginLeft: "6px",
  },
}));

// --- Bus Layout Specific Styles ---
const BusChassis = styled(Box)(({ theme }) => ({
  border: `3px solid ${theme.palette.grey[300]}`,
  borderRadius: "30px 30px 10px 10px",
  padding: theme.spacing(3),
  backgroundColor: "white",
  position: "relative",
  maxWidth: 380,
  margin: "0 auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
}));

const DriverCabin = styled(Box)(({ theme }) => ({
  borderBottom: `2px dashed ${theme.palette.grey[200]}`,
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  justifyContent: "flex-end",
  color: theme.palette.grey[400],
}));

const SeatRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(5), // Aisle Gap
  marginBottom: theme.spacing(1.5),
}));

const SeatGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
}));

const SeatButton = styled(Box)(({ theme, status }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid",
  fontSize: "0.65rem",
  fontWeight: 700,
  transition: "all 0.2s",
  cursor: "default",

  ...(status === "available" && {
    borderColor: theme.palette.success.light,
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.05),
  }),

  ...(status === "booked" && {
    borderColor: theme.palette.error.light,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  }),
}));

/* ================= IMAGE DIALOG ================= */

function ImageDialog({ open, onClose, images, tourId }) {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const fileRef = useRef(null);

  const uploadImages = async (files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    try {
      showLoader();
      await dispatch(updateTourImage({ id: tourId, formData: fd })).unwrap();
      await dispatch(tourByOwner()).unwrap();
    } finally {
      hideLoader();
    }
  };

  const deleteImage = async (index) => {
    try {
      showLoader();
      await dispatch(deleteTourImage({ id: tourId, index })).unwrap();
      await dispatch(tourByOwner()).unwrap();
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ImageIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Manage Gallery
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Upload Button */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                height: 200,
                borderRadius: 3,
                border: "2px dashed",
                borderColor: "primary.main",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  bgcolor: alpha("#1976d2", 0.05),
                  transform: "scale(1.02)",
                },
              }}
              onClick={() => fileRef.current?.click()}
            >
              <Add sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="body2" fontWeight={600} color="primary">
                Upload Images
              </Typography>
            </Paper>
            <input
              ref={fileRef}
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => uploadImages(Array.from(e.target.files))}
            />
          </Grid>

          {/* Image Grid */}
          {(images || []).map((img, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper
                elevation={2}
                sx={{
                  position: "relative",
                  height: 200,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <img
                  src={img}
                  alt={`Tour ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  onClick={() => deleteImage(i)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: alpha("#d32f2f", 0.9),
                    color: "white",
                    "&:hover": {
                      bgcolor: "#d32f2f",
                    },
                  }}
                  size="small"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

/* ================= SEAT MAP DIALOG (Updated) ================= */

function SeatDialog({ open, onClose, tour }) {
  const dispatch = useDispatch();
  const { seatMapByKey, loading } = useSelector((s) => s.tour);

  // 1. Determine active vehicle
  const activeVehicle = useMemo(
    () =>
      tour?.vehicles?.find((v) => v.isActive !== false) || tour?.vehicles?.[0],
    [tour]
  );

  const [vehicleId, setVehicleId] = useState(activeVehicle?._id || "");

  // 2. Fetch Seat Map Data on Open/Change
  useEffect(() => {
    if (open && tour?._id && vehicleId) {
      dispatch(fetchSeatMap({ tourId: tour._id, vehicleId }));
    }
  }, [open, tour?._id, vehicleId, dispatch]);

  // 3. Get Data for Rendering
  const seatKey = `${tour?._id}:${vehicleId}`;
  
  // Current Vehicle Object
  const currentVehicle = tour?.vehicles?.find((v) => v._id === vehicleId);
  // Static Layout (Array of strings "1A", "1B"...)
  const vehicleLayout = currentVehicle?.seatLayout || [];
  // Dynamic Booked Seats (Array of strings from API)
  const bookedSeatsList = seatMapByKey[seatKey]?.bookedSeats || currentVehicle?.bookedSeats || [];

  const totalSeats = vehicleLayout.length;
  const bookedCount = bookedSeatsList.length;
  const availableCount = totalSeats - bookedCount;

  // 4. Render Layout Function
  const renderBusLayout = () => {
    if (!currentVehicle) return null;

    // Default to 2x2 if config missing
    const { rows, left, right } = currentVehicle.seatConfig || {
      rows: 10,
      left: 2,
      right: 2,
    };

    const numRows = parseInt(rows);
    const numLeft = parseInt(left);
    const numRight = parseInt(right);
    const seatsPerRow = numLeft + numRight;

    return (
      <BusChassis>
        <DriverCabin>
          <Stack alignItems="center">
            <SteeringIcon sx={{ fontSize: 32, transform: "rotate(-45deg)" }} />
            <Typography variant="caption" sx={{ fontSize: 9 }}>
              DRIVER
            </Typography>
          </Stack>
        </DriverCabin>

        {Array.from({ length: numRows }).map((_, rowIndex) => {
          // Slice layout array based on row index
          const startIndex = rowIndex * seatsPerRow;
          const rowSeats = vehicleLayout.slice(
            startIndex,
            startIndex + seatsPerRow
          );

          // Split row into Left/Right groups
          const leftSideSeats = rowSeats.slice(0, numLeft);
          const rightSideSeats = rowSeats.slice(numLeft, seatsPerRow);

          if (rowSeats.length === 0) return null;

          return (
            <SeatRow key={rowIndex}>
              {/* Left Group */}
              <SeatGroup>
                {leftSideSeats.map((seatCode) => {
                  const isBooked = bookedSeatsList.includes(seatCode);
                  return (
                    <SeatButton
                      key={seatCode}
                      status={isBooked ? "booked" : "available"}
                    >
                      <AirlineSeatReclineNormal fontSize="small" />
                      <span>{seatCode}</span>
                    </SeatButton>
                  );
                })}
              </SeatGroup>

              {/* Right Group */}
              <SeatGroup>
                {rightSideSeats.map((seatCode) => {
                  const isBooked = bookedSeatsList.includes(seatCode);
                  return (
                    <SeatButton
                      key={seatCode}
                      status={isBooked ? "booked" : "available"}
                    >
                      <AirlineSeatReclineNormal fontSize="small" />
                      <span>{seatCode}</span>
                    </SeatButton>
                  );
                })}
              </SeatGroup>
            </SeatRow>
          );
        })}
      </BusChassis>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AirlineSeatReclineExtra color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Seat Availability
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Vehicle Selector */}
          <TextField
            select
            fullWidth
            size="small"
            label="Select Vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {(tour?.vehicles || []).map((v) => (
              <MenuItem key={v._id} value={v._id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DirectionsBus fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={500}>
                    {v.name} ({v.totalSeats} Seats)
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {/* Stats Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha("#1976d2", 0.04),
              border: `1px solid ${alpha("#1976d2", 0.1)}`,
              borderRadius: 3,
            }}
          >
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              justifyContent="space-evenly"
            >
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={800} color="success.main">
                  {availableCount}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  AVAILABLE
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={800} color="error.main">
                  {bookedCount}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  BOOKED
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Seat Layout */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              bgcolor="grey.50"
              p={2}
              borderRadius={4}
              border={`1px solid ${alpha("#000", 0.05)}`}
            >
              {renderBusLayout()}
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

/* ================= TOUR CARD ================= */

function TourCard({ tour }) {
  const [imgOpen, setImgOpen] = useState(false);
  const [seatOpen, setSeatOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const mainImage = tour.images?.[0] || "/assets/placeholder.svg";

  const parsePlace = (str) => {
    if (!str) return "";
    return str
      .split("|")
      .map((p) => {
        const m = p.match(/(\d+)N\s*(.*)/);
        return m ? `${m[1]}N ${m[2].trim()}` : p.trim();
      })
      .join(" • ");
  };

  return (
    <>
      <GradientCard>
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={5}>
            <ImageOverlay>
              <Box
                component="img"
                src={mainImage}
                alt={tour.travelAgencyName}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = "/assets/placeholder.svg";
                }}
              />

              {/* Floating Badge */}
              <FloatingBadge>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Star sx={{ fontSize: 18, color: "#FFB400" }} />
                  <Typography variant="body2" fontWeight={700}>
                    {tour.starRating || "N/A"}
                  </Typography>
                </Stack>
              </FloatingBadge>

              {/* Bottom Actions */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ImageIcon />}
                  onClick={() => setImgOpen(true)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha("#fff", 0.9),
                    color: "text.primary",
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  {tour.images?.length || 0} Photos
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/tour-update/${tour._id}`)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha("#fff", 0.9),
                    color: "text.primary",
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  View & Edit
                </Button>
              </Stack>
            </ImageOverlay>
          </Grid>

          {/* Content Section */}
          <Grid item xs={12} md={7}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                {/* Header */}
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={1}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={800} gutterBottom>
                        {tour.travelAgencyName}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOn sx={{ fontSize: 18, color: "error.main" }} />
                        <Typography variant="body2" color="text.secondary">
                          {tour.city}, {tour.state}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip
                      icon={
                        tour.isAccepted ? (
                          <CheckCircle fontSize="small" />
                        ) : (
                          <Cancel fontSize="small" />
                        )
                      }
                      label={tour.isAccepted ? "Active" : "Pending"}
                      color={tour.isAccepted ? "success" : "warning"}
                      size="small"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {parsePlace(tour.visitngPlaces)}
                  </Typography>
                </Box>

                <Divider />

                {/* Info Chips */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <InfoChip
                    icon={<WbSunny />}
                    label={`${tour.days || 0}D`}
                    size="small"
                    variant="outlined"
                  />
                  <InfoChip
                    icon={<NightsStay />}
                    label={`${tour.nights || 0}N`}
                    size="small"
                    variant="outlined"
                  />
                  <InfoChip
                    icon={<CurrencyRupee />}
                    label={`₹${tour.price?.toLocaleString("en-IN") || 0}`}
                    size="small"
                    color="primary"
                  />
                  <InfoChip
                    icon={<DirectionsBus />}
                    label={`${tour.vehicles?.length || 0} Vehicles`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="outlined"
                    startIcon={<AirlineSeatReclineExtra />}
                    onClick={() => setSeatOpen(true)}
                    sx={{ borderRadius: 2, flex: { xs: "1 1 100%", sm: 1 } }}
                  >
                    Seats
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExpandMore />}
                    onClick={() => setExpanded(!expanded)}
                    sx={{ borderRadius: 2, flex: { xs: "1 1 100%", sm: 1 } }}
                  >
                    Itinerary
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/tour-booking/${tour._id}`)}
                    sx={{ borderRadius: 2, flex: { xs: "1 1 100%", sm: 1 } }}
                  >
                    Book Now
                  </Button>
                </Stack>

                {/* Expanded Itinerary */}
                {expanded && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      borderRadius: 2,
                      maxHeight: 200,
                      overflowY: "auto",
                    }}
                  >
                    <Stack spacing={1.5}>
                      {tour.dayWise?.map((d, i) => (
                        <Box key={i}>
                          <Stack direction="row" spacing={1} alignItems="start">
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: 12,
                                bgcolor: "primary.main",
                              }}
                            >
                              {d.day}
                            </Avatar>
                            <Typography variant="body2">
                              {d.description}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </GradientCard>

      {/* Dialogs */}
      <ImageDialog
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        images={tour.images}
        tourId={tour._id}
      />
      <SeatDialog
        open={seatOpen}
        onClose={() => setSeatOpen(false)}
        tour={tour}
      />
    </>
  );
}

/* ================= MAIN PAGE ================= */

export default function MyTours() {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const tourState = useSelector((s) => s.tour);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const load = async () => {
      try {
        showLoader();
        await dispatch(tourByOwner()).unwrap();
      } finally {
        hideLoader();
      }
    };
    load();
  }, [dispatch]);

  // Robust Data Extraction
  const tourData = useMemo(() => {
    if (Array.isArray(tourState?.data)) {
      return tourState.data;
    }
    if (tourState?.data?.success && Array.isArray(tourState?.data?.data)) {
      return tourState.data.data;
    }
    if (tourState?.data?.data && Array.isArray(tourState?.data?.data)) {
      return tourState.data.data;
    }
    return [];
  }, [tourState]);

  // Loading State
  if (tourState?.loading && !tourData.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="body2" color="text.secondary">
          Loading your tours...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.02
        )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              fontWeight={800}
              gutterBottom
            >
              My Tours
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track all your tour packages
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/add-tour-data")}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              display: { xs: "none", md: "flex" },
            }}
          >
            Create Tour
          </Button>
        </Stack>

        {/* Stats */}
        {tourData.length > 0 && (
          <Grid container spacing={2} mb={4}>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha("#1976d2", 0.05),
                  border: `1px solid ${alpha("#1976d2", 0.1)}`,
                }}
              >
                <Typography variant="h4" fontWeight={700} color="primary">
                  {tourData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tours
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha("#2e7d32", 0.05),
                  border: `1px solid ${alpha("#2e7d32", 0.1)}`,
                }}
              >
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {tourData.filter((t) => t.isAccepted).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha("#ed6c02", 0.05),
                  border: `1px solid ${alpha("#ed6c02", 0.1)}`,
                }}
              >
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {tourData.filter((t) => !t.isAccepted).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha("#9c27b0", 0.05),
                  border: `1px solid ${alpha("#9c27b0", 0.1)}`,
                }}
              >
                <Typography variant="h4" fontWeight={700} color="secondary.main">
                  {tourData.reduce(
                    (acc, t) => acc + (t.vehicles?.length || 0),
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vehicles
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tour List or Empty State */}
        {tourData.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "background.paper",
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: { xs: 200, md: 300 },
                height: { xs: 200, md: 300 },
                mx: "auto",
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 4,
              }}
            >
              <Add
                sx={{ fontSize: 120, color: "primary.main", opacity: 0.3 }}
              />
            </Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              No Tours Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Start by creating your first amazing tour package
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate("/create-tour")}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Create Your First Tour
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {tourData.map((t) => (
              <TourCard key={t._id} tour={t} />
            ))}
          </Stack>
        )}
      </Container>

      {/* Floating Action Button - Mobile Only */}
      <Zoom in={true}>
        <Fab
          color="primary"
          onClick={() => navigate("/create-tour")}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "flex", md: "none" },
          }}
        >
          <Add />
        </Fab>
      </Zoom>
    </Box>
  );
}
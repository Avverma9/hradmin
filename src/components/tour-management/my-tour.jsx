import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../../../utils/loader";
import {
  deleteTourImage,
  fetchSeatMap,
  tourByOwner,
  updateTourImage,
} from "../redux/reducers/tour/tour";

// Carousel Imports
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Icons
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import CollectionsIcon from "@mui/icons-material/Collections";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import StarIcon from "@mui/icons-material/Star";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

// --- Helpers ---
const parseVisitingPlaces = (placesStr) => {
  if (!placesStr) return "Details not available.";
  return placesStr
    .split("|")
    .map((part) => {
      const night = part.match(/(\d+)N/);
      const city = part.replace(/(\d+)N\s*/, "");
      return `${night ? night[1] : ""} Night${
        night && night[1] > 1 ? "s" : ""
      } in ${city}`;
    })
    .join(", ");
};

const FALLBACK_IMAGE_URL = "/assets/placeholder.svg";

// --- Styled Components ---

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
  },
}));

const InfoStrip = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: 8,
  border: `1px solid ${theme.palette.grey[200]}`,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1),
  },
}));

const SliderArrow = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  backgroundColor: alpha(theme.palette.common.white, 0.8),
  "&:hover": {
    backgroundColor: theme.palette.common.white,
  },
  boxShadow: theme.shadows[2],
  width: 32,
  height: 32,
}));

// --- Custom Slider Arrows ---
function NextArrow(props) {
  const { onClick } = props;
  return (
    <SliderArrow onClick={onClick} sx={{ right: 10 }}>
      <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
    </SliderArrow>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <SliderArrow onClick={onClick} sx={{ left: 10 }}>
      <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
    </SliderArrow>
  );
}

// --- Modals ---

function ImageManagerModal({
  open,
  onClose,
  images = [],
  onImageUpload,
  onImageDelete,
  tourId,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload(Array.from(files), tourId);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Manage Tour Images</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2} mt={0}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              variant="outlined"
              onClick={() => fileInputRef.current.click()}
              sx={{
                height: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderStyle: "dashed",
                borderColor: "primary.main",
                bgcolor: "primary.50",
                transition: "0.2s",
                "&:hover": { bgcolor: "primary.100" },
              }}
            >
              <AddPhotoAlternateIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="primary" fontWeight="bold">Upload Images</Typography>
            </Paper>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
              multiple
            />
          </Grid>
          {images.map((image, index) => (
            <Grid item key={`${tourId}-img-${index}`} xs={12} sm={6} md={4}>
              <Box sx={{ position: "relative", height: 180, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                <img
                  src={image}
                  alt={`Gallery ${index}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  onClick={() => onImageDelete(index, tourId)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "error.main",
                    color: "white",
                    "&:hover": { bgcolor: "error.dark" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

function SeatMapModal({ open, onClose, tour }) {
  const dispatch = useDispatch();
  const [vehicleId, setVehicleId] = useState(() => {
    const active = (tour?.vehicles || []).find((v) => v.isActive !== false);
    return active?._id || tour?.vehicles?.[0]?._id || "";
  });

  const { loading, seatMapByKey } = useSelector((state) => state.tour);
  const seatKey = `${tour?._id}:${vehicleId}`;
  const seatMap = seatMapByKey[seatKey] || [];

  useEffect(() => {
    if (open && tour?._id && vehicleId) {
      dispatch(fetchSeatMap({ tourId: tour._id, vehicleId }));
    }
  }, [open, vehicleId, tour?._id, dispatch]);

  const bookedCount = seatMap.filter((s) => s.status === "booked").length;
  const totalCount = seatMap.length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
           <AirlineSeatReclineExtraIcon color="primary" />
           <Typography variant="h6">Seat Availability</Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
          <TextField
            select
            label="Select Vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            size="small"
            fullWidth
          >
            {(tour?.vehicles || []).map((v) => (
              <MenuItem key={v._id} value={v._id}>
                {v.name} ({v.totalSeats} Seats)
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ minWidth: 100, textAlign: 'right' }}>
             <Typography variant="caption" display="block">Booked / Total</Typography>
             <Typography variant="h6" fontWeight="bold">{bookedCount} / {totalCount}</Typography>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Box>
            {seatMap.length === 0 ? (
              <Typography color="text.secondary" align="center">No seat map available.</Typography>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
                {seatMap.map((seat) => (
                  <Button
                    key={seat.code}
                    variant={seat.status === "booked" ? "contained" : "outlined"}
                    color={seat.status === "booked" ? "inherit" : "primary"}
                    disabled={seat.status === "booked"}
                    sx={{ 
                      minWidth: 0, 
                      borderRadius: 1,
                      bgcolor: seat.status === "booked" ? "action.disabledBackground" : "transparent"
                    }}
                  >
                    {seat.code}
                  </Button>
                ))}
              </Box>
            )}
            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
                <Chip size="small" label="Available" variant="outlined" color="primary" />
                <Chip size="small" label="Booked" sx={{ bgcolor: 'action.disabledBackground' }} />
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Main Card Component ---

function TourCard({ tour }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleImageEditClick = (e) => {
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  const handleImageUpload = async (files, tourId) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    try {
      showLoader();
      await dispatch(updateTourImage({ id: tourId, formData })).unwrap();
      await dispatch(tourByOwner()).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };

  const handleImageDelete = async (index, tourId) => {
    try {
      showLoader();
      await dispatch(deleteTourImage({ id: tourId, index })).unwrap();
      await dispatch(tourByOwner()).unwrap();
      setIsImageModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };

  const imageCount = tour.images?.length || 0;
  const imagesToShow = imageCount > 0 ? tour.images : [FALLBACK_IMAGE_URL];

  const sliderSettings = {
    dots: true,
    infinite: imageCount > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: imageCount > 1,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <>
      <StyledCard>
        <Grid container>
          {/* Left Column: Image Slider */}
          <Grid item xs={12} md={5} lg={4} sx={{ position: "relative", bgcolor: "black" }}>
            <Box
              sx={{
                height: "100%",
                minHeight: { xs: 250, md: 350 },
                "& .slick-slider, & .slick-list, & .slick-track": { height: "100%" },
                "& .slick-slide > div": { height: "100%" },
              }}
            >
              <Slider {...sliderSettings}>
                {imagesToShow.map((image, index) => (
                  <Box key={index} sx={{ height: "100%", width: "100%" }}>
                    <CardMedia
                      component="img"
                      image={image}
                      alt={`Tour ${index}`}
                      sx={{ height: "100%", width: "100%", objectFit: "cover", opacity: 0.9 }}
                    />
                  </Box>
                ))}
              </Slider>
            </Box>
            
            {/* Overlay Edit Button */}
            <Tooltip title="Manage Gallery">
              <IconButton
                onClick={handleImageEditClick}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                  "&:hover": { backgroundColor: "white" },
                  zIndex: 10,
                }}
                size="small"
              >
                <CollectionsIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Right Column: Details */}
          <Grid item xs={12} md={7} lg={8}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
              
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box>
                  <Chip 
                    label={tour.themes} 
                    size="small" 
                    color="primary" 
                    sx={{ borderRadius: 1, fontWeight: 600, mb: 1, textTransform: 'uppercase', fontSize: '0.7rem' }} 
                  />
                  <Typography variant="h5" component="div" fontWeight="800" color="text.primary">
                    {tour.travelAgencyName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} color="text.secondary" mt={0.5}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {tour.city}, {tour.state} ({tour?.country})
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title="Edit Details">
                  <IconButton onClick={() => navigate(`/tour-update/${tour._id}`)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                 {parseVisitingPlaces(tour.visitngPlaces || tour.visitingPlaces)}
              </Typography>

              {/* Info Strip */}
              <InfoStrip>
                <Box display="flex" alignItems="center" gap={1}>
                  <WbSunnyIcon fontSize="small" color="warning" />
                  <Typography variant="body2" fontWeight="500">{tour.days} Days</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
                <Box display="flex" alignItems="center" gap={1}>
                  <NightsStayIcon fontSize="small" color="info" />
                  <Typography variant="body2" fontWeight="500">{tour.nights} Nights</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
                <Box display="flex" alignItems="center" gap={1}>
                  <StarIcon fontSize="small" sx={{ color: "#faaf00" }} />
                  <Typography variant="body2" fontWeight="500">{tour.starRating} Rating</Typography>
                </Box>
              </InfoStrip>

              <Box flexGrow={1} /> 

              {/* Footer Actions */}
              <Divider sx={{ my: 2 }} />
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={4}>
                   <Typography variant="caption" color="text.secondary" display="block">Starts from</Typography>
                   <Typography variant="h5" color="primary.main" fontWeight="800">
                      ₹{(tour.price || 0).toLocaleString("en-IN")}
                   </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<AirlineSeatReclineExtraIcon />}
                      onClick={(e) => { e.stopPropagation(); setIsSeatModalOpen(true); }}
                    >
                      Seats
                    </Button>
                    <Button
                       variant="outlined"
                       color="inherit"
                       size="small"
                       onClick={() => setIsExpanded(!isExpanded)}
                       endIcon={<ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />}
                    >
                      Itinerary
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                      startIcon={<FlightTakeoffIcon />}
                      onClick={() => navigate(`/tour-booking/${tour._id}`)}
                      sx={{ fontWeight: "bold" }}
                    >
                      Book Now
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

            </CardContent>
          </Grid>
        </Grid>

        {/* Expandable Itinerary */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 4, bgcolor: "grey.50", borderTop: 1, borderColor: "divider" }}>
             <Typography variant="h6" gutterBottom fontWeight="bold">Day-wise Itinerary</Typography>
             <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <List sx={{ p: 0 }}>
                    {tour.dayWise?.map((day) => (
                      <ListItem key={day._id} alignItems="flex-start" sx={{ px: 0 }}>
                        <Box sx={{ minWidth: 60, mr: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1, p: 0.5, textAlign: 'center' }}>
                           <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>DAY</Typography>
                           <Typography variant="h6" lineHeight={1} fontWeight="bold">{day.day}</Typography>
                        </Box>
                        <ListItemText 
                          primary={<Typography fontWeight="500" color="text.primary">{day.description}</Typography>} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={5}>
                   <Paper variant="outlined" sx={{ p: 2, bgcolor: "white" }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="success.main">
                         <CheckCircleIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: 'middle' }} /> 
                         Inclusions
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                         {tour.inclusion?.map((item, i) => <Chip key={i} label={item} size="small" />)}
                      </Box>
                      
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="error.main">
                         <CancelIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: 'middle' }} /> 
                         Exclusions
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                         {tour.exclusion?.map((item, i) => <Chip key={i} label={item} size="small" variant="outlined" />)}
                      </Box>
                   </Paper>
                </Grid>
             </Grid>
          </Box>
        </Collapse>
      </StyledCard>

      {/* Render Modals */}
      <ImageManagerModal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={tour.images}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
        tourId={tour._id}
      />
      <SeatMapModal
        open={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        tour={tour}
      />
    </>
  );
}

// --- Main Page Component ---

export default function MyTour() {
  const dispatch = useDispatch();
  const tourData = useSelector((state) => state.tour?.data);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyTour = async () => {
      try {
        showLoader();
        await dispatch(tourByOwner());
      } catch (err) {
        console.error("Failed to fetch my tours:", err);
      } finally {
        hideLoader();
      }
    };
    loadMyTour();
  }, [dispatch]);

  if (!tourData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (tourData.length === 0) {
    return (
      <Box sx={{ bgcolor: "grey.50", py: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 4, border: "1px dashed", borderColor: "divider" }}>
            <TravelExploreIcon sx={{ fontSize: 80, color: "primary.light", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>No Tour Packages Found</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Start your journey by creating your first tour package listing.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate("/add-tour-data")}
              disableElevation
            >
              Create New Tour
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ bgcolor: "#f4f6f8", py: 6, minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="800" color="text.primary">
                My Tours
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and update your active travel packages.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/add-tour-data")}
              size="large"
              disableElevation
              sx={{ borderRadius: 2, fontWeight: "bold" }}
            >
              Add Tour
            </Button>
          </Box>

          <Stack spacing={4}>
            {tourData.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </Stack>
        </Container>
      </Box>
    </>
  );
}
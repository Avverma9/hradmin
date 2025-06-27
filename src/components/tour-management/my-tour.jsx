import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { tourByOwner } from "../redux/reducers/tour/tour";
import { useLoader } from "../../../utils/loader";

import {
  Card, CardContent, CardMedia, Typography, Box, Grid, Chip, Button,
  Collapse, List, ListItem, ListItemIcon, ListItemText, Divider,
  IconButton, Container, CircularProgress, CssBaseline, Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';


const parseVisitingPlaces = (placesStr) => {
  if (!placesStr) return 'Details not available.';
  return placesStr.split('|').map(part => {
    const night = part.match(/(\d+)N/);
    const city = part.replace(/(\d+)N\s*/, '');
    return `${night ? night[1] : ''} Night${night && night[1] > 1 ? 's' : ''} in ${city}`;
  }).join(', ');
};

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


function TourCard({ tour }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
 const  [images,setImages] = useState([])
  const handleExpandClick = () => setIsExpanded(!isExpanded);
  
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/tour-update/${tour._id}`);
  };
 
const handleImageUpload=(e)=>{
    e.stopPropagation();
    const file = e.target.files[0];
  setImages(file);
    }
  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <Grid container>
        <Grid item xs={12} md={4}>
          <CardMedia component="img" image={imageUrl} alt={tour.travelAgencyName} sx={{ height: '100%', objectFit: 'cover' }} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Chip label={tour.themes} color="primary" size="small" />
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{tour.city}, {tour.state} ({tour?.country})</Typography>
                  </Box>
                </Box>
                <IconButton aria-label="edit tour" onClick={handleEditClick}>
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                {tour.travelAgencyName}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {parseVisitingPlaces(tour.visitngPlaces || tour.visitingPlaces)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, my: 2, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}><WbSunnyIcon sx={{ mr: 1 }}/> <Typography variant="body2">{tour.days} Days</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}><NightsStayIcon sx={{ mr: 1 }}/> <Typography variant="body2">{tour.nights} Nights</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}><StarIcon sx={{ mr: 1, color: '#FFB400' }}/> <Typography variant="body2">{tour.starRating} Stars</Typography></Box>
              </Box>
            </CardContent>

            <Divider />
            
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1}}>Starts from</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">₹{tour.price.toLocaleString('en-IN')}</Typography>
              </Box>
              <Button variant="contained" onClick={handleExpandClick} endIcon={<ExpandMore expand={isExpanded}><ExpandMoreIcon /></ExpandMore>}>
                {isExpanded ? 'Hide' : 'View'} Itinerary
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
         <Box sx={{ p: 3, backgroundColor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Day-wise Plan</Typography>
            <List dense>{tour.dayWise?.map(day => (<ListItem key={day._id}><ListItemIcon sx={{minWidth: 32}}><Typography variant="body2" color="primary" fontWeight="bold">Day {day.day}</Typography></ListItemIcon><ListItemText primary={day.description} /></ListItem>))}</List>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}><Typography variant="subtitle1" fontWeight="medium">Inclusions</Typography><List dense>{tour.inclusion?.map(item => <ListItem key={item}><ListItemIcon sx={{minWidth: 32}}><CheckCircleIcon color="success" fontSize="small"/></ListItemIcon><ListItemText primary={item}/></ListItem>)}</List></Grid>
                <Grid item xs={12} md={4}><Typography variant="subtitle1" fontWeight="medium">Exclusions</Typography><List dense>{tour.exclusion?.map(item => <ListItem key={item}><ListItemIcon sx={{minWidth: 32}}><CancelIcon color="error" fontSize="small"/></ListItemIcon><ListItemText primary={item}/></ListItem>)}</List></Grid>
                <Grid item xs={12} md={4}><Typography variant="subtitle1" fontWeight="medium">Amenities</Typography><List dense>{tour.amenities?.map(item => <ListItem key={item}><ListItemText primary={`• ${item}`}/></ListItem>)}</List></Grid>
            </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}


export default function MyTour() {
  const dispatch = useDispatch();
  const tourData = useSelector((state) => state.tour?.data);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyTour = async () => {
      try { showLoader(); await dispatch(tourByOwner()); }
      catch (err) { console.error("Failed to fetch my tours:", err); }
      finally { hideLoader(); }
    };
    loadMyTour();
  }, [dispatch]);

  if (!tourData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }
  const handleClickNewData = ()=>{
    window.location.href = '/add-tour-data';
  }
  if (tourData.length === 0) {
    return (
      <Box sx={{ bgcolor: 'grey.100', py: 8, minHeight: '100vh', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Paper variant="outlined" sx={{ p: { xs: 3, sm: 6 }, display: 'inline-block' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <TravelExploreIcon sx={{ fontSize: 80, color: 'grey.400' }} />
              <Typography variant="h4" component="h1" gutterBottom>
                You have no tour packages
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: '450px', mb: 3 }}>
                It looks like you haven't created any tour packages yet. Get started by adding your first one!
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add-tour-data')}
              >
                Add New Tour
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ bgcolor: 'grey.100', py: 8, minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <div>
              <Typography variant="h4" component="h1" fontWeight="bold">My Tours</Typography>
              <Typography variant="h6" color="text.secondary">Manage your created tour packages.</Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={()=>handleClickNewData()}
              sx={{ flexShrink: 0 }}
            >
              Add New Tour
            </Button>
          </Box>
          <Grid container spacing={4}>
            {tourData.map((tour) => (
              <Grid item key={tour._id} xs={12}>
                <TourCard tour={tour} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
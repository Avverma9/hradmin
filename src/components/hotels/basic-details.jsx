import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import Slider from 'react-slick';

// Import slick-carousel styles
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';

// Material-UI Imports
import {
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';

// Material-UI Icons
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PinDropIcon from '@mui/icons-material/PinDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StarIcon from '@mui/icons-material/Star';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChatIcon from '@mui/icons-material/Chat';
import PublicIcon from '@mui/icons-material/Public';
import FlagIcon from '@mui/icons-material/Flag';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DeckIcon from '@mui/icons-material/Deck';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Local Imports
import { getBusinessHotelId, localUrl } from '../../../utils/util';

const fieldGroups = {
  'Primary Info': [
    { id: 'hotelId', label: 'Hotel ID', icon: <VpnKeyIcon fontSize="small" />, editable: false },
    { id: 'hotelName', label: 'Hotel Name', icon: <BusinessIcon fontSize="small" />, editable: true },
    { id: 'isAccepted', label: 'Approval Status', icon: <CheckCircleIcon fontSize="small" />, editable: true, type: 'select', options: ['Accepted', 'Not Accepted'] },
    { id: 'localId', label: 'Local ID Status', icon: <CheckCircleIcon fontSize="small" />, editable: true, type: 'select', options: ['Accepted', 'Not Accepted'] },
  ],
  'Property Details': [
    { id: 'description', label: 'Description', icon: <DescriptionIcon fontSize="small" />, editable: true, type: 'multiline' },
    { id: 'customerWelcomeNote', label: 'Welcome Note', icon: <ChatIcon fontSize="small" />, editable: true, type: 'multiline' },
    { id: 'propertyType', label: 'Property Type', icon: <ApartmentIcon fontSize="small" />, editable: true },
    { id: 'starRating', label: 'Star Rating', icon: <StarIcon fontSize="small" />, editable: true, type: 'number' },
    { id: 'onFront', label: 'On Front', icon: <DeckIcon fontSize="small" />, editable: true },
  ],
  'Contact Information': [
    { id: 'hotelOwnerName', label: 'Owner Name', icon: <PersonIcon fontSize="small" />, editable: true },
    { id: 'hotelEmail', label: 'Hotel Email', icon: <MailIcon fontSize="small" />, editable: true, type: 'email' },
    { id: 'contact', label: 'Contact Number', icon: <PhoneIcon fontSize="small" />, editable: true },
    { id: 'generalManagerContact', label: 'GM Contact', icon: <SupervisorAccountIcon fontSize="small" />, editable: true },
    { id: 'salesManagerContact', label: 'Sales Manager Contact', icon: <SupportAgentIcon fontSize="small" />, editable: true },
  ],
  'Location Details': [
    { id: 'landmark', label: 'Landmark', icon: <HomeWorkIcon fontSize="small" />, editable: true },
    { id: 'destination', label: 'Destination', icon: <FlagIcon fontSize="small" />, editable: true },
    { id: 'city', label: 'City', icon: <LocationCityIcon fontSize="small" />, editable: true },
    { id: 'state', label: 'State', icon: <PublicIcon fontSize="small" />, editable: true },
    { id: 'pinCode', label: 'Pin Code', icon: <PinDropIcon fontSize="small" />, editable: true },
    { id: 'mapLink', label: 'Map Link', icon: <MapIcon fontSize="small" />, editable: true, type: 'url' },
  ],
};

const carouselSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 900, settings: { slidesToShow: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 1 } }
  ]
};

export default function BasicDetails({ open, onClose, hotelId = null }) {
  const [hotel, setHotel] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        const rawHotel = response?.data?.data ?? response?.data ?? {};
        const basicInfo = rawHotel?.basicInfo ?? {};
        const location = basicInfo?.location ?? {};
        const contacts = basicInfo?.contacts ?? {};

        setHotel({
          ...rawHotel,
          hotelId: getBusinessHotelId(rawHotel, hotelId),
          hotelName: rawHotel?.hotelName || basicInfo?.name || "",
          hotelOwnerName: rawHotel?.hotelOwnerName || basicInfo?.owner || "",
          description: rawHotel?.description || basicInfo?.description || "",
          propertyType: rawHotel?.propertyType || basicInfo?.category || "",
          starRating: rawHotel?.starRating ?? basicInfo?.starRating ?? "",
          destination: rawHotel?.destination || location?.address || "",
          city: rawHotel?.city || location?.city || "",
          state: rawHotel?.state || location?.state || "",
          pinCode: rawHotel?.pinCode || location?.pinCode || "",
          mapLink: rawHotel?.mapLink || location?.googleMapLink || "",
          contact: rawHotel?.contact || contacts?.phone || "",
          hotelEmail: rawHotel?.hotelEmail || contacts?.email || "",
          generalManagerContact:
            rawHotel?.generalManagerContact || contacts?.generalManager || "",
          salesManagerContact:
            rawHotel?.salesManagerContact || contacts?.salesManager || "",
          images: Array.isArray(rawHotel?.images)
            ? rawHotel.images
            : Array.isArray(basicInfo?.images)
              ? basicInfo.images
              : [],
        });
      } catch (error) {
        toast.error('Failed to fetch hotel details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (open) {
      fetchData();
    }
  }, [hotelId, open]);

  const handleEditClick = (field, value) => {
    setEditField(field.id);
    if (field.id === 'isAccepted') {
      setEditValue(value ? 'Accepted' : 'Not Accepted');
    } else {
      setEditValue(value || '');
    }
  };

  const handleCancelEdit = () => {
    setEditField(null);
    setEditValue('');
  };

  const handleSaveClick = async () => {
    if (editField === null) return;
    try {
      let updatedValue = editValue;
      if (editField === 'isAccepted') {
        updatedValue = editValue === 'Accepted';
      }
      const targetHotelId = hotel?.hotelId || hotelId;
      await axios.patch(`${localUrl}/hotels/update/info/${targetHotelId}`, { [editField]: updatedValue });
      const updatedHotel = { ...hotel, [editField]: updatedValue };
      setHotel(updatedHotel);
      toast.success('Update successful!');
    } catch (error) {
      toast.error('Update failed.');
    } finally {
      handleCancelEdit();
    }
  };
  
  const renderFieldValue = (field) => {
    const value = hotel?.[field.id];
    if (field.id === 'isAccepted') {
      return <Chip
        icon={value ? <CheckCircleIcon /> : <CancelIcon />}
        label={value ? 'Accepted' : 'Not Accepted'}
        size="small"
        color={value ? 'success' : 'error'}
      />;
    }
    if (field.id === 'localId') {
      const isAccepted = String(value || '').toLowerCase() === 'accepted';
      return <Chip
        icon={isAccepted ? <CheckCircleIcon /> : <CancelIcon />}
        label={value || 'Not provided'}
        size="small"
        color={isAccepted ? 'success' : 'default'}
      />;
    }
    return <Typography variant="body2" color="text.primary" sx={{ wordBreak: 'break-word' }}>{value || <span style={{ color: '#999' }}>Not provided</span>}</Typography>;
  };
  
  const renderEditComponent = (field) => {
    if (field.type === 'select') {
      return <Select value={editValue} onChange={(e) => setEditValue(e.target.value)} size="small" fullWidth><MenuItem value="Accepted">Accepted</MenuItem><MenuItem value="Not Accepted">Not Accepted</MenuItem></Select>;
    }
    return <TextField value={editValue} onChange={(e) => setEditValue(e.target.value)} size="small" fullWidth autoFocus multiline={field.type === 'multiline'} rows={2} type={field.type || 'text'}/>;
  };
  
  const renderFieldRow = (field) => (
    <Stack key={field.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, mr: 1 }}>
        {field.icon}
        <Typography variant="body2" color="text.secondary">{field.label}</Typography>
      </Stack>
      {editField === field.id ? (
        <Stack direction="row" alignItems="center" spacing={0.5} flexGrow={1} maxWidth="60%">
          {renderEditComponent(field)}
          <IconButton size="small" onClick={handleSaveClick} color="primary"><CheckIcon /></IconButton>
          <IconButton size="small" onClick={handleCancelEdit}><CloseIcon /></IconButton>
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" spacing={0.5} flexGrow={1} maxWidth="60%" justifyContent="flex-end">
          <Box flexGrow={1} textAlign="right">{renderFieldValue(field)}</Box>
          {field.editable && (<IconButton size="small" onClick={() => handleEditClick(field, hotel[field.id])}><EditIcon sx={{ fontSize: 16, color: 'action.active' }} /></IconButton>)}
        </Stack>
      )}
    </Stack>
  );

  const getSummaryInfo = (groupName) => {
    if (!hotel) return null;
    switch(groupName) {
      case 'Primary Info':
        return <Chip label={hotel.isAccepted ? "Approved" : "Pending"} size="small" color={hotel.isAccepted ? "success" : "warning"} />;
      case 'Contact Information':
        return <Typography variant="caption" color="text.secondary">{hotel.hotelOwnerName}</Typography>;
      case 'Location Details':
        return <Typography variant="caption" color="text.secondary">{hotel.city}</Typography>;
      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight="bold">{hotel?.hotelName || 'Hotel Basic Details'}</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.default' }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={50} />
            <Skeleton variant="rectangular" height={50} />
          </Stack>
        ) : hotel ? (
          <>
            <Box mb={2} className="slick-container">
              {Array.isArray(hotel.images) && hotel.images.length > 0 ? (
                <Slider {...carouselSettings}>
                  {hotel.images.map((image, index) => (
                    <Box key={index} sx={{ p: 1 }}>
                      <Box
                        component="img"
                        src={image}
                        alt={`Hotel Image ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                        }}
                      />
                    </Box>
                  ))}
                </Slider>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" p={2}>
                  No images available.
                </Typography>
              )}
            </Box>

            {Object.entries(fieldGroups).map(([groupName, fields]) => (
              <Accordion key={groupName} defaultExpanded={groupName === 'Primary Info'} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', '&:not(:last-child)': { mb: 2 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography variant="subtitle1" fontWeight="bold">{groupName}</Typography>
                    <Box>{getSummaryInfo(groupName)}</Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 1, sm: 1.5 } }}>
                  {fields.map(renderFieldRow)}
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        ) : (
          <Typography>No hotel data available.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

BasicDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string,
};

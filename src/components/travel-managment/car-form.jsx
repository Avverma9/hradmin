import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';

// MUI Components
import {
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  InputAdornment,
  Paper,
  Divider,
  IconButton,
  Autocomplete,
  Container,
  Stack,
  Avatar,
  FormHelperText,
} from '@mui/material';
import {
  PhotoCamera,
  Speed,
  LocationOn,
  Map,
  CalendarToday,
  ArrowBack,
  Save,
  EventSeat,
  Close,
} from '@mui/icons-material';

// Local Imports
import { addCar } from '../redux/reducers/travel/car';
import AlertDialog from '../../../utils/alertDialogue';
import { userId, localUrl, notify } from '../../../utils/util';

const Section = ({ title, children }) => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>{title}</Typography>
        <Divider sx={{ mb: 3 }} />
        {children}
    </Paper>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default function CarForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        make: '', model: '', year: '', vehicleNumber: '', color: '',
        sharingType: '', vehicleType: '',
        fuelType: '', transmission: '', mileage: '', seater: '',
        price: '', perPersonCost: '', extraKm: '',
        pickupP: '', dropP: '', pickupD: '', dropD: '',
        runningStatus: 'Available', isAvailable: true,
        images: [],
    });

    const [allCarData, setAllCarData] = useState([]);
    const [makes, setMakes] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [seatConfig, setSeatConfig] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    
    const handleBack = () => navigate(-1);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAutocompleteChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value || '' }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFormData(prev => ({ ...prev, images: [...e.target.files] }));
        }
    };
    
    const handleSeaterChange = (e) => {
        setFormData(prev => ({ ...prev, seater: e.target.value }));
    };

    useEffect(() => {
        if (formData.sharingType === 'Shared') {
            const numSeats = parseInt(formData.seater, 10) || 0;
            setSeatConfig(Array.from({ length: numSeats }, (_, i) => ({
                seatType: "AC",
                seatNumber: `S${i + 1}`,
                seatPrice: "",
                isBooked: false,
                bookedBy: "",
            })));
        } else {
            setSeatConfig([]);
        }
    }, [formData.sharingType, formData.seater]);
    
    const handleSeatChange = (index, field, value) => {
        const updatedSeats = [...seatConfig];
        const seat = { ...updatedSeats[index] };

        if (field === "isBooked") {
            seat[field] = value;
            if (!value) seat.bookedBy = ""; 
        } else {
            seat[field] = value;
        }

        updatedSeats[index] = seat;
        setSeatConfig(updatedSeats);
    };
    
    const addNewSeat = () => {
        setSeatConfig([
          ...seatConfig,
          { seatType: "AC", seatNumber: "", seatPrice: "", isBooked: false, bookedBy: "" },
        ]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenDialog(true);
    };

    const handleDialogConfirm = async () => {
        setOpenDialog(false);
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'images') {
                for (let i = 0; i < value.length; i++) {
                    data.append('images', value[i]);
                }
            } else {
                data.append(key, value);
            }
        });
        
        seatConfig.forEach((seat, index) => {
            data.append(`seatConfig[${index}]`, JSON.stringify({
                ...seat,
                seatNumber: Number(seat.seatNumber.replace('S', '')) || index + 1,
                seatPrice: Number(seat.seatPrice)
            }));
        });

        data.append("ownerId", userId);

        try {
            await dispatch(addCar(data)).unwrap();
            notify('Car added successfully!', 'success');
            navigate("/your-cars");
        } catch (error) {
            console.error("Error creating car:", error);
          
        }
    };

    useEffect(() => {
        const fetchCarData = async () => {
            try {
                const response = await fetch("https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100");
                const data = await response.json();
                const carData = data.results || [];
                setAllCarData(carData);
                const uniqueMakes = [...new Set(carData.map((car) => car.make))];
                setMakes(uniqueMakes);
            } catch (err) {
                console.error("Error fetching car data:", err);
            }
        };
        fetchCarData();
    }, []);

    useEffect(() => {
        if (formData.make) {
            setFilteredModels(allCarData.filter((car) => car.make === formData.make));
        } else {
            setFilteredModels([]);
        }
    }, [formData.make, allCarData]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                 <Typography variant="h4" fontWeight="bold">Add New Car</Typography>
                 <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Go Back
                 </Button>
            </Box>
            
            <Section title="Car Details">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}><Autocomplete options={makes} value={formData.make} onChange={(_, val) => handleAutocompleteChange('make', val)} renderInput={(params) => <TextField {...params} label="Make" />} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><Autocomplete options={filteredModels.map(c => c.model)} value={formData.model} onChange={(_, val) => handleAutocompleteChange('model', val)} renderInput={(params) => <TextField {...params} label="Model" />} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Year" type="number" name="year" value={formData.year} onChange={handleInputChange} onWheel={(e) => e.target.blur()} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Color</InputLabel><Select name="color" value={formData.color} label="Color" onChange={handleInputChange}>{["Red", "Blue", "Black", "White", "Silver", "Green"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Grid>
                    <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Fuel Type</InputLabel><Select name="fuelType" value={formData.fuelType} label="Fuel Type" onChange={handleInputChange}>{["Petrol", "Diesel", "Electric", "Hybrid"].map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}</Select></FormControl></Grid>
                    <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Vehicle Type</InputLabel><Select name="vehicleType" value={formData.vehicleType} label="Vehicle Type" onChange={handleInputChange}><MenuItem value="Car">Car</MenuItem><MenuItem value="Bike">Bike</MenuItem><MenuItem value="Bus">Bus</MenuItem></Select></FormControl></Grid>                   
                   <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Sharing Type</InputLabel>
                            <Select name="sharingType" value={formData.sharingType} label="Sharing Type" onChange={handleInputChange}><MenuItem value="Private">Private</MenuItem><MenuItem value="Shared">Shared</MenuItem></Select>
                            {formData.sharingType === 'Private' && <FormHelperText>Seat configuration is not required for private rides.</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Transmission</InputLabel><Select name="transmission" value={formData.transmission} label="Transmission" onChange={handleInputChange}><MenuItem value="Automatic">Automatic</MenuItem><MenuItem value="Manual">Manual</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Mileage (KM/L)" type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} onWheel={(e) => e.target.blur()} InputProps={{ startAdornment: <InputAdornment position="start"><Speed/></InputAdornment> }} /></Grid>
                </Grid>
            </Section>

            <Section title="Trip & Pricing">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Pickup Location" name="pickupP" value={formData.pickupP} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn/></InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Drop Location" name="dropP" value={formData.dropP} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start"><Map/></InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Pickup Date & Time" type="datetime-local" name="pickupD" value={formData.pickupD} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Drop Date & Time" type="datetime-local" name="dropD" value={formData.dropD} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth label="Full Ride Price" name="price" type="number" value={formData.price} onChange={handleInputChange} onWheel={(e) => e.target.blur()} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth label="Per Person Cost" type="number" name="perPersonCost" value={formData.perPersonCost} onChange={handleInputChange} onWheel={(e) => e.target.blur()} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth label="Extra KM Charge (₹)" type="number" name="extraKm" value={formData.extraKm} onChange={handleInputChange} onWheel={(e) => e.target.blur()} /></Grid>
                </Grid>
            </Section>

            <Section title="Capacity & Seats">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Seater</InputLabel>
                            <Select name="seater" value={formData.seater} label="Seater" onChange={handleSeaterChange}>
                                {[...Array(60).keys()].map((val) => <MenuItem key={val + 1} value={val + 1}>{val + 1}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                     <Grid item xs={12} sm={8}>
                        <Button fullWidth variant="contained" component="label" startIcon={<PhotoCamera/>} sx={{ height: '100%' }}>
                            Upload Car Images
                            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                        </Button>
                    </Grid>
                    {formData.images.length > 0 && <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap">{Array.from(formData.images).map((file, i) => <Avatar key={i} src={URL.createObjectURL(file)} variant="rounded" />)}</Stack></Grid>}
                    
                    {formData.sharingType === 'Shared' && (
                        <>
                            <Grid item xs={12}><Divider>Seat Configuration</Divider></Grid>
                            {seatConfig.map((seat, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                   <Paper variant="outlined" sx={{p: 2, position: 'relative'}}>
                                       <Typography variant="subtitle2" gutterBottom>Seat {index + 1}</Typography>
                                       <Grid container spacing={1}>
                                            <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>Type</InputLabel><Select name="seatType" value={seat.seatType} label="Type" onChange={(e) => handleSeatChange(index, 'seatType', e.target.value)}><MenuItem value="AC">AC</MenuItem><MenuItem value="Non-AC">Non-AC</MenuItem></Select></FormControl></Grid>
                                            <Grid item xs={12}><TextField fullWidth size="small" label="Number" name="seatNumber" value={seat.seatNumber} onChange={(e) => handleSeatChange(index, 'seatNumber', e.target.value)} /></Grid>
                                            <Grid item xs={12}><TextField fullWidth size="small" label="Price" name="seatPrice" type="number" value={seat.seatPrice} onChange={(e) => handleSeatChange(index, 'seatPrice', e.target.value)} onWheel={(e) => e.target.blur()} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                                            <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select name="isBooked" value={seat.isBooked} label="Status" onChange={(e) => handleSeatChange(index, 'isBooked', e.target.value)}><MenuItem value={false}>Available</MenuItem><MenuItem value={true}>Booked</MenuItem></Select></FormControl></Grid>
                                            {seat.isBooked && <Grid item xs={12}><TextField fullWidth size="small" label="Booked By" name="bookedBy" value={seat.bookedBy} onChange={(e) => handleSeatChange(index, 'bookedBy', e.target.value)} /></Grid>}
                                       </Grid>
                                   </Paper>
                                </Grid>
                            ))}
                            {formData.seater && <Grid item xs={12}><Button variant="text" onClick={addNewSeat}>Add More Seats</Button></Grid>}
                        </>
                    )}
                </Grid>
            </Section>

            <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button type="submit" variant="contained" size="large" startIcon={<Save />}>
                    Add Car
                </Button>
            </Box>
        </Box>
        <AlertDialog open={openDialog} onClose={() => setOpenDialog(false)} onConfirm={handleDialogConfirm} title="Confirm Car Submission" message="Are you sure you want to add this car?" />
    </Container>
  );
}

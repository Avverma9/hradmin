import React, { useEffect, useState } from 'react';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Autocomplete,
    FormHelperText,
    Input,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addCar } from '../redux/reducers/travel/car';
import AlertDialog from '../../../utils/alertDialogue';
import { userId } from '../../../utils/util';
import { Visibility, VisibilityOff, AttachMoney, PhotoCamera, Speed } from '@mui/icons-material';

export default function CarForm() {
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [images, setImages] = useState([]);
    const [price, setPrice] = useState('');
    const [seater, setSeater] = useState('');
    const [extraKm, setExtraKm] = useState('');
    const [color, setColor] = useState('');
    const [mileage, setMileage] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [transmission, setTransmission] = useState('');
    const [ownerId, setOwnerId] = useState(userId);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [allCarData, setAllCarData] = useState([]);
    const [makes, setMakes] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleFileChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleToggleVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleDialogConfirm = async () => {
        setOpenDialog(false);
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }
        formData.append('make', make);
        formData.append('model', model);
        formData.append('seater', seater);
        formData.append('extraKm', extraKm);
        formData.append('year', year);
        formData.append('price', price);
        formData.append('color', color);
        formData.append('mileage', mileage);
        formData.append('fuelType', fuelType);
        formData.append('transmission', transmission);
        formData.append('ownerId', ownerId);
        formData.append('isAvailable', isAvailable);
        dispatch(addCar(formData));
        navigate('/your-cars');
    };

    useEffect(() => {
        const fetchCarData = async () => {
            try {
                const response1 = await fetch(
                    'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100'
                );
                const data1 = await response1.json();
                const carData1 = data1.results;

                const response2 = await fetch(
                    'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100&refine=fueltype1%3A%22Regular%20Gasoline%22'
                );
                const data2 = await response2.json();
                const carData2 = data2.results;

                const combinedCarData = [...carData1, ...carData2];
                setAllCarData(combinedCarData);

                const uniqueMakes = [...new Set(combinedCarData.map((car) => car.make))];
                setMakes(uniqueMakes);

                setFilteredModels(combinedCarData);
            } catch (err) {
                console.error('Error fetching car data:', err);
            }
        };

        fetchCarData();
    }, []);

    useEffect(() => {
        if (make) {
            setFilteredModels(allCarData.filter((car) => car.make === make));
        } else {
            setFilteredModels(allCarData);
        }
    }, [make, allCarData]);

    return (
        <Card sx={{ width: 650, margin: '0 auto', padding: 3 }}>
            <Button variant="outlined" color="primary" onClick={handleBack} sx={{ margin: 2 }}>
                Go Back
            </Button>
            <CardContent>
                <Typography variant="h5" gutterBottom textAlign="center">
                    Add New Car
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Autocomplete
                        value={make}
                        onChange={(event, newValue) => setMake(newValue)}
                        options={makes}
                        renderInput={(params) => <TextField {...params} label="Make" variant="outlined" />}
                        fullWidth
                        margin="normal"
                        freeSolo
                    />
                    <hr />
                    <Autocomplete
                        value={model}
                        onChange={(event, newValue) => setModel(newValue)}
                        options={filteredModels.map((car) => car.model)}
                        renderInput={(params) => <TextField {...params} label="Model" variant="outlined" />}
                        fullWidth
                        margin="normal"
                        freeSolo
                    />
                    <hr />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="seater-label">Seater</InputLabel>
                        <Select
                            labelId="seater-label"
                            value={seater}
                            onChange={(e) => setSeater(e.target.value)}
                            label="Seater"
                            name="seater"
                        >
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                            <MenuItem value={4}>4</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                            <MenuItem value={9}>9</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                        </Select>
                        {seater === '' && <FormHelperText error>Please select the number of seats</FormHelperText>}
                    </FormControl>
                    <hr />

                    <TextField
                        label="Extra KM Charge"
                        variant="outlined"
                        fullWidth
                        type="extraKm"
                        value={extraKm}
                        onChange={(e) => setExtraKm(e.target.value)}
                        margin="normal"
                    />
                    {extraKm == '' && <FormHelperText error>Please mention Per extram KM Charge in INR</FormHelperText>}
                    <hr />
                    <TextField
                        label="Year"
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        margin="normal"
                    />

                    <TextField
                        label="Price"
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AttachMoney />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Color</InputLabel>
                        <Select value={color} onChange={(e) => setColor(e.target.value)} label="Color">
                            <MenuItem value="Red">Red</MenuItem>
                            <MenuItem value="Blue">Blue</MenuItem>
                            <MenuItem value="Black">Black</MenuItem>
                            <MenuItem value="White">White</MenuItem>
                            <MenuItem value="Silver">Silver</MenuItem>
                            <MenuItem value="Green">Green</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Mileage (KM/L)"
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Speed />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Fuel Type</InputLabel>
                        <Select value={fuelType} onChange={(e) => setFuelType(e.target.value)} label="Fuel Type">
                            <MenuItem value="Petrol">Petrol</MenuItem>
                            <MenuItem value="Diesel">Diesel</MenuItem>
                            <MenuItem value="Electric">Electric</MenuItem>
                            <MenuItem value="Hybrid">Hybrid</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Transmission</InputLabel>
                        <Select value={transmission} onChange={(e) => setTransmission(e.target.value)} label="Transmission">
                            <MenuItem value="Automatic">Automatic</MenuItem>
                            <MenuItem value="Manual">Manual</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Owner ID (This is by-default your userId)"
                        variant="outlined"
                        fullWidth
                        value={userId}
                        onChange={() => setOwnerId(userId)}
                        margin="normal"
                        type={isPasswordVisible ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleToggleVisibility} edge="end">
                                        {isPasswordVisible ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ marginBottom: 2 }}>
                        <input
                            type="file"
                            id="carImages"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="carImages">
                            <Button
                                variant="outlined"
                                color="primary"
                                component="span"
                                fullWidth
                                sx={{ padding: '10px', textAlign: 'center' }}
                                startIcon={<PhotoCamera />}
                            >
                                Select Car Images
                            </Button>
                        </label>
                        {images.length > 0 && (
                            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                                {Array.from(images).map((image, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(image)}
                                        alt={`Car Image ${index}`}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            margin: '5px',
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2, padding: '10px' }}>
                        Add Car
                    </Button>
                </form>
            </CardContent>

            <AlertDialog
                open={openDialog}
                onClose={handleDialogClose}
                onConfirm={handleDialogConfirm}
                title="Confirm Car Submission"
                message="Are you sure you want to add this car?"
            />
        </Card>
    );
}

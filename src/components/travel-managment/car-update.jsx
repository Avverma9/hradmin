import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useResponsive } from "../../hooks/use-responsive";
import {
    TextField,
    Button,
    Box,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Autocomplete,
    Grid,
    Dialog,
    DialogContent,
    Typography,
    Divider,
    Stack,
    Chip,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useDispatch } from "react-redux";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaLocationArrow } from "react-icons/fa";
import { PhotoCamera, Speed } from "@mui/icons-material";
import { updateCar } from "../redux/reducers/travel/car";

const initialFormData = {
    make: "",
    model: "",
    year: "",
    vehicleNumber: "",
    price: "",
    pickupP: "",
    dropP: "",
    sharingType: "",
    vehicleType: "",
    pickupD: "",
    dropD: "",
    perPersonCost: "",
    seater: "",
    extraKm: "",
    color: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    isAvailable: true,
};

const formatDateTimeForInput = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return "";
    return dateString.slice(0, 16);
};
const Section = ({ title, children }) => (
    <Box sx={{ width: "100%" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                {title}
            </Typography>
            <Chip label="Editable" size="small" color="primary" variant="outlined" />
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        {children}
    </Box>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default function CarUpdate({ car, onClose, open, onUpdateSuccess }) {
    const [formData, setFormData] = useState(initialFormData);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [allCarData, setAllCarData] = useState([]);
    const [makes, setMakes] = useState([]);
    const dispatch = useDispatch();
    const mdUp = useResponsive('up', 'md');
    useEffect(() => {
        const fetchCarData = async () => {
            try {
                const response = await fetch(
                    "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100"
                );
                const data = await response.json();
                const carResults = data.results || [];
                setAllCarData(carResults);
                const uniqueMakes = [...new Set(carResults.map((c) => c.make))];
                setMakes(uniqueMakes);
            } catch (err) {
                console.error("Error fetching car data:", err);
            }
        };
        fetchCarData();
    }, []);

    useEffect(() => {
        if (car) {
            setFormData({
                make: car.make || "",
                model: car.model || "",
                year: car.year || "",
                vehicleNumber: car.vehicleNumber || "",
                price: car.price || "",
                pickupP: car.pickupP || "",
                dropP: car.dropP || "",
                pickupD: formatDateTimeForInput(car.pickupD),
                dropD: formatDateTimeForInput(car.dropD),
                perPersonCost: car.perPersonCost || "",
                seater: car.seater || "",
                    sharingType: car.sharingType || "",
                vehicleType: car.vehicleType || "",
                extraKm: car.extraKm || "",
                color: car.color || "",
                mileage: car.mileage || "",
                fuelType: car.fuelType || "",
                transmission: car.transmission || "",
                isAvailable: car.isAvailable !== undefined ? car.isAvailable : true,
            });
            setImagePreviews(car.images || []);
            setImages([]);
        }
    }, [car]);

    const filteredModels = useMemo(() => {
        if (!formData.make) return [];
        return allCarData.filter((c) => c.make === formData.make);
    }, [formData.make, allCarData]);

    const modelOptions = useMemo(() =>
        [...new Set(filteredModels.map((c) => c.model))],
        [filteredModels]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAutocompleteChange = (name, newValue) => {
        setFormData((prev) => ({ ...prev, [name]: newValue || "" }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create a copy of form data to modify dates
        const dataToSubmit = { ...formData };

        // Convert local datetime strings to full ISO UTC strings before submission
        if (dataToSubmit.pickupD) {
            dataToSubmit.pickupD = new Date(dataToSubmit.pickupD).toISOString();
        }
        if (dataToSubmit.dropD) {
            dataToSubmit.dropD = new Date(dataToSubmit.dropD).toISOString();
        }

        const submissionData = new FormData();
        Object.entries(dataToSubmit).forEach(([key, value]) => {
            submissionData.append(key, value);
        });

        if (images.length > 0) {
            images.forEach((file) => {
                submissionData.append("images", file);
            });
        }

        try {
            await dispatch(updateCar({ id: car._id, data: submissionData }));
            if (onUpdateSuccess) {
              window.location.reload();
                onUpdateSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Failed to update car:", error);
        }
    };

    return (
        <Dialog onClose={onClose} open={open} maxWidth="lg" fullScreen={!mdUp}>
            <DialogContent sx={{ width: mdUp ? "70vw" : "100%", p: mdUp ? 3 : 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems={mdUp ? "center" : "flex-start"} mb={mdUp ? 2.5 : 1.5} sx={{ flexDirection: mdUp ? 'row' : 'column', gap: mdUp ? 0 : 1 }}>
                    <Typography variant={mdUp ? "h5" : "h6"} fontWeight={700} gutterBottom>
                        Update Car Details
                    </Typography>
                    <Button variant="outlined" color="primary" onClick={onClose} size={mdUp ? 'medium' : 'small'}>
                        Close
                    </Button>
                </Box>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={mdUp ? 3 : 2}>
                        <Section title="Vehicle Information">
                            <Grid container spacing={mdUp ? 2 : 1.25}>
                                <Grid item xs={12} sm={4}>
                                    <Autocomplete
                                        value={formData.make}
                                        onChange={(e, newValue) => handleAutocompleteChange("make", newValue)}
                                        options={makes}
                                        renderInput={(params) => <TextField {...params} name="make" label="Make" variant="outlined" size={mdUp ? 'medium' : 'small'} />}
                                        freeSolo
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Autocomplete
                                        value={formData.model}
                                        onChange={(e, newValue) => handleAutocompleteChange("model", newValue)}
                                        options={modelOptions}
                                        renderInput={(params) => <TextField {...params} name="model" label="Model" variant="outlined" size={mdUp ? 'medium' : 'small'} />}
                                        freeSolo
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="year" label="Year" fullWidth type="number" variant="outlined" value={formData.year} onChange={handleChange} size={mdUp ? 'medium' : 'small'} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="vehicleNumber" label="Car Number" fullWidth type="text" variant="outlined" value={formData.vehicleNumber} onChange={handleChange} size={mdUp ? 'medium' : 'small'} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Color</InputLabel>
                                        <Select name="color" value={formData.color} onChange={handleChange} label="Color" size={mdUp ? 'medium' : 'small'}>
                                            {["Red", "Blue", "Black", "White", "Silver", "Green"].map((clr) => (
                                                <MenuItem key={clr} value={clr}>{clr}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Seater</InputLabel>
                                        <Select name="seater" value={formData.seater} onChange={handleChange} label="Seater" size={mdUp ? 'medium' : 'small'}>
                                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                                                <MenuItem key={s} value={s}>{s}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Fuel Type</InputLabel>
                                        <Select name="fuelType" value={formData.fuelType} onChange={handleChange} label="Fuel Type" size={mdUp ? 'medium' : 'small'}>
                                            {["Petrol", "Diesel", "Electric", "Hybrid"].map((type) => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Vehicle Type</InputLabel>
                                        <Select name="vehicleType" value={formData.vehicleType} onChange={handleChange} label="Vehicle Type" size={mdUp ? 'medium' : 'small'}>
                                            {["Car", "Bike", "Bus"].map((type) => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Sharing Type</InputLabel>
                                        <Select name="sharingType" value={formData.sharingType} onChange={handleChange} label="Sharing Type" size={mdUp ? 'medium' : 'small'}>
                                            {["Private", "Shared"].map((type) => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Transmission</InputLabel>
                                        <Select name="transmission" value={formData.transmission} onChange={handleChange} label="Transmission" size={mdUp ? 'medium' : 'small'}>
                                            <MenuItem value="Automatic">Automatic</MenuItem>
                                            <MenuItem value="Manual">Manual</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="mileage" label="Mileage (KM/L)" fullWidth type="number" variant="outlined" value={formData.mileage} onChange={handleChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><Speed /></InputAdornment> }} />
                                </Grid>
                            </Grid>
                        </Section>
                        <Section title="Ride Details">
                            <Grid container spacing={mdUp ? 2 : 1.25}>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="pickupP" label="Pickup Location" fullWidth value={formData.pickupP} onChange={handleChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><FaLocationArrow /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="dropP" label="Drop Location" fullWidth value={formData.dropP} onChange={handleChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><FaLocationArrow /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <DateTimePicker
                                        label="Pickup Time"
                                        value={formData.pickupD ? new Date(formData.pickupD) : null}
                                        onChange={(value) => handleChange({ target: { name: "pickupD", value: value ? value.toISOString() : "" } })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                size={mdUp ? 'medium' : 'small'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <DateTimePicker
                                        label="Drop Time"
                                        value={formData.dropD ? new Date(formData.dropD) : null}
                                        onChange={(value) => handleChange({ target: { name: "dropD", value: value ? value.toISOString() : "" } })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                size={mdUp ? 'medium' : 'small'}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Section>
                        <Section title="Pricing">
                            <Grid container spacing={mdUp ? 2 : 1.25}>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="price" label="Full Ride Price" type="number" fullWidth value={formData.price} onChange={handleChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><FaIndianRupeeSign /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="perPersonCost" label="Per Person Cost" type="number" fullWidth value={formData.perPersonCost} onChange={handleChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><FaIndianRupeeSign /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="extraKm" label="Extra KM Charge" fullWidth value={formData.extraKm} onChange={handleChange} size={mdUp ? 'medium' : 'small'} />
                                </Grid>
                            </Grid>
                        </Section>
                        <Section title="Media">
                            <Button variant="outlined" component="label" fullWidth startIcon={<PhotoCamera />}>
                                Upload New Images
                                <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                            </Button>
                            {imagePreviews.length > 0 && (
                                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    {imagePreviews.map((preview, index) => (
                                        <img key={index} src={preview} alt={`Preview ${index}`} style={{ width: mdUp ? "100px" : "90px", height: mdUp ? "100px" : "90px", objectFit: "cover", borderRadius: "6px" }} />
                                    ))}
                                </Box>
                            )}
                        </Section>
                    </Stack>
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: mdUp ? 3 : 2, py: mdUp ? 1.5 : 1 }} size={mdUp ? 'medium' : 'small'}>
                        Update Car
                    </Button>
                </form>
                </LocalizationProvider>
            </DialogContent>
        </Dialog>
    );
}

CarUpdate.propTypes = {
    car: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onUpdateSuccess: PropTypes.func,
};

CarUpdate.defaultProps = {
    onUpdateSuccess: () => {},
};
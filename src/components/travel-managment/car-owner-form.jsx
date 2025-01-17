import React, { useState } from 'react';
import { Person, Phone, Email, Home, Lock, PhotoCamera } from '@mui/icons-material';
import { TextField, Button, Card, CardContent, Typography, Box, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addCarOwner } from '../redux/reducers/travel/carOwner';

export default function CarOwner() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        dl: '',
        dlImage: null,
        city: '',
        state: '',
        address: '',
        pinCode: '',
        images: null,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setFormData((prevData) => ({
            ...prevData,
            images: file,
        }));
    };

    const handleDlImage = (e) => {
        const file = e.target.files[0];
        setFormData((prevData) => ({
            ...prevData,
            dlImage: file,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            for (const [key, value] of Object.entries(formData)) {
                if (value !== null) {
                    data.append(key, value);
                }
            }
            setLoading(true);

            dispatch(addCarOwner(data));
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Card sx={{ width: 650, margin: '0 auto', padding: 3 }}>
            <Button variant="outlined" color="primary" onClick={handleBack} sx={{ margin: 2 }}>
                Go Back
            </Button>
            <CardContent>
                <Typography variant="h5" gutterBottom textAlign="center">
                    Add new owner
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="User Name"
                        variant="outlined"
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Mobile Number"
                        variant="outlined"
                        fullWidth
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        margin="normal"
                        inputProps={{ maxLength: 10 }}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Phone />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Only 10 digits allowed"
                        error={formData.mobile.length !== 10}
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Enter a valid email"
                        error={!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.email)}
                    />
                    <TextField
                        label="Driver's License Number"
                        variant="outlined"
                        fullWidth
                        required
                        name="dl"
                        value={formData.dl}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Driver's license number"
                    />
                    <Box sx={{ marginBottom: 2 }}>
                        <input type="file" id="dlImage" required accept="image/*" onChange={handleDlImage} style={{ display: 'none' }} />
                        <label htmlFor="dlImage">
                            <Button
                                variant="outlined"
                                color="primary"
                                component="span"
                                fullWidth
                                sx={{ padding: '10px', textAlign: 'center' }}
                            >
                                {formData.dlImage ? "Change Driver's License Image" : "Select Driver's License Image"}
                            </Button>
                        </label>
                        {formData.dlImage && (
                            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                                <img
                                    src={URL.createObjectURL(formData.dlImage)}
                                    alt="Driver's License Preview"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                    <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <TextField
                        label="State"
                        variant="outlined"
                        fullWidth
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <TextField
                        label="Address"
                        variant="outlined"
                        fullWidth
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Home />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Pin Code"
                        variant="outlined"
                        fullWidth
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Home />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ marginBottom: 2 }}>
                        <input type="file" id="profileImage" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                        <label htmlFor="profileImage">
                            <Button
                                variant="outlined"
                                color="primary"
                                component="span"
                                fullWidth
                                sx={{ padding: '10px', textAlign: 'center' }}
                                startIcon={<PhotoCamera />}
                            >
                                {formData.images ? 'Change Profile Image' : 'Select Profile Image'}
                            </Button>
                        </label>
                        {formData.images && (
                            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                                <img
                                    src={URL.createObjectURL(formData.images)}
                                    alt="Profile Preview"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2, padding: '10px' }}
                        disabled={
                            !formData.name ||
                            formData.mobile.length !== 10 ||
                            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.email) ||
                            formData.dl.length < 8 ||
                            !formData.address ||
                            !formData.city ||
                            !formData.state
                        }
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

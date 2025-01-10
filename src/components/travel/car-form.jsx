import React, { useState } from 'react';
import { Person, AddCircle, Phone, Email, Home, Lock, PhotoCamera } from '@mui/icons-material';
import { TextField, Button, Card, CardContent, Typography, Box, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
export default function CarForm() {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Card sx={{ width: 650, margin: '0 auto', padding: 3 }}>
            {' '}
            {/* Increased width for the form */}
            <Button
                variant="outlined"
                color="primary"
                onClick={handleBack}
                sx={{ margin: 2 }} // Only margin for the back button
            >
                Go Back
            </Button>
            <CardContent>
                <Typography variant="h5" gutterBottom textAlign="center">
                    Add new Car
                </Typography>
                <form onSubmit={createUser}>
                    <TextField
                        label="User Name"
                        variant="outlined"
                        fullWidth
                        name="userName"
                        value={formData.name}
                        onChange={handleInputChange}
                        margin="normal"
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
                        onChange={handleMobileChange}
                        margin="normal"
                        inputProps={{ maxLength: 10 }}
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
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Password must be at least 8 characters"
                        error={formData.password.length < 8}
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
                    <Box sx={{ marginBottom: 2 }}>
                        <input type="file" id="profileImage" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
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
                            !formData.userName ||
                            formData.mobile.length !== 10 ||
                            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.email) ||
                            formData.password.length < 8 ||
                            !formData.address
                        }
                    >
                        Create User
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

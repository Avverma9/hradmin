import React, { useState } from 'react';
import { Person, AddCircle, Phone, Email, Home, Lock, PhotoCamera } from '@mui/icons-material';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import './UserSelection.css';

import axios from 'axios';
import { localUrl, notify } from '../../../../utils/util';
import CreateBooking from './create_booking';

export default function UserSelection() {
  const [selection, setSelection] = useState(null); // Tracks whether a user has selected 'new' or 'existing'
  const [formData, setFormData] = useState({
    userName: '',
    mobile: '',
    email: '',
    password: '',
    address: '',
    images: null,
  });

  // Unified form field handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) setFormData((prev) => ({ ...prev, mobile: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, images: file }));
  };

  const createUser = async (e) => {
    e.preventDefault();
    const { userName, mobile, email, password, address, images } = formData;

    if (!userName || !mobile || !email || !password || !address) {
      alert('Please fill out all fields!');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      const response = await axios.post(`${localUrl}/Signup`, data);
      notify(response.status);
      setFormData({ userName: '', mobile: '', email: '', password: '', address: '', images: null });
      setSelection(null); // Reset selection to the default state
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user!');
    }
  };

  const handleBack = () => {
    setSelection(null); // Go back to the user selection screen
  };

  return (
    <>
    <div className="user-selection-container" style={{ maxWidth: 'auto' }}>
      {selection === null && (
        <>
          <div
            className={`circle ${selection === 'existing' ? 'selected' : ''}`}
            onClick={() => setSelection('existing')}
          >
            <Person
              style={{ fontSize: 50, color: selection === 'existing' ? 'white' : '#3f51b5' }}
            />
            <span>Existing User</span>
          </div>

          <img
            src="https://avverma.s3.ap-south-1.amazonaws.com/clipart530376.png"
            alt="arrow"
            className="user-selection-image"
            style={{ height: '100px', width: '100px' }}
          />

          <div
            className={`circle ${selection === 'new' ? 'selected' : ''}`}
            onClick={() => setSelection('new')}
          >
            <AddCircle style={{ fontSize: 50, color: selection === 'new' ? 'white' : '#3f51b5' }} />
            <span>New User</span>
          </div>
        </>
      )}

      {selection === 'new' && (
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
              Create New User
            </Typography>
            <form onSubmit={createUser}>
              <TextField
                label="User Name"
                variant="outlined"
                fullWidth
                name="userName"
                value={formData.userName}
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
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
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
      )}

   
    </div>  
     {selection === 'existing' && (
        <div>
          <CreateBooking handleBack={handleBack} />{' '}
          {/* CreateBooking component will now have a max-width of 600px */}
        </div>
      )}</>
  );
}

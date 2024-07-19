/* eslint-disable import/no-unresolved */
import axios from 'axios';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks'; // Updated import for useRouter from 'next/router'

import { localUrl } from 'src/utils/util';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const theme = useTheme();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/login/dashboard/user`, {
        email,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem('user_id', response.data.loggedUserId);
        localStorage.setItem('user_role', response.data.loggedUserRole);
        localStorage.setItem('user_email', response.data.loggedUserEmail);
        localStorage.setItem('user_image', response.data.loggedUserImage);
        localStorage.setItem('user_name', response.data.loggedUserName);
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert("Login failed ! Please check your username and password")
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (
    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
      <TextField
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email address"
      />

      <TextField
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading} // Added loading state
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Sign in to Roomsstay</Typography>

          <Divider sx={{ my: 3 }} />

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}

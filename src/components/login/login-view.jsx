import axios from 'axios';
import { useState, useEffect } from 'react'; // MODIFIED: Imported useEffect

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { toast } from 'react-toastify';

import { bgGradient } from '../../../theme/css';
import Logo from '../../../src/components/stuff/logo';
import Iconify from '../../../src/components/stuff/iconify';
import { useRouter } from '../routes/hooks';
import { localUrl } from '../../../utils/util';

// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();

  // --- STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginMethod, setLoginMethod] = useState('password');
  const [otpSent, setOtpSent] = useState(false);

  // NEW: State for the resend OTP timer
  const [resendTimer, setResendTimer] = useState(0);

  // NEW: useEffect to handle the countdown timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    // Cleanup the timer when the component unmounts or timer changes
    return () => clearTimeout(timer);
  }, [resendTimer]);


  // --- SUCCESSFUL LOGIN HANDLER ---
  const handleLoginSuccess = (data) => {
    localStorage.setItem('user_id', data.loggedUserId);
    localStorage.setItem('user_role', data.loggedUserRole);
    localStorage.setItem('user_email', data.loggedUserEmail);
    localStorage.setItem('user_image', data.loggedUserImage);
    localStorage.setItem('user_name', data.loggedUserName);
    localStorage.setItem('rs_token', data.rsToken);
      router.push('/dashboard');
   
    toast.success('Login successful!');
    setTimeout(() => window.location.reload(), 5000);
  };

  // --- API HANDLERS ---

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/login/dashboard/user`, {
        email,
        password,
      });
      if (response.status === 200) {
        handleLoginSuccess(response.data);
      } else {
        toast.error('Something went wrong');
      }
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        toast.error(error.response.data.message || 'Invalid credentials');
      } else {
        console.error('Login failed:', error);
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // MODIFIED: Reusable function to request OTP
  const requestOtp = async () => {
    if (!email) {
      toast.warn('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/mail/send-otp`, { email });
      if (response.status === 200) {
        toast.success(response.data.message || 'OTP has been sent to your email.');
        if (!otpSent) setOtpSent(true); // Show OTP field only on the first attempt
        setResendTimer(30); // Start the 30-second timer
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Could not send OTP.');
      } else {
        console.error('Send OTP failed:', error);
        toast.error('Failed to send OTP. Please check the email and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSendOtpSubmit = (e) => {
    e.preventDefault();
    requestOtp();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.warn('Please enter the OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/mail/verify-otp`, {
        email,
        otp,
      });
      if (response.status === 200) {
        handleLoginSuccess(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Invalid OTP.');
      } else {
        console.error('OTP verification failed:', error);
        toast.error('OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FORMS ---

  const renderPasswordForm = (
    <Stack spacing={3} component="form" onSubmit={handlePasswordSubmit}>
      <TextField
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email address"
        required
      />
      <TextField
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        required
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
        loading={loading}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  // MODIFIED: OTP Form with Resend Logic
  const renderOtpForm = (
    <Stack spacing={2} component="form" onSubmit={!otpSent ? handleSendOtpSubmit : handleOtpSubmit}>
      <TextField
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email address"
        required
        disabled={otpSent}
      />

      {otpSent && (
        <>
          <TextField
            name="otp"
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Box sx={{ textAlign: 'right', mt: -1, mb: 1 }}>
            {resendTimer > 0 ? (
              <Typography variant="body2" color="text.secondary">
                Resend OTP in {resendTimer}s
              </Typography>
            ) : (
              <Button
                size="small"
                onClick={requestOtp}
                disabled={loading}
              >
                Resend OTP
              </Button>
            )}
          </Box>
        </>
      )}

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
      >
        {!otpSent ? 'Send OTP' : 'Verify & Login'}
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
        <Card sx={{ p: 5, width: 1, maxWidth: 420 }}>
          <Typography variant="h4">Sign in to Roomsstay</Typography>

          <Stack direction="row" spacing={2} sx={{ my: 3 }}>
            <Button
              fullWidth
              variant={loginMethod === 'password' ? 'contained' : 'outlined'}
              onClick={() => setLoginMethod('password')}
            >
              Login with Password
            </Button>
            <Button
              fullWidth
              variant={loginMethod === 'otp' ? 'contained' : 'outlined'}
              onClick={() => setLoginMethod('otp')}
            >
              Login with OTP
            </Button>
          </Stack>

          {loginMethod === 'password' ? renderPasswordForm : renderOtpForm}
        </Card>
      </Stack>
    </Box>
  );
}
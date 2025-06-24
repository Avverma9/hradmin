import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Snackbar,
  IconButton,
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Grid,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Alert,
} from "@mui/material";
import {
  Close,
  ArrowBack,
  Search,
  PersonAdd,
  PersonSearch,
  Phone,
  Email,
  Person,
  Lock,
  Home,
  PhotoCamera,
} from "@mui/icons-material";
import { findUser } from "src/components/redux/reducers/user";
import { localUrl, notify } from "../../../../utils/util";
import Hotel from "./hotel";

const EmptyState = ({ mobile, onAddUser }) => (
  <Box textAlign="center" p={4} my={2}>
    <PersonSearch sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
    <Typography variant="h6" color="text.secondary">
      No User Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
      We couldn&apos;t find a user with the mobile number:{" "}
      <strong>{mobile}</strong>
    </Typography>
    <Button
      variant="contained"
      color="secondary"
      onClick={onAddUser}
      startIcon={<PersonAdd />}
    >
      Create a New User
    </Button>
  </Box>
);

EmptyState.propTypes = {
  mobile: PropTypes.string.isRequired,
  onAddUser: PropTypes.func.isRequired,
};

const AddUserForm = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    userName: "",
    mobile: sessionStorage.getItem("subn") || "",
    email: "",
    password: "",
    address: "",
    images: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, images: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      const response = await axios.post(`${localUrl}/Signup`, data);
      notify(response.status);
      if (response.data && response.data.user) {
        onUserCreated(response.data.user);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      notify("Failed to create user!", "error");
    }
  };

  const isFormInvalid =
    !formData.userName ||
    formData.mobile.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
    formData.password.length < 8 ||
    !formData.address;

  return (
    <Box component="form" onSubmit={createUser} sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Create New User
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Box textAlign="center">
            <Avatar
              src={imagePreview}
              sx={{ width: 100, height: 100, mb: 1, border: "2px dashed grey" }}
            />
            <Button component="label" size="small" startIcon={<PhotoCamera />}>
              Upload Photo{" "}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="userName"
            label="User Name"
            value={formData.userName}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="mobile"
            label="Mobile Number"
            value={formData.mobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Home color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isFormInvalid}
            sx={{ py: 1.5 }}
          >
            Create & Proceed
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

AddUserForm.propTypes = {
  onUserCreated: PropTypes.func.isRequired,
};

export default function CreateBooking({ handleBack }) {
  const dispatch = useDispatch();
  const [showHotel, setShowHotel] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [mobile, setMobile] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const foundUser = useSelector((state) => state.user.userData);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  const handleFindUser = () => {
    if (!mobile) {
      setSnackbarMessage("Please enter a mobile number.");
      setSnackbarOpen(true);
      return;
    }
    const data = { mobile };
    setShowHotel(false);
    setShowAddUser(false);
    setSearchAttempted(true);
    dispatch(findUser(data));
  };

  useEffect(() => {
    if (searchAttempted && error) {
      setSnackbarMessage(
        "No user found or there was an error with the request.",
      );
      setSnackbarOpen(true);
    }
  }, [error, searchAttempted]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSelectedUserBooking = (user) => {
    sessionStorage.setItem("subn", user.mobile);
    sessionStorage.setItem("subid", user.userId || user._id);
    setShowHotel(true);
    setShowAddUser(false);
  };

  const handleAddUserClick = () => {
    setShowHotel(false);
    setShowAddUser(true);
    sessionStorage.setItem("subn", mobile);
    sessionStorage.setItem("subid", "new");
  };

  return (
    <Container maxWidth="lg">
      {handleBack && (
        <Button
          variant="text"
          color="inherit"
          onClick={handleBack}
          startIcon={<ArrowBack />}
          sx={{ mb: 2, alignSelf: "flex-start" }}
        >
          Go Back
        </Button>
      )}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Create Booking
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Find an existing user or add a new one to start a booking.
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Enter User Mobile Number"
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFindUser}
            disabled={loading}
            sx={{ height: 56, px: 5, whiteSpace: "nowrap" }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Find User"
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="overline">Result</Typography>
        </Divider>

        {foundUser &&
          Array.isArray(foundUser) &&
          foundUser.length > 0 &&
          !showHotel &&
          !showAddUser && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Found
              </Typography>
              {foundUser.map((item) => (
                <Card key={item.userId} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 56, height: 56 }}>
                        {item.userName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{item.userName}</Typography>
                        <Typography color="text.secondary">
                          {item.email}
                        </Typography>
                        <Typography color="text.secondary">
                          {item.mobile}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleSelectedUserBooking(item)}
                    >
                      Make Booking For This User
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}

        {searchAttempted &&
          (!foundUser || foundUser.length === 0) &&
          !loading &&
          !showHotel &&
          !showAddUser && (
            <EmptyState mobile={mobile} onAddUser={handleAddUserClick} />
          )}

        {showHotel && !showAddUser && <Hotel />}
        {showAddUser && !showHotel && (
          <AddUserForm onUserCreated={handleSelectedUserBooking} />
        )}
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
}

CreateBooking.propTypes = {
  handleBack: PropTypes.func,
};

CreateBooking.defaultProps = {
  handleBack: null,
};

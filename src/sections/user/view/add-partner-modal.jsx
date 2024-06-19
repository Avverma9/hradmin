import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
} from '@mui/material';

export default function AddUserModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = () => {
    // Prepare new user object
    const newUser = {
      name,
      mobile,
      email,
      status: status === 'active',
      images,
    };

    onSubmit(newUser); // Pass new user object to onSubmit function
    onClose(); // Close modal
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Profile Picture URL"
          fullWidth
          value={images}
          onChange={(e) => setImages(e.target.value)}
        />
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Mobile"
          fullWidth
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
            <MenuItem value>Active</MenuItem>
            <MenuItem value={false}>Inactive</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};



/* eslint-disable react/no-unescaped-entities */
// import PropTypes from 'prop-types';
// import React, { useState } from 'react';

// import {
//   Box,
//   Grid,
//   Button,
//   Dialog,
//   Select,
//   MenuItem,
//   TextField,
//   InputLabel,
//   FormControl,
//   DialogTitle,
//   DialogActions,
//   DialogContent,
// } from '@mui/material';

// const AddUserModal = ({ open, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     gender: '',
//     birthMonth: '',
//     birthDay: '',
//     birthYear: '',
//     email: '',
//     confirmEmail: '',
//     location: '',
//     phoneNumber: '',
//     language: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     onSubmit(formData);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//       <DialogTitle>Basic Info</DialogTitle>
//       <DialogContent>
//         <Box component="form" noValidate autoComplete="off">
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="firstName"
//                 label="First Name"
//                 fullWidth
//                 value={formData.firstName}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="lastName"
//                 label="Last Name"
//                 fullWidth
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>I'm</InputLabel>
//                 <Select name="gender" value={formData.gender} onChange={handleChange}>
//                   <MenuItem value="Male">Male</MenuItem>
//                   <MenuItem value="Female">Female</MenuItem>
//                   <MenuItem value="Other">Other</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} sm={6} container spacing={1}>
//               <Grid item xs={4}>
//                 <FormControl fullWidth>
//                   <InputLabel>Birth Month</InputLabel>
//                   <Select name="birthMonth" value={formData.birthMonth} onChange={handleChange}>
//                     <MenuItem value="January">January</MenuItem>
//                     <MenuItem value="February">February</MenuItem>
//                     <MenuItem value="March">March</MenuItem>
//                     {/* Add all months */}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={4}>
//                 <FormControl fullWidth>
//                   <InputLabel>Day</InputLabel>
//                   <Select name="birthDay" value={formData.birthDay} onChange={handleChange}>
//                     {[...Array(31).keys()].map((day) => (
//                       <MenuItem key={day + 1} value={day + 1}>
//                         {day + 1}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={4}>
//                 <FormControl fullWidth>
//                   <InputLabel>Year</InputLabel>
//                   <Select name="birthYear" value={formData.birthYear} onChange={handleChange}>
//                     {[...Array(100).keys()].map((year) => (
//                       <MenuItem key={year + 1920} value={year + 1920}>
//                         {year + 1920}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="email"
//                 label="Email"
//                 fullWidth
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="confirmEmail"
//                 label="Confirmation Email"
//                 fullWidth
//                 value={formData.confirmEmail}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="location"
//                 label="Your Location"
//                 fullWidth
//                 value={formData.location}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="phoneNumber"
//                 label="Phone Number"
//                 fullWidth
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 name="language"
//                 label="Language"
//                 fullWidth
//                 value={formData.language}
//                 onChange={handleChange}
//               />
//             </Grid>
//           </Grid>
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="secondary">
//           Cancel
//         </Button>
//         <Button onClick={handleSubmit} color="primary">
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// AddUserModal.propTypes = {
//   open: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
// };

// export default AddUserModal;

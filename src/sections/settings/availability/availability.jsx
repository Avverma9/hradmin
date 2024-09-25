/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import axios from 'axios';
import React, { useState } from 'react';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
    Grid, Table, Paper, Button, Dialog,
    TableRow, TextField, TableBody, TableCell,
    TableHead, Typography, DialogTitle, DialogContent, DialogActions,
    TableContainer, CircularProgress
} from '@mui/material';

import { localUrl } from 'src/utils/util';

const HotelAvailability = () => {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openFromPicker, setOpenFromPicker] = useState(false);
    const [openToPicker, setOpenToPicker] = useState(false);

    const fetchHotels = async () => {
        if (!fromDate || !toDate) {
            alert('Please select both from date and to date.');
            return;
        }

        const from = fromDate.toISOString();
        const to = toDate.toISOString();

        setLoading(true);

        try {
            const response = await axios.get(`${localUrl}/check/all-hotels/room-availability?fromDate=${from}&toDate=${to}`);
            setHotels(response.data);
        } catch (error) {
            console.error('Error fetching hotel data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMore = (hotel) => {
        setSelectedHotel(hotel);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedHotel(null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper style={{ padding: 20 }}>
                <Typography variant="h4" gutterBottom>
                    Hotel Availability
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div onClick={() => setOpenFromPicker(true)} style={{ flex: 1, cursor: 'pointer' }}>
                        <DatePicker
                            label="From Date"
                            value={fromDate}
                            onChange={(newValue) => setFromDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                            open={openFromPicker}
                            onAccept={() => setOpenFromPicker(false)}
                            onClose={() => setOpenFromPicker(false)}
                        />
                    </div>
                    <div onClick={() => setOpenToPicker(true)} style={{ flex: 1, cursor: 'pointer' }}>
                        <DatePicker
                            label="To Date"
                            value={toDate}
                            onChange={(newValue) => setToDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                            open={openToPicker}
                            onAccept={() => setOpenToPicker(false)}
                            onClose={() => setOpenToPicker(false)}
                        />
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchHotels}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'View Availability'}
                    </Button>
                </div>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Hotel Name</TableCell>
                                <TableCell>Total Rooms</TableCell>
                                <TableCell>Booked Rooms</TableCell>
                                <TableCell>Available Rooms</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hotels.map((hotel) => (
                                <TableRow key={hotel.hotelId}>
                                    <TableCell>{hotel.hotelName}</TableCell>
                                    <TableCell>{hotel.totalRooms}</TableCell>
                                    <TableCell>{hotel.bookedRooms}</TableCell>
                                    <TableCell>{hotel.availableRooms}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="secondary" onClick={() => handleViewMore(hotel)}>
                                            View More
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{selectedHotel?.hotelName}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body1">Total Rooms:</Typography>
                                <Typography variant="body2">{selectedHotel?.totalRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Booked Rooms:</Typography>
                                <Typography variant="body2">{selectedHotel?.bookedRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Available Rooms:</Typography>
                                <Typography variant="body2">{selectedHotel?.availableRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Cancelled Booking:</Typography>
                                <Typography variant="body2">{selectedHotel?.cancelledRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Checked In Booking:</Typography>
                                <Typography variant="body2">{selectedHotel?.checkedInRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Checked Out Booking:</Typography>
                                <Typography variant="body2">{selectedHotel?.checkedOutRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">No Show Booking:</Typography>
                                <Typography variant="body2">{selectedHotel?.noShowRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Failed Booking:</Typography>
                                <Typography variant="body2">{selectedHotel?.failedRooms}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">Pending Booking:</Typography>
                                <Typography variant="body2">{selectedHotel?.pendingRooms}</Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </LocalizationProvider>
    );
};

export default HotelAvailability;

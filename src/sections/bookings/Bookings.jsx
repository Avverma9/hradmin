/* eslint-disable react-hooks/exhaustive-deps */
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { Form, Table, Button, Dropdown } from 'react-bootstrap'; // Import toast from React Toastify
import 'react-toastify/dist/ReactToastify.css';

import { localUrl } from 'src/utils/util';

export default function BookingsView() {

  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, [bookingId, status]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${localUrl}/get/all/filtered/booking/by/query?bookingStatus=${status}&bookingId=${bookingId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);


    } catch (error) {
      console.error('Error:', error);
      toast.info('No bookings found');
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  return (
    <div className="container mt-4">
      <h2>Bookings</h2>

      <Form className="mb-3">
               <Form.Group className="mb-3" controlId="formBookingId">
          <Form.Label>Booking ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formStatus">
          <Form.Label>Status</Form.Label>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-status">
              {status || 'Select Status'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setStatus('Cancelled')}>Cancelled</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatus('Confirmed')}>Confirmed</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatus('Failed')}>Failed</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatus('Checked-in')}>CheckedIn</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatus('Checked-out')}>CheckedOut</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>

        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>B.ID</th>
            <th>Hotel</th>
            <th>Name</th>
            <th>Status</th>
            <th>Room Type</th>
            <th>Check-in</th>
            <th>Check-out</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking.bookingId}</td>
              <td>{booking.hotelName}</td>
              <td>{booking.user.name}</td>
              <td>{booking.bookingStatus}</td>
              <td>
                {booking.roomDetails.map((room) => (
                  <div key={room._id}>
                    {room.type} {/* Assuming type is the correct property */}
                  </div>
                ))}
              </td>
              <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
              <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

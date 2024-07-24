/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Form, Table, Button, Dropdown } from 'react-bootstrap';

import { localUrl } from 'src/utils/util';

export default function BookingsView() {
  const [userId, setUserId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, [userId, bookingId, status]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${localUrl}/get/all/filtered/booking/by/query?bookingStatus=${status}&userId=${userId}&bookingId=${bookingId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  return (
    <div>
      <h2>Bookings</h2>

      <Form className="mb-3">
        <Form.Group className="mb-3" controlId="formUserId">
          <Form.Label>User ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </Form.Group>

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
              <Dropdown.Item onClick={() => setStatus('CheckedIn')}>CheckedIn</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatus('CheckedOut')}>CheckedOut</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>

        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Email</th>
            <th>Room Type</th>
            <th>Check-in</th>
            <th>Check-out</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.name}</td>
              <td>{booking.status}</td>
              <td>{booking.email}</td>
              <td>{booking.roomType}</td>
              <td>{booking.checkIn}</td>
              <td>{booking.checkOut}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

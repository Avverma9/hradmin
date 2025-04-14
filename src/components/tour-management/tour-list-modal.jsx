import React from 'react';
import { Modal, Button, Row, Col, ListGroup, Image, Badge } from 'react-bootstrap';
import './listModal.css'; // We'll add a few custom styles below

const ListModal = ({ show, handleClose, data }) => {
  if (!data) return null;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <Modal show={show} onHide={handleClose} size="lg" scrollable centered className="enhanced-modal">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="w-100 text-center fs-4">
          {data.travelAgencyName} - <span className="text-light">{data.themes || 'N/A'} Package</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Overview */}
        <section className="section-box">
          <h5 className="section-title">🌴 Overview</h5>
          <p className="text-muted">{data.overview || 'No overview available'}</p>
        </section>

        {/* Basic Details */}
        <section className="section-box">
          <Row className="gy-2">
            <Col md={6}><strong>📍 Location:</strong> {data.city}, {data.state}</Col>
            <Col md={6}><strong>🎯 Theme:</strong> {data.themes || 'N/A'}</Col>
            <Col md={6}><strong>💸 Price:</strong> <Badge bg="success" pill>₹{data.price}</Badge></Col>
            <Col md={6}><strong>⏳ Duration:</strong> {data.days} Days / {data.nights} Nights</Col>
            <Col md={12}><strong>📅 Dates:</strong> {formatDate(data.from)} – {formatDate(data.to)}</Col>
            <Col md={12}><strong>🗺️ Visiting:</strong> {data.visitngPlaces?.split('|').join(', ')}</Col>
          </Row>
        </section>

        {/* Day-wise Itinerary */}
        <section className="section-box">
          <h5 className="section-title">🗓️ Day-wise Itinerary</h5>
          <ListGroup variant="flush">
            {data.dayWise?.length > 0 ? (
              data.dayWise.map((item) => (
                <ListGroup.Item key={item._id}>
                  <strong>Day {item.day}:</strong> {item.description || 'No description available'}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No itinerary available</ListGroup.Item>
            )}
          </ListGroup>
        </section>

        {/* Amenities */}
        <section className="section-box">
          <h5 className="section-title">🎒 Amenities</h5>
          <p>{data.amenities?.length > 0 ? data.amenities.join(', ') : 'N/A'}</p>
        </section>

        {/* Inclusions & Exclusions */}
        <Row className="section-box">
          <Col md={6}>
            <h6 className="section-subtitle">✅ Inclusions</h6>
            <ul>
              {data.inclusion?.length > 0 ? (
                data.inclusion.map((inc, i) => <li key={i}>{inc}</li>)
              ) : (
                <li>No inclusions available</li>
              )}
            </ul>
          </Col>
          <Col md={6}>
            <h6 className="section-subtitle">❌ Exclusions</h6>
            <ul>
              {data.exclusion?.length > 0 ? (
                data.exclusion.map((exc, i) => <li key={i}>{exc}</li>)
              ) : (
                <li>No exclusions available</li>
              )}
            </ul>
          </Col>
        </Row>

        {/* Terms */}
        <section className="section-box">
          <h5 className="section-title">📄 Terms & Conditions</h5>
          <ul>
            <li><strong>Cancellation:</strong> {data.termsAndConditions?.cancellation || 'N/A'}</li>
            <li><strong>Refund:</strong> {data.termsAndConditions?.refund || 'N/A'}</li>
            <li><strong>Booking Policy:</strong> {data.termsAndConditions?.bookingPolicy || 'N/A'}</li>
          </ul>
        </section>

        {/* Gallery */}
        <section className="section-box">
          <h5 className="section-title">📸 Gallery</h5>
          <Row className="g-3">
            {data.images?.length > 0 ? (
              data.images.map((img, i) => (
                <Col md={4} key={i}>
                  <div className="gallery-image">
                    <Image src={img} fluid rounded />
                  </div>
                </Col>
              ))
            ) : (
              <p>No images available</p>
            )}
          </Row>
        </section>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary">Update</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ListModal;

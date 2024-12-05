import React from "react";
import "./Hotel.css"; // You can style this CSS file accordingly

const Hotel = () => {
  return (
    <div className="hotel-list">
      {/* Hotel 1 */}
      <div className="hotel-card">
        <div className="hotel-image">
          <img
            src="https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG90ZWx8ZW58MHx8MHx8fDA%3D"
            alt="Hotel O Maninagar"
          />
          <div className="badge">Company-Serviced</div>
        </div>
        <div className="hotel-details">
          <h3>Hotel O Maninagar Near Railway Station formerly A1 Residency</h3>
          <p>Maninagar, Ahmedabad • 4.1 km</p>
          <div className="hotel-ratings">
            <span>3.5</span> <span>(75 Ratings) • Good</span>
          </div>
          <div className="hotel-features">
            <span>Elevator</span>
            <span>Free Wifi</span>
            <span>Geyser</span>
            <span>+ 5 more</span>
          </div>
          <div className="hotel-pricing">
            <span className="price">₹793</span>
            <span className="original-price">₹3065</span>
            <span className="discount">73% off</span>
            <p>+ ₹182 taxes & fees per room per night</p>
          </div>
          <div className="hotel-actions">
            <button className="details-btn">View Details</button>
            <button className="book-btn">Book Now</button>
          </div>
        </div>
      </div>

      {/* Hotel 2 */}
      <div className="hotel-card">
        <div className="hotel-image">
          <img
            src="https://plus.unsplash.com/premium_photo-1661907977530-eb64ddbfb88a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFycmlvdHQlMjBob3RlbHxlbnwwfHwwfHx8MA%3D%3D"
            alt="Collection O Green Park"
          />
          <div className="badge">Mid range</div>
        </div>
        <div className="hotel-details">
          <h3>Collection O Green Park</h3>
          <p>Behrampura, Ahmedabad • 2.1 km</p>
          <div className="hotel-ratings">
            <span>3.8</span> <span>(175 Ratings) • Good</span>
          </div>
          <div className="hotel-features">
            <span>Free Wifi</span>
            <span>Geyser</span>
            <span>Power backup</span>
            <span>+ 4 more</span>
          </div>
          <div className="hotel-pricing">
            <span className="price">₹590</span>
            <span className="original-price">₹2795</span>
            <span className="discount">73% off</span>
            <p>+ ₹151 taxes & fees per room per night</p>
          </div>
          <div className="hotel-booking-info">
            <p>600+ people booked this OYO in last 6 months</p>
          </div>
          <div className="hotel-actions">
            <button className="details-btn">View Details</button>
            <button className="book-btn">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotel;

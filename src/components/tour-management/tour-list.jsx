import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tourList } from "../redux/reducers/tour/tour";
import { iconsList } from "../../../utils/icon";
import "./tour-list.css";


const TourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = useSelector((state) => state.tour.data);


  useEffect(() => {
    dispatch(tourList());
  }, [dispatch]);

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity) => {
    const iconObj = iconsList.find(
      (icon) => icon.label.toLowerCase() === amenity.toLowerCase()
    );
    return iconObj ? iconObj.icon : null;
  };

  // Handle booking navigation
  const handleUpdate = (id) => {
    navigate(`/tour-update/${id}`);
  };

  return (
    <>
      {data && data.length > 0 && (
        <div className="travel-packages">
          {data.map((pkg, index) => {
            const defaultImage = "default-image.jpg"; // Default image fallback
            return (
              <div key={index} className="package-card">
                <img
                  src={pkg.images[0] || defaultImage}
                  alt={pkg.travelAgencyName}
                  className="package-image"
                />
                <div className="package-info">
                  <h3 className="package-title">{pkg.travelAgencyName}</h3>
                  <p className="package-duration">
                    {pkg.nights} Nights & {pkg.days} Days
                  </p>
                  <div className="nights-badge">{pkg.nights} Nights</div>
                  <div className="amenities">
                    {pkg.amenities?.slice(0, 3).map((amenity, idx) => {
                      const amenityIcon = getAmenityIcon(amenity);
                      return (
                        <span key={idx} className="amenity">
                          {amenityIcon && (
                            <span className="amenity-icon">{amenityIcon}</span>
                          )}
                          <span className="amenity-label">{amenity}</span>
                        </span>
                      );
                    })}
                  </div>
                  <div className="price-section">
                    {pkg.price && (
                      <span className="current-price">₹ {pkg.price}</span>
                    )}
                  </div>
                  <button
                    className="package-button"
                    onClick={() => handleUpdate(pkg?._id)}
                  >
                    View & update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TourList;

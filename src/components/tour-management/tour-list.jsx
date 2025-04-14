import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tourList } from "../redux/reducers/tour/tour";
import { iconsList } from "../../../utils/icon";
import "./tour-list.css";
import ListModal from "./tour-list-modal";

const TourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = useSelector((state) => state.tour.data);

  // Modal state: track selected package
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    dispatch(tourList());
  }, [dispatch]);

  const getAmenityIcon = (amenity) => {
    const iconObj = iconsList.find(
      (icon) => icon.label.toLowerCase() === amenity.toLowerCase(),
    );
    return iconObj ? iconObj.icon : null;
  };

  const handleBooking = (id) => {
    navigate(`/travellers/booking/${id}`);
  };

  return (
    <>
      {data && data.length > 0 ? (
        <div className="travel-packages">
          {data.map((pkg, index) => (
            <div key={index} className="package-card">
              <img
                src={pkg.images[0] || "default-image.jpg"}
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
                  {pkg.amenities?.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="amenity">
                      {getAmenityIcon(amenity) && (
                        <span className="amenity-icon">
                          {getAmenityIcon(amenity)}
                        </span>
                      )}
                      <span className="amenity-label">{amenity}</span>
                    </span>
                  ))}
                </div>
                <div className="price-section">
                  {pkg.price && (
                    <span className="current-price">₹ {pkg.price}</span>
                  )}
                </div>
                <button
                  className="package-button"
                  onClick={() => setSelectedPackage(pkg)}
                >
                  View & update
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data-message">No travel packages available.</div>
      )}
      {selectedPackage && (
        <ListModal
          show={!!selectedPackage}
          handleClose={() => setSelectedPackage(null)}
          data={selectedPackage}
        />
      )}
    </>
  );
};

export default TourList;

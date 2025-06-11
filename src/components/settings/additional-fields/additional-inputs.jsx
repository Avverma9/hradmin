import "./additional-inputs.css";
import BedTypes from "./bed-type";
import Amenity from "./hotel-amenities";
import MenuItem from "./menu-items";
import Role from "./roles";
import RoomTypes from "./room-type";
import TravelAmenities from "./travel-amenities";

const AdditionalInputs = () => {
  return (
    <div className="additional-inputs-container">
      {/* First Row */}
      <div className="input-row">
        <div className="input-section">
          <Role />
        </div>
        <div className="input-section">
          <MenuItem />
        </div>
      </div>

      {/* Second Row */}
      <div className="input-row">
        <div className="input-section">
          <RoomTypes />
        </div>
        <div className="input-section">
          <BedTypes />
        </div>
      </div>

      {/*Third Row*/}
      <div className="input-row">
        <div className="input-section">
          <Amenity />
        </div>
        <div className="input-section">
          <TravelAmenities />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInputs;

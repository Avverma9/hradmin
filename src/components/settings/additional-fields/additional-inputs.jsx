
import './additional-inputs.css'; // We'll add simple CSS here
import Amenity from './hotel-amenities';
import Role from './roles';

const AdditionalInputs = () => {
    return (
        <div className="additional-inputs-container">
            <div className="input-section">
                <Role />
            </div>
            <div className="input-section">
                <Amenity />
            </div>
        </div>
    );
};

export default AdditionalInputs;

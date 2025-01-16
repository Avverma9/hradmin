import React, { useEffect } from 'react';
import './Cars.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCars } from '../redux/reducers/travel/car';

const Cars = () => {
    const dispatch = useDispatch();
    const cars = useSelector((state) => state.car.data);

    useEffect(() => {
        dispatch(getAllCars());
    }, [dispatch]);

    const handleCarImage = (car) => {
        if (car?.images && Array.isArray(car.images) && car.images.length > 0) {
            return car.images[0];
        } else {
            return carImageUrl;
        }
    };
    const carImageUrl = '/public/assets/car.png';

    return (
        <div className="cars-page">
            {/* Header Section */}
            <header className="car-upper-header">
                <div className="car-header-left">
                    <div className="car-radio-buttons">
                        <label>
                            <input type="radio" name="transfer-type" defaultChecked />
                            Seater
                        </label>
                        <label>
                            <input type="radio" name="transfer-type" />
                            Outstation/Other
                        </label>
                        <label>
                            <input type="radio" name="transfer-type" />
                            Hourly
                        </label>
                    </div>
                    <div className="car-dropdowns">
                        <select>
                            <option>Airport Pickup</option>
                        </select>
                        <select>
                            <option>Indira Gandhi International Airport, Terminal</option>
                        </select>
                        <select>
                            <option>GREATER KAILASH, GREATER KAILASH, SOUTH</option>
                        </select>
                    </div>
                </div>
                <div className="car-header-right">
                    <input type="datetime-local" />
                    <button>Search</button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="car-layout">
                {/* Sidebar */}
                <aside className="car-sidebar">
                    <div className="car-filter">
                        <h3>Car Type</h3>
                        <div>
                            <label>
                                <input type="checkbox" /> Sedan
                            </label>
                            <label>
                                <input type="checkbox" /> Hatchback
                            </label>
                            <label>
                                <input type="checkbox" /> SUV
                            </label>
                        </div>
                    </div>
                    <div className="car-filter">
                        <h3>Fuel Type</h3>
                        <div>
                            <label>
                                <input type="checkbox" /> Any
                            </label>
                            <label>
                                <input type="checkbox" /> Electric
                            </label>
                            <label>
                                <input type="checkbox" /> CNG
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Cars Section */}
                <main className="cars-container">
                    {cars?.length > 0 ? (
                        cars.map((car) => (
                            <div className="car-card" key={car?._id}>
                                <div className="car-header">
                                    <span className="car-safety">Safety</span>
                                    {car?.recommended && (
                                        <div className="car-recommended-badge">
                                            <span>Recommended</span>
                                        </div>
                                    )}
                                </div>

                                <div className="car-content">
                                    <img src={handleCarImage(car)} alt={car?.model} className="car-image" />
                                    <div className="car-details">
                                        <h3 className="car-title">
                                            {car?.make} {car?.model} ({car?.color})
                                        </h3>
                                        <div className="fuel-type">{car?.fuelType}</div>
                                        <div className="seats-and-luggage">
                                            <span>{car?.seater} Seat</span>
                                            <span>{car?.luggage} Luggage Bag</span>
                                            {car?.extraKm && <span>{car?.extraKm}</span>}
                                        </div>
                                        <div className="car-badges">
                                            {car?.badges?.map((badge, index) => (
                                                <div key={index} className="car-badge">
                                                    {badge}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="car-footer">
                                    <div className="car-price">₹ {car?.price}</div>
                                    <button className="book-now">Book Now</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No cars available at the moment.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Cars;

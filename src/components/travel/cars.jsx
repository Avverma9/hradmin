import React from 'react';
import './Cars.css';

const Cars = () => {
    const cars = [
        {
            id: 1,
            type: 'Sedan',
            fuel: 'Electric',
            price: 617,
            seats: 4,
            luggage: 2,
            extraKm: 'After 20 Km @ ₹5/km',
            badges: ['Free cancellation*', 'Toll Tax Included', '24/7 customer helpline'],
            recommended: true,
        },
        {
            id: 2,
            type: 'Toyota Etios Or Equivalent',
            fuel: 'CNG',
            price: 655,
            seats: 4,
            luggage: 2,
            extraKm: null,
            badges: ['24/7 customer helpline', 'Partial Payment'],
            recommended: false,
        },
    ];

    const carImageUrl = '/public/assets/car.png';

    return (
        <div className="cars-page">
            {/* Header Section */}
            <header className="car-upper-header">
                <div className="car-header-left">
                    <div className="car-radio-buttons">
                        <label>
                            <input type="radio" name="transfer-type" defaultChecked />
                            Airport Transfer
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
                    {cars.map((car) => (
                        <div className="car-card" key={car.id}>
                            {/* Header Section */}
                            <div className="car-header">
                                <span className="car-safety">Safety</span>
                                {car.recommended && (
                                    <div className="car-recommended-badge">
                                        <span>Recommended</span>
                                    </div>
                                )}
                            </div>

                            {/* Main Body */}
                            <div className="car-content">
                                <img src={carImageUrl} alt={car.type} className="car-image" />
                                <div className="car-details">
                                    <h3 className="car-title">{car.type}</h3>
                                    <div className="fuel-type">{car.fuel}</div>
                                    <div className="seats-and-luggage">
                                        <span>{car.seats} Seat</span>
                                        <span>{car.luggage} Luggage Bag</span>
                                        {car.extraKm && <span>{car.extraKm}</span>}
                                    </div>
                                    <div className="car-badges">
                                        {car.badges.map((badge, index) => (
                                            <div key={index} className="car-badge">
                                                {badge}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Section */}
                            <div className="car-footer">
                                <div className="car-price">₹ {car.price}</div>
                                <button className="book-now">Book Now</button>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default Cars;

// src/redux/reducers.js
import { combineReducers } from 'redux';
import bookingReducer from './reducers/booking';
import partnerReducer from './reducers/partner';
import hotelReducer from './reducers/hotel';
import couponReducer from './reducers/coupon';
import userReducer from './reducers/user';
import carReducer from './reducers/travel/car';
import carOwnerReducer from './reducers/travel/carOwner';

// Combine reducers into a rootReducer
const rootReducer = combineReducers({
    booking: bookingReducer,
    partner: partnerReducer,
    hotel: hotelReducer,
    coupon: couponReducer,
    user: userReducer,
    car: carReducer,
    owner: carOwnerReducer,
});
export default rootReducer;

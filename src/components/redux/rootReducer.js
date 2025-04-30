// src/redux/reducers.js
import { combineReducers } from 'redux';
import bookingReducer from './reducers/booking';
import partnerReducer from './reducers/partner';
import hotelReducer from './reducers/hotel';
import couponReducer from './reducers/coupon';
import userReducer from './reducers/user';
import carReducer from './reducers/travel/car';
import carOwnerReducer from './reducers/travel/carOwner';
import tourReducer from './reducers/tour/tour';
import bulkReducer from './reducers/bulk';
import additionalReducer from './reducers/additional';
import travelBookingReducer from './reducers/travel/booking';
import userCouponReducer from './reducers/userCoupon/coupon'
import { add } from 'lodash';
// Combine reducers into a rootReducer
const rootReducer = combineReducers({
    booking: bookingReducer,
    partner: partnerReducer,
    hotel: hotelReducer,
    coupon: couponReducer,
    user: userReducer,
    car: carReducer,
    owner: carOwnerReducer,
    tour: tourReducer,
    bulk: bulkReducer,
    additional: additionalReducer,
    travelBooking: travelBookingReducer,
    userCoupon:userCouponReducer
});
export default rootReducer;

// src/redux/reducers.js
import { combineReducers } from 'redux';
import bookingReducer from './reducers/booking';
import partnerReducer from './reducers/partner';
import hotelReducer from './reducers/hotel';

// Combine reducers into a rootReducer
const rootReducer = combineReducers({
  booking: bookingReducer,
  partner: partnerReducer,
  hotel: hotelReducer,

});
export default rootReducer;
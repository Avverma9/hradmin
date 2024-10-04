// src/redux/reducers.js
import { combineReducers } from 'redux';
import bookingReducer from './reducers/booking';
import partnerReducer from './reducers/partner';

// Combine reducers into a rootReducer
const rootReducer = combineReducers({
  booking: bookingReducer,
  partner: partnerReducer,
});

export default rootReducer;

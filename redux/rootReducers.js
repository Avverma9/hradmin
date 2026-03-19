import { combineReducers } from '@reduxjs/toolkit'
import adminAdditionalReducer from './slices/admin/additional'
import adminCouponReducer from './slices/admin/coupon'
import adminGstReducer from './slices/admin/gst'
import adminSidebarReducer from './slices/admin/sidebar'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboard'
import globalLoaderReducer from './slices/globalLoader'
import messengerReducer from './slices/messenger'
import partnerReducer from './slices/partner'
import pmsReducer from './slices/pms/bookings'
import userReducer from './slices/user'
import hotelReducer from './slices/admin/hotel'
import carReducer from './slices/tms/travel/car'
import tourReducer from './slices/tms/travel/tour/tour'

const rootReducer = combineReducers({
  adminAdditional: adminAdditionalReducer,
  adminCoupon: adminCouponReducer,
  adminGst: adminGstReducer,
  adminSidebar: adminSidebarReducer,
  auth: authReducer,
  dashboard: dashboardReducer,
  globalLoader: globalLoaderReducer,
  messenger: messengerReducer,
  partner: partnerReducer,
  pms: pmsReducer,
  user: userReducer,
  hotel: hotelReducer,
  car: carReducer,
  tour: tourReducer,

})

export default rootReducer

import { combineReducers } from '@reduxjs/toolkit'
import adminAdditionalReducer from './slices/admin/additional'
import adminSidebarReducer from './slices/admin/sidebar'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboard'
import globalLoaderReducer from './slices/globalLoader'
import messengerReducer from './slices/messenger'
import partnerReducer from './slices/partner'
import pmsReducer from './slices/pms/bookings'

const rootReducer = combineReducers({
  adminAdditional: adminAdditionalReducer,
  adminSidebar: adminSidebarReducer,
  auth: authReducer,
  dashboard: dashboardReducer,
  globalLoader: globalLoaderReducer,
  messenger: messengerReducer,
  partner: partnerReducer,
  pms: pmsReducer,
})

export default rootReducer

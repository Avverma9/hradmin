import AdditionalData from '../pages/admin/additional-data'
import GSTManagement from '../pages/admin/gst-management'
import AdminHotelBookings from '../pages/admin/hotel-bookings'
import ManageLinks from '../pages/admin/manage-links'
import CouponsPage from '../pages/admin/coupons'
import BookHotel from '../pages/booking-creation/book-hotel'
import CreateUser from '../pages/booking-creation/create-user'
import FindUser from '../pages/booking-creation/findUser'
import BookingCreationHotels from '../pages/booking-creation/hotel'
import Dashboard from '../pages/dashboard/dashboard'
import Messenger from '../pages/messenger/messenger'
import Partner from '../pages/partner/partner'
import PanelBooking from '../pages/pms/panel-booking'
import PmsBooking from '../pages/pms/pms-booking'
import Car from '../pages/tms/car'
import ViewCar from '../pages/tms/ViewCar'
import YourCars from '../pages/tms/your-car'
import CarsOwner from '../pages/tms/cars-owner'
import CarBookingsList from '../pages/tms/car-bookings-list'

const EditCarPage = () => <Car isEditMode />

export const APP_ROUTES = [
  { path: '/dashboard', Component: Dashboard },
  { path: '/user', Component: Partner },
  { path: '/manage-menu', Component: ManageLinks },
  { path: '/admin/coupon', Component: CouponsPage },
  { path: '/additional-fields', Component: AdditionalData },
  { path: '/gst-management', Component: GSTManagement },
  { path: '/gst-page', Component: GSTManagement },
  { path: '/hotel-bookings', Component: AdminHotelBookings },
  { path: '/messenger', Component: Messenger },
  { path: '/your-bookings', Component: PmsBooking },
  { path: '/panel-booking', Component: PanelBooking },
  { path: '/booking-creation', Component: FindUser },
  { path: '/booking-creation/hotels', Component: BookingCreationHotels },
  { path: '/booking-creation/create-user', Component: CreateUser },
  { path: '/booking-creation/book-hotel', Component: BookHotel },
  { path: '/add-a-car', Component: Car },
  { path: '/your-cars', Component: YourCars },
  { path: '/your-cars/:id', Component: ViewCar },
  { path: '/your-cars/:id/edit', Component: EditCarPage },
  {path: '/cars-owner', Component: CarsOwner },
  {path:"/travel-bookings", Component: CarBookingsList}
]

export const APP_ROUTE_PATHS = [...new Set([...APP_ROUTES.map((route) => route.path), '/your-cars'])]

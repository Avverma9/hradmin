import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';


const IndexPage = lazy(() => import('src/pages/app'));
const UserPage = lazy(() => import('src/pages/user'));
const LoginPage = lazy(() => import('src/pages/login'));
const ProductsPage = lazy(() => import('src/pages/admin/products'));
const Page404 = lazy(() => import('src/pages/page-not-found'));
const ListTravelPage = lazy(() => import('src/pages/admin/travel-location'));
const BannerPage = lazy(() => import('src/pages/admin/banner'));
const HotelDetailsPage = lazy(() => import('src/pages/hotel-details-page'));
const YourHotelsPage = lazy(() => import('src/pages/superAdmin/your-hotel-page'));
const BookingsView = lazy(() => import('src/pages/admin/admin-bookings-page'));
const BookingDetail = lazy(() => import('src/pages/booking-details'));
const UserDetails = lazy(() => import('src/pages/admin/alluser-page'));
const AllReviews = lazy(() => import('src/pages/admin/review-page'));
const SuperAdminBookingsView = lazy(() => import('src/pages/superAdmin/superAdmin-bookings-page'));
const MonthlyPricePage = lazy(() => import('src/pages/monthly-price'))
export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { path: 'dashboard', element: <IndexPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'hotels', element: <ProductsPage /> },
        { path: 'hotels/monthly-price', element: <MonthlyPricePage /> },
        { path: 'your-hotels', element: <YourHotelsPage /> },
        { path: 'view-hotel-details/:hotelId', element: <HotelDetailsPage /> },
        { path: 'all-bookings', element: <BookingsView /> },
        { path: 'your-bookings', element: <SuperAdminBookingsView /> },
        { path: 'all-users', element: <UserDetails /> },
        { path: 'all-reviews', element: <AllReviews /> },
        { path: 'your-booking-details/:bookingId', element: <BookingDetail /> },
        { path: 'add-travel-location', element: <ListTravelPage /> },
        { path: 'change-banner', element: <BannerPage /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '/', element: <LoginPage /> },
    { path: '404', element: <Page404 /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);

  return routes;
}

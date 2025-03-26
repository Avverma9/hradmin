import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/components/dashboard';
import { LoaderProvider } from '../../../utils/loader';
import BookNowPage from '../pages/superAdmin/book-now-page';

const IndexPage = lazy(() => import('src/components/pages/app'));
const UserPage = lazy(() => import('src/components/pages/user'));
const LoginPage = lazy(() => import('src/components/pages/login'));
const ProductsPage = lazy(() => import('src/components/pages/admin/hotels'));
const Page404 = lazy(() => import('src/components/pages/page-not-found'));
const ListTravelPage = lazy(() => import('src/components/pages/admin/travel-location'));
const BannerPage = lazy(() => import('src/components/pages/admin/banner'));
const HotelDetailsPage = lazy(() => import('src/components/pages/hotel-details-page'));
const YourHotelsPage = lazy(() => import('src/components/pages/superAdmin/your-hotel-page'));
const BookingsView = lazy(() => import('src/components/pages/admin/admin-bookings-page'));
const BookingDetail = lazy(() => import('src/components/pages/booking-details'));
const UserDetails = lazy(() => import('src/components/pages/admin/alluser-page'));
const AllReviews = lazy(() => import('src/components/pages/admin/review-page'));
const SuperAdminBookingsView = lazy(() => import('src/components/pages/superAdmin/superAdmin-bookings-page'));
const MonthlyPricePage = lazy(() => import('src/components/pages/monthly-price'));
const CouponPage = lazy(() => import('src/components/pages/admin/coupon-page'));
const MessengerPage = lazy(() => import('src/components/pages/messenger-app'));
const NotificationPage = lazy(() => import('src/components/pages/admin/notification-page'));
const PmsCouponPage = lazy(() => import('src/components/pages/superAdmin/pms-coupon'));
const ComplaintPage = lazy(() => import('src/components/pages/admin/complaint-page'));
const PmsComplaintsPage = lazy(() => import('src/components/pages/superAdmin/complaint-page'));
const BulkOperation = lazy(() => import('src/components/pages/admin/bulk-page'));
const AvailabilityPage = lazy(() => import('src/components/pages/admin/availability-page'));
const BookingCreate = lazy(() => import('src/components/pages/admin/booking_createForm'));
const CarsPage = lazy(() => import('src/components/pages/travel/cars-page'));
const CarFormPage = lazy(() => import('src/components/pages/travel/cars-form'));
const OwnerList = lazy(() => import('src/components/pages/travel/owner-list-page'));
const CarOwnerFormPage = lazy(() => import('src/components/pages/travel/car-owner-form'));
const OwnerCar = lazy(() => import('src/components/pages/travel/owner-car'));

export default function Router() {
    const routes = useRoutes([
        {
            element: (
                <DashboardLayout>
                    <Suspense
                        fallback={
                            <div>
                                <LoaderProvider />
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </DashboardLayout>
            ),
            children: [
                { path: 'dashboard', element: <IndexPage /> },
                { path: 'messenger', element: <MessengerPage /> },
                { path: 'send-notification-to-all', element: <NotificationPage /> },
                { path: 'user', element: <UserPage /> },
                { path: 'hotels', element: <ProductsPage /> },
                { path: 'bulk-data-processing', element: <BulkOperation /> },
                { path: 'hotels/monthly-price', element: <MonthlyPricePage /> },
                { path: 'your-hotels', element: <YourHotelsPage /> },
                { path: 'view-hotel-details/:hotelId', element: <HotelDetailsPage /> },
                { path: 'all-bookings', element: <BookingsView /> },
                { path: 'booking-creation', element: <BookingCreate /> },
                { path: 'your-bookings', element: <SuperAdminBookingsView /> },
                { path: 'all-users', element: <UserDetails /> },
                { path: 'all-reviews', element: <AllReviews /> },
                { path: 'book-now-page/:hotelId', element: <BookNowPage /> },
                { path: 'your-cars', element: <CarsPage /> },
                { path: 'cars-owner', element: <OwnerList /> },
                { path: 'add-an-car-owner', element: <CarOwnerFormPage /> },
                { path: 'add-a-car', element: <CarFormPage /> },
                { path: 'your-car-details/owner-car', element: <OwnerCar /> },

                { path: 'complaints', element: <ComplaintPage /> },
                { path: 'hotels/availability', element: <AvailabilityPage /> },
                { path: 'apply-coupon', element: <CouponPage /> },
                { path: 'your-complaints', element: <PmsComplaintsPage /> },
                { path: 'apply-pms-coupon', element: <PmsCouponPage /> },
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

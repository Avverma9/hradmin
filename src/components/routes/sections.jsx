import { lazy, Suspense, useState, useEffect } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from 'src/components/dashboard';
import { LoaderProvider } from '../../../utils/loader';
import { fetchNavConfig } from '../dashboard/config-navigation';
import BookNowPage from '../pages/superAdmin/book-now-page';

// Lazy load components
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
const TourFormPage = lazy(() => import('src/components/pages/tour/tour-form'));
const TourList = lazy(() => import('src/components/pages/tour/tour-list'));
const TourUpdatePage = lazy(() => import('src/components/pages/tour/tour-update'));
const TravelBookingTMS = lazy(() => import('src/components/pages/travel/travel-bookings'));
const TravelBookingsAdmin = lazy(() => import('src/components/settings/travelBookings/travel-booking'));
const PartnerCouponPage = lazy(() => import('src/components/pages/admin/partner-coupon-page'));
const UserCouponPage = lazy(() => import('src/components/pages/admin/user-coupon-page'));
const PMSMonthlyPricePage = lazy(() => import('src/components/pages/superAdmin/monthly-price-pms'));
const GSTpage = lazy(() => import('src/components/pages/admin/gst-page'));
const PanelBookingPage = lazy(() => import('src/components/pages/panel-booking'));
const AdditionalInputs = lazy(() => import('src/components/pages/admin/additional-page'));


// Recursively extract paths
const extractPathsFromNavItems = (items = []) => {
    const paths = [];

    const traverse = (itemList) => {
        itemList.forEach(item => {
            if (item?.path) {
                paths.push(item.path);
            }
            if (Array.isArray(item?.children)) {
                traverse(item.children);
            }
        });
    };

    traverse(items);
    return paths;
};

export default function Router() {
    const [navItems, setNavItems] = useState(null);

    // Fetch navigation configuration
    useEffect(() => {
        fetchNavConfig()
            .then(result => {
                setNavItems(result);
            })
            .catch(err => {
                console.error("Failed to fetch nav config:", err);
            });
    }, []);

    if (!navItems) {
        return <LoaderProvider />;
    }

    const allowedPaths = extractPathsFromNavItems(navItems).filter(Boolean);
    console.log("allowed o", allowedPaths)

    // Define the full routes configuration
    const allRoutes = [
        { path: '/dashboard', element: <IndexPage /> },
        { path: '/messenger', element: <MessengerPage /> },
        { path: '/send-notification-to-all', element: <NotificationPage /> },
        { path: '/user', element: <UserPage /> },
        { path: '/hotels', element: <ProductsPage /> },
        { path: '/bulk-data-processing', element: <BulkOperation /> },
        { path: '/hotels/monthly-price', element: <MonthlyPricePage /> },
        { path: '/hotels/monthly-price-pms', element: <PMSMonthlyPricePage /> },
        { path: '/gst-page', element: <GSTpage /> },
        { path: '/your-hotels', element: <YourHotelsPage /> },
        { path: '/view-hotel-details/:hotelId', element: <HotelDetailsPage /> },
        { path: '/all-bookings', element: <BookingsView /> },
        { path: '/booking-creation', element: <BookingCreate /> },
        { path: '/your-bookings', element: <SuperAdminBookingsView /> },
        { path: '/all-users', element: <UserDetails /> },
        { path: '/all-reviews', element: <AllReviews /> },
        { path: '/book-now-page/:hotelId', element: <BookNowPage /> },
        { path: "/panel-booking", element: <PanelBookingPage /> },
        { path: '/your-cars', element: <CarsPage /> },
        { path: '/cars-owner', element: <OwnerList /> },
        { path: '/add-an-car-owner', element: <CarOwnerFormPage /> },
        { path: '/add-a-car', element: <CarFormPage /> },
        { path: '/your-car-details/owner-car', element: <OwnerCar /> },
        { path: '/add-tour-data', element: <TourFormPage /> },
        { path: '/complaints', element: <ComplaintPage /> },
        { path: '/hotels/availability', element: <AvailabilityPage /> },
        { path: '/apply-coupon', element: <CouponPage /> },
        { path: '/your-complaints', element: <PmsComplaintsPage /> },
        { path: '/apply-pms-coupon', element: <PmsCouponPage /> },
        { path: '/your-booking-details/:bookingId', element: <BookingDetail /> },
        { path: '/add-travel-location', element: <ListTravelPage /> },
        { path: '/change-banner', element: <BannerPage /> },
        { path: '/tour-list', element: <TourList /> },
        { path: "/tour-update/:id", element: <TourUpdatePage /> },
        { path: "/travel-bookings", element: <TravelBookingTMS /> },
        { path: "/admin-travel/bookings", element: <TravelBookingsAdmin /> },
        { path: "/partner-coupon", element: <PartnerCouponPage /> },
        { path: "/user-coupon", element: <UserCouponPage /> },
        { path: "/additional-fields", element: <AdditionalInputs /> },

    ];

    // Filter the routes to include only the ones that are in allowedPaths
    const filteredRoutes = allowedPaths.map(path => {
        const route = allRoutes.find(r => r.path === path);
        return route ? route : null;
    }).filter(Boolean);

    // Keep the "/" route for login and 404 page
    const routes = useRoutes([
        {
            element: (
                <DashboardLayout>
                    <Suspense fallback={<LoaderProvider />}>
                        <Outlet />
                    </Suspense>
                </DashboardLayout>
            ),
            children: filteredRoutes,
        },
        { path: "/additional-fields", element: <AdditionalInputs /> },

        { path: '/', element: <LoginPage /> }, // Home route stays as it is
        { path: '/404', element: <Page404 /> },  // 404 route
        { path: '*', element: <Navigate to="/404" replace /> }, // Any unmatched path
    ]);

    return routes;
}

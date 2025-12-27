import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";

// Layouts and Loaders
import DashboardLayout from "src/components/dashboard";
import { LoaderProvider } from "../../../utils/loader";

// Navigation Configuration
import { fetchNavConfig } from "../dashboard/config-navigation";
import BulkHotel from "../settings/bulk-operation/BulkHotel";

// --- Page Components (Lazy Loaded) ---
const IndexPage = lazy(() => import("src/components/pages/app"));
const UserPage = lazy(() => import("src/components/pages/user"));
const LoginPage = lazy(() => import("src/components/pages/login"));
const Page404 = lazy(() => import("src/components/pages/page-not-found"));
const HotelDetailsPage = lazy(
  () => import("src/components/pages/hotel-details-page")
);
const BookingDetail = lazy(
  () => import("src/components/pages/booking-details")
);
const MessengerPage = lazy(() => import("src/components/pages/messenger-app"));
const PanelBookingPage = lazy(
  () => import("src/components/pages/panel-booking")
);

// Admin Pages
const ProductsPage = lazy(() => import("src/components/pages/admin/hotels"));
const ListTravelPage = lazy(
  () => import("src/components/pages/admin/travel-location")
);
const BannerPage = lazy(() => import("src/components/pages/admin/banner"));
const BookingsView = lazy(
  () => import("src/components/pages/admin/admin-bookings-page")
);
const UserDetails = lazy(
  () => import("src/components/pages/admin/alluser-page")
);
const AllReviews = lazy(() => import("src/components/pages/admin/review-page"));
const MonthlyPricePage = lazy(
  () => import("src/components/pages/admin/monthly-price")
);
const CouponPage = lazy(() => import("src/components/pages/admin/coupon-page"));
const NotificationPage = lazy(
  () => import("src/components/pages/admin/notification-page")
);
const ComplaintPage = lazy(
  () => import("src/components/pages/admin/complaint-page")
);
const BulkOperation = lazy(
  () => import("src/components/pages/admin/bulk-page")
);
const AvailabilityPage = lazy(
  () => import("src/components/pages/admin/availability-page")
);
const BookingCreate = lazy(
  () => import("src/components/pages/admin/booking_createForm")
);
const PartnerCouponPage = lazy(
  () => import("src/components/pages/admin/partner-coupon-page")
);
const UserCouponPage = lazy(
  () => import("src/components/pages/admin/user-coupon-page")
);
const GSTpage = lazy(() => import("src/components/pages/admin/gst-page"));
const AdditionalInputs = lazy(
  () => import("src/components/pages/admin/additional-page")
);
const TourRequest = lazy(
  () => import("src/components/pages/admin/tour-requests")
);

// Super Admin Pages
const BookNowPage = lazy(() => import("../pages/superAdmin/book-now-page"));
const YourHotelsPage = lazy(
  () => import("src/components/pages/superAdmin/your-hotel-page")
);
const SuperAdminBookingsView = lazy(
  () => import("src/components/pages/superAdmin/superAdmin-bookings-page")
);
const PmsCouponPage = lazy(
  () => import("src/components/pages/superAdmin/pms-coupon")
);
const PmsComplaintsPage = lazy(
  () => import("src/components/pages/superAdmin/complaint-page")
);
const PMSMonthlyPricePage = lazy(
  () => import("src/components/pages/superAdmin/monthly-price-pms")
);

// Travel & Tour Pages
const CarsPage = lazy(() => import("src/components/pages/travel/cars-page"));
const CarFormPage = lazy(() => import("src/components/pages/travel/cars-form"));
const OwnerList = lazy(
  () => import("src/components/pages/travel/owner-list-page")
);
const CarOwnerFormPage = lazy(
  () => import("src/components/pages/travel/car-owner-form")
);
const OwnerCar = lazy(() => import("src/components/pages/travel/owner-car"));
const TravelBookingsPage = lazy(
  () => import("src/components/pages/travel/travel-bookings-page")
);
const TourFormPage = lazy(() => import("src/components/pages/tour/tour-form"));
const TourList = lazy(() => import("src/components/pages/tour/tour-list"));
const TourUpdatePage = lazy(
  () => import("src/components/pages/tour/tour-update")
);
const MyTourPage = lazy(() => import("src/components/pages/tour/my-tour-page"));
const TourBookingsPage = lazy(
  () => import("src/components/pages/tour/tour-bookings-page")
);
const TourBookingPage = lazy(
  () => import("src/components/pages/tour/tour-booking-page")
);

const AdminTourBookingPage = lazy(
  () => import("src/components/settings/tour/tour-bookings")
);
const TravelBookingTMS = lazy(
  () => import("src/components/pages/travel/travel-bookings")
);
const TravelBookingsAdmin = lazy(
  () => import("src/components/settings/travelBookings/travel-booking")
);
const BulkHotelPage = lazy(
  () => import("src/components/pages/admin/bulkhotel-page")
);

/**
 * Recursively extracts all paths from the navigation configuration items.
 * @param {Array} items - The navigation items array.
 * @returns {Array<string>} A flat array of paths.
 */
const extractPathsFromNavConfig = (items = []) => {
  let paths = [];
  items.forEach((item) => {
    if (item?.path) {
      paths.push(item.path);
    }
    if (Array.isArray(item.children)) {
      paths = [...paths, ...extractPathsFromNavConfig(item.children)];
    }
  });
  return paths;
};

// --- Main Router Component ---
export default function Router() {
  const [navConfig, setNavConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNavConfig = async () => {
      try {
        const config = await fetchNavConfig();
        setNavConfig(config || []);
      } catch (err) {
        console.error("Failed to fetch nav config:", err);
        // Optionally set some default/error state for navConfig
      } finally {
        setIsLoading(false);
      }
    };

    loadNavConfig();
  }, []);

  const allAppRoutes = [
    // Main Dashboard Routes
    { path: "/dashboard", element: <IndexPage /> },
    { path: "/user", element: <UserPage /> },
    { path: "/hotels", element: <ProductsPage /> },
    { path: "/your-hotels", element: <YourHotelsPage /> },
    { path: "/view-hotel-details/:hotelId", element: <HotelDetailsPage /> },

    // Booking Routes
    { path: "/all-bookings", element: <BookingsView /> },
    { path: "/your-bookings", element: <SuperAdminBookingsView /> },
    { path: "/your-booking-details/:bookingId", element: <BookingDetail /> },
    { path: "/booking-creation", element: <BookingCreate /> },
    { path: "/book-now-page/:hotelId", element: <BookNowPage /> },
    { path: "/panel-booking", element: <PanelBookingPage /> },

    // User & Review Management
    { path: "/all-users", element: <UserDetails /> },
    { path: "/all-reviews", element: <AllReviews /> },

    // Hotel & Pricing Management
    { path: "/hotels/monthly-price", element: <MonthlyPricePage /> },
    { path: "/hotels/monthly-price-pms", element: <PMSMonthlyPricePage /> },
    { path: "/hotels/availability", element: <AvailabilityPage /> },
    { path: "/gst-page", element: <GSTpage /> },
    { path: "/bulk-data-processing", element: <BulkOperation /> },
    { path: "/bulk-hotel-import", element: <BulkHotel /> },

    { path: "/additional-fields", element: <AdditionalInputs /> },

    // Travel & Tours
    { path: "/your-cars", element: <CarsPage /> },
    { path: "/cars-owner", element: <OwnerList /> },
    { path: "/add-an-car-owner", element: <CarOwnerFormPage /> },
    { path: "/add-a-car", element: <CarFormPage /> },
    { path: "/your-car-details/owner-car", element: <OwnerCar /> },
    { path: "/add-tour-data", element: <TourFormPage /> },
    { path: "/tour-list", element: <TourList /> },
    { path: "/tour-update/:id", element: <TourUpdatePage /> },
    { path: "/tour-booking/:tourId", element: <TourBookingPage /> },
    { path: "/tour-bookings", element: <TourBookingsPage /> },
    { path: "/tour-requests", element: <TourRequest /> },
    { path: "/travel-bookings", element: <TravelBookingsPage /> },
    { path: "/admin-travel/bookings", element: <TravelBookingsAdmin /> },
    { path: "/add-travel-location", element: <ListTravelPage /> },
    { path: "/my-tour", element: <MyTourPage /> },
    { path: "/admin-tour/bookings", element: <AdminTourBookingPage /> },


    // Coupons
    { path: "/apply-coupon", element: <CouponPage /> },
    { path: "/apply-pms-coupon", element: <PmsCouponPage /> },
    { path: "/partner-coupon", element: <PartnerCouponPage /> },
    { path: "/user-coupon", element: <UserCouponPage /> },

    // Support & System
    { path: "/complaints", element: <ComplaintPage /> },
    { path: "/your-complaints", element: <PmsComplaintsPage /> },
    { path: "/change-banner", element: <BannerPage /> },
    { path: "/messenger", element: <MessengerPage /> },
    { path: "/send-notification-to-all", element: <NotificationPage /> },
  ];

  // Memoize the calculation of allowed paths to prevent re-computation on every render
  const allowedPaths = useMemo(
    () => new Set(extractPathsFromNavConfig(navConfig)),
    [navConfig]
  );

  // Filter routes based on permissions from navConfig
  // Routes with dynamic params (e.g., /:id) are always included
  const filteredRoutes = useMemo(
    () =>
      allAppRoutes.filter(
        (route) => allowedPaths.has(route.path) || route.path.includes(":")
      ),
    [allowedPaths, allAppRoutes]
  );

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
    {
      path: "login", // Correctly handles the root path
      element: <LoginPage />,
    },
    {
      path: "/",
      element: <Navigate to="/login" replace />, // Redirect root to login
    },
    {
      path: "404",
      element: <Page404 />,
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  if (isLoading) {
    return <LoaderProvider />;
  }

  return routes;
}

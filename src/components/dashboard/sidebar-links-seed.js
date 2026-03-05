const ADMIN_ROLES = ["Admin", "Developer", "superAdmin", "SuperAdmin"];
const PMS_ROLES = [...ADMIN_ROLES, "PMS"];
const TRAVEL_ROLES = [...ADMIN_ROLES, "TMS"];
const GENERAL_ROLES = [...PMS_ROLES, "TMS", "CA", "Rider"];

const uniqueRoles = (roles = []) => Array.from(new Set(roles.filter(Boolean)));

const roleMatches = (allowedRoles, role) => {
  if (!role) return true;

  const normalizedRole = normalizeRoleForSidebar(role);
  return uniqueRoles(allowedRoles).some(
    (allowedRole) => normalizeRoleForSidebar(allowedRole) === normalizedRole
  );
};

export const normalizeRoleForSidebar = (role) => {
  if (!role) return "";
  if (role === "superAdmin" || role === "SuperAdmin") return "Admin";
  return role;
};

export const SIDEBAR_ROUTE_DEFINITIONS = [
  { parentLink: "General", title: "Dashboard", path: "/dashboard", icon: "MdDashboard", roles: GENERAL_ROLES, order: 1 },
  { parentLink: "General", title: "Partners", path: "/user", icon: "MdPerson", roles: GENERAL_ROLES, order: 2 },
  { parentLink: "General", title: "Messenger", path: "/messenger", icon: "RiMessengerLine", roles: GENERAL_ROLES, order: 3 },

  { parentLink: "Bookings", title: "PMS Bookings", path: "/your-bookings", icon: "LocalActivityIcon", roles: PMS_ROLES, order: 4 },
  { parentLink: "Bookings", title: "Create Booking", path: "/booking-creation", icon: "AddTaskIcon", roles: PMS_ROLES, order: 5 },
  { parentLink: "Bookings", title: "Panel Booking", path: "/panel-booking", icon: "LocalActivityIcon", roles: PMS_ROLES, order: 6 },

  { parentLink: "Travel", title: "Add Car", path: "/add-a-car", icon: "CarCrashIcon", roles: TRAVEL_ROLES, order: 7 },
  { parentLink: "Travel", title: "Cars", path: "/your-cars", icon: "MdOutlineCarRental", roles: TRAVEL_ROLES, order: 8 },
  { parentLink: "Travel", title: "My Ride", path: "/your-car-details/owner-car", icon: "CarCrashIcon", roles: TRAVEL_ROLES, order: 9 },
  { parentLink: "Travel", title: "Add Owner", path: "/add-an-car-owner", icon: "GroupAddIcon", roles: TRAVEL_ROLES, order: 10 },
  { parentLink: "Travel", title: "Car Owner", path: "/cars-owner", icon: "FormatListNumberedIcon", roles: TRAVEL_ROLES, order: 11 },
  { parentLink: "Travel", title: "My Bookings", path: "/travel-bookings", icon: "LocalActivityIcon", roles: TRAVEL_ROLES, order: 12 },

  { parentLink: "Tours", title: "Add Tour", path: "/add-tour-data", icon: "AirportShuttleRoundedIcon", roles: TRAVEL_ROLES, order: 13 },
  { parentLink: "Tours", title: "My Tour", path: "/my-tour", icon: "TourIcon", roles: TRAVEL_ROLES, order: 14 },
  { parentLink: "Tours", title: "My Tour Booking", path: "/tour-bookings", icon: "LocalActivityIcon", roles: TRAVEL_ROLES, order: 15 },

  { parentLink: "PMS Hotels", title: "PMS Complaints", path: "/your-complaints", icon: "BsInfoSquare", roles: PMS_ROLES, order: 16 },
  { parentLink: "PMS Hotels", title: "Your Hotel", path: "/your-hotels", icon: "MdHotel", roles: PMS_ROLES, order: 17 },
  { parentLink: "PMS Hotels", title: "PMS Monthly Price", path: "/hotels/monthly-price-pms", icon: "FaDollarSign", roles: PMS_ROLES, order: 18 },
  { parentLink: "PMS Hotels", title: "PMS Coupons", path: "/apply-pms-coupon", icon: "RiCoupon3Line", roles: PMS_ROLES, order: 19 },

  { parentLink: "Admin Features", title: "Complaints", path: "/complaints", icon: "BsInfoSquare", roles: ADMIN_ROLES, order: 20 },
  { parentLink: "Admin Features", title: "Bookings", path: "/all-bookings", icon: "LocalActivityIcon", roles: ADMIN_ROLES, order: 21 },
  { parentLink: "Admin Features", title: "Travel Bookings", path: "/admin-travel/bookings", icon: "LocalActivityIcon", roles: ADMIN_ROLES, order: 22 },
  { parentLink: "Admin Features", title: "Availability", path: "/hotels/availability", icon: "SiTicktick", roles: ADMIN_ROLES, order: 23 },
  { parentLink: "Admin Features", title: "Set Month", path: "/hotels/monthly-price", icon: "FaDollarSign", roles: ADMIN_ROLES, order: 24 },
  { parentLink: "Admin Features", title: "Apply Coupons", path: "/apply-coupon", icon: "RiCoupon3Line", roles: ADMIN_ROLES, order: 25 },
  { parentLink: "Admin Features", title: "Hotels", path: "/hotels", icon: "MdHotel", roles: ADMIN_ROLES, order: 26 },
  { parentLink: "Admin Features", title: "Reviews", path: "/all-reviews", icon: "VscFeedback", roles: ADMIN_ROLES, order: 27 },
  { parentLink: "Admin Features", title: "Manage Users", path: "/all-users", icon: "FaRegUserCircle", roles: ADMIN_ROLES, order: 28 },
  { parentLink: "Admin Features", title: "Add Travel Location", path: "/add-travel-location", icon: "AirplaneTicketIcon", roles: ADMIN_ROLES, order: 29 },
  { parentLink: "Admin Features", title: "Change Banner", path: "/change-banner", icon: "CiImageOn", roles: ADMIN_ROLES, order: 30 },
  { parentLink: "Admin Features", title: "Push Notification", path: "/send-notification-to-all", icon: "CiBellOn", roles: ADMIN_ROLES, order: 31 },
  { parentLink: "Admin Features", title: "GST", path: "/gst-page", icon: "MdSettings", roles: ADMIN_ROLES, order: 32 },
  { parentLink: "Admin Features", title: "Additional Fields", path: "/additional-fields", icon: "MdSettings", roles: ADMIN_ROLES, order: 33 },
  { parentLink: "Admin Features", title: "Bulk Operation", path: "/bulk-data-processing", icon: "MdSettings", roles: ADMIN_ROLES, order: 34 },
  { parentLink: "Admin Features", title: "Bulk Hotel", path: "/bulk-hotel-import", icon: "MdSettings", roles: ADMIN_ROLES, order: 35 },
  { parentLink: "Admin Features", title: "Tour List", path: "/tour-list", icon: "TourIcon", roles: ADMIN_ROLES, order: 36 },
  { parentLink: "Admin Features", title: "Tour Requests", path: "/tour-requests", icon: "AirplaneTicketIcon", roles: ADMIN_ROLES, order: 37 },
  { parentLink: "Admin Features", title: "Tour Bookings", path: "/admin-tour/bookings", icon: "LocalActivityIcon", roles: ADMIN_ROLES, order: 38 },
  { parentLink: "Admin Features", title: "Add Menu Item", path: "/add-menu-item", icon: "MdMenu", roles: ADMIN_ROLES, order: 39 },
];

export const SIDEBAR_LINK_SEED_DATA = SIDEBAR_ROUTE_DEFINITIONS.map(
  ({ parentLink, path, icon, roles, order }) => ({
    parentLink,
    childLink: path,
    isParentOnly: false,
    icon,
    status: "active",
    role: uniqueRoles(roles),
    order,
  })
);

export const getRoleBasedFallbackSidebar = (role) =>
  SIDEBAR_ROUTE_DEFINITIONS.filter((item) => roleMatches(item.roles, role)).map(
    ({ parentLink, title, path, icon, order }) => ({ parentLink, title, path, icon, order })
  );

import AddTaskIcon from "@mui/icons-material/AddTask";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import AirportShuttleRoundedIcon from "@mui/icons-material/AirportShuttleRounded";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import TourIcon from "@mui/icons-material/Tour";
import axios from "axios";
import { BsInfoSquare } from "react-icons/bs";
import { CiBellOn, CiImageOn } from "react-icons/ci";
import { FaDollarSign, FaRegUserCircle } from "react-icons/fa";
import {
  MdDashboard,
  MdHotel,
  MdOutlineAdminPanelSettings,
  MdOutlineCarRental,
  MdPerson,
  MdSettings,
} from "react-icons/md";
import { RiCoupon3Line, RiMessengerLine } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { VscFeedback } from "react-icons/vsc";
import { localUrl, token, userId } from "../../../utils/util";

// Reusable Icon Component for consistency
const IconStyle = { width: "24px", height: "24px" };

// Define icons
const icons = {
  dashboard: <MdDashboard style={IconStyle} />,
  messenger: <RiMessengerLine style={IconStyle} />,
  partners: <MdPerson style={IconStyle} />,
  bookings: <LocalActivityIcon style={IconStyle} />,
  addBooking: <AddTaskIcon style={IconStyle} />,
  hotels: <MdHotel style={IconStyle} />,
  travel: <AirplaneTicketIcon style={IconStyle} />,
  settings: <MdSettings style={IconStyle} />,
  complaints: <BsInfoSquare style={IconStyle} />,
  banner: <CiImageOn style={IconStyle} />,
  review: <VscFeedback style={IconStyle} />,
  notification: <CiBellOn style={IconStyle} />,
  coupon: <RiCoupon3Line style={IconStyle} />,
  admin: <MdOutlineAdminPanelSettings style={IconStyle} />,
  available: <SiTicktick style={IconStyle} />,
  user: <FaRegUserCircle style={IconStyle} />,
  car: <MdOutlineCarRental style={IconStyle} />,
  addCar: <CarCrashIcon style={IconStyle} />,
  tour: <TourIcon style={IconStyle} />,
  addTour: <AirportShuttleRoundedIcon style={IconStyle} />,
  ownerList: <FormatListNumberedIcon style={IconStyle} />,
  owner: <GroupAddIcon style={IconStyle} />,
  setMonthlyPrice: <FaDollarSign style={IconStyle} />,
};

// Function to get menu items
const fetchMenuItems = async () => {
  try {
    if (userId) {
      const response = await axios.get(
        `${localUrl}/login/dashboard/get/all/user/${userId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      sessionStorage.setItem(
        "auth_items",
        JSON.stringify(response.data.menuItems)
      );

      const items = response.data.menuItems;
      if (!Array.isArray(items)) return [];
      return items
        .filter((item) => item && typeof item.title === "string")
        .map((item) => item.title.toLowerCase());
    }
  } catch (error) {
    console.error(
      "Error fetching menu items:",
      error?.response?.data || error.message
    );
    return [];
  }
};

// Function to get nav config
const getNavConfig = async () => {
  const availableMenuItems = await fetchMenuItems();
  const baseConfig = [
    {
      title: "dashboard",
      path: "/dashboard",
      icon: icons.dashboard,
    },
    {
      title: "partners",
      path: "/user",
      icon: icons.partners,
    },
    {
      title: "Messenger",
      path: "/messenger",
      icon: icons.messenger,
    },
    {
      title: "PMS Bookings",
      icon: icons.bookings,
      path: "/your-bookings",
    },
    {
      title: "Create Booking",
      icon: icons.addBooking,
      path: "/booking-creation",
    },

    { title: "Panel Booking", path: "/panel-booking", icon: icons.bookings },

    {
      title: "travel",
      icon: icons.travel,
      children: [
        { title: "Add Car", path: "/add-a-car", icon: icons.addCar },
        { title: "Cars", path: "/your-cars", icon: icons.car },
        {
          title: "My Ride",
          path: "/your-car-details/owner-car",
          icon: icons.addCar,
        },
        { title: "Add Owner", path: "/add-an-car-owner", icon: icons.owner },
        { title: "Car Owner", path: "/cars-owner", icon: icons.ownerList },
        {
          title: "My Bookings",
          path: "/travel-bookings",
          icon: icons.bookings,
        },
      ],
    },
    {
      title: "tour",
      icon: icons.tour,
      children: [
        { title: "Add Tour", path: "/add-tour-data", icon: icons.addTour },
        { title: "My Tour", path: "/my-tour", icon: icons.tour },
        { title: "My Tour Booking", path: "/tour-bookings", icon: icons.bookings },
      ],
    },
    {
      title: "Hotels",
      icon: icons.hotels,
      children: [
        {
          title: "PMS Complaints",
          path: "/your-complaints",
          icon: icons.complaints,
        },
        { title: "Your Hotel", icon: icons.hotels, path: "/your-hotels" },
        {
          title: "PMS Monthly Price",
          icon: icons.setMonthlyPrice,
          path: "/hotels/monthly-price-pms",
        },
        { title: "PMS Coupons", path: "/apply-pms-coupon", icon: icons.coupon },
      ],
    },
    {
      title: "Advanced features",
      icon: icons.admin,
      children: [
        { title: "Complaints", path: "/complaints", icon: icons.complaints },
        { title: "Bookings", icon: icons.bookings, path: "/all-bookings" },
        {
          title: "Travel Bookings",
          path: "/admin-travel/bookings",
          icon: icons.bookings,
        },
        {
          title: "Availability",
          path: "/hotels/availability",
          icon: icons.available,
        },
        {
          title: "Set Month",
          path: "/hotels/monthly-price",
          icon: icons.setMonthlyPrice,
        },
        {
          title: "Apply Coupons (Single Use)",
          path: "/apply-coupon",
          icon: icons.coupon,
        },
        {
          title: "Partner Coupon",
          path: "/partner-coupon",
          icon: icons.coupon,
        },
        { title: "User Coupon", path: "/user-coupon", icon: icons.coupon },
        { title: "Hotels", icon: icons.hotels, path: "/hotels" },
        { title: "Reviews", path: "/all-reviews", icon: icons.review },
        { title: "Manage users", path: "/all-users", icon: icons.user },
        {
          title: "Add travel location",
          path: "/add-travel-location",
          icon: icons.travel,
        },
        { title: "Change banner", path: "/change-banner", icon: icons.banner },
        {
          title: "Push notification",
          path: "/send-notification-to-all",
          icon: icons.notification,
        },
        { title: "GST", path: "/gst-page", icon: icons.settings },
        {
          title: "Additional Fields",
          path: "/additional-fields",
          icon: icons.settings,
        },
        {
          title: "Bulk Operation",
          path: "/bulk-data-processing",
          icon: icons.settings,
        },
        {
          title: "Bulk Hotel",
          path: "/bulk-hotel-import",
          icon: icons.settings,
        },
        { title: "Tour List", path: "/tour-list", icon: icons.tour },

        { title: "Tour Requests", path: "/tour-requests", icon: icons.travel },
        { title: "Tour Bookings", path: "/admin-tour/bookings", icon: icons.bookings },
      ],
    },
  ];

  return baseConfig.filter((item) => {
    const isParentVisible = availableMenuItems.includes(
      item.title.toLowerCase()
    );
    if (isParentVisible) return true;

    if (item.children) {
      const matchingChildren = item.children.filter((child) =>
        availableMenuItems.includes(child.title.toLowerCase())
      );
      if (matchingChildren.length > 0) {
        item.children = matchingChildren;
        return true;
      }
    }
    return false;
  });
};

// Export the function to fetch the nav config
export const fetchNavConfig = async () => {
  return await getNavConfig();
};

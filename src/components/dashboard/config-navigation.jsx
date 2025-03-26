import axios from 'axios';
import { SiTicktick } from 'react-icons/si';
import { BsInfoSquare } from 'react-icons/bs';
import { VscFeedback } from 'react-icons/vsc';
import { CiBellOn, CiImageOn } from 'react-icons/ci';
import { FaDollarSign, FaRegUserCircle } from 'react-icons/fa';
import { RiCoupon3Line, RiMessengerLine } from 'react-icons/ri';
import { MdHotel, MdPerson, MdSettings, MdDashboard, MdOutlineAdminPanelSettings } from 'react-icons/md';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CarCrashIcon from '@mui/icons-material/CarCrash';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { MdOutlineCarRental } from 'react-icons/md';
import { userId, localUrl, token } from '../../../utils/util';

// Define your icons
const icons = {
    dashboard: <MdDashboard style={{ width: '24px', height: '24px' }} />,
    messenger: <RiMessengerLine style={{ width: '24px', height: '24px' }} />,
    partners: <MdPerson style={{ width: '24px', height: '24px' }} />,
    bookings: <LocalActivityIcon style={{ width: '24px', height: '24px' }} />,
    addBooking: <AddTaskIcon style={{ width: '24px', height: '24px' }} />,
    hotels: <MdHotel style={{ width: '24px', height: '24px' }} />,
    travel: <AirplaneTicketIcon style={{ width: '24px', height: '24px' }} />,
    settings: <MdSettings style={{ width: '24px', height: '24px' }} />,
    complaints: <BsInfoSquare style={{ width: '24px', height: '24px' }} />,
    banner: <CiImageOn style={{ width: '24px', height: '24px' }} />,
    review: <VscFeedback style={{ width: '24px', height: '24px' }} />,
    notification: <CiBellOn style={{ width: '24px', height: '24px' }} />,
    coupon: <RiCoupon3Line style={{ width: '24px', height: '24px' }} />,
    admin: <MdOutlineAdminPanelSettings style={{ width: '24px', height: '24px' }} />,
    available: <SiTicktick style={{ width: '24px', height: '24px' }} />,
    user: <FaRegUserCircle style={{ width: '24px', height: '24px' }} />,
    car: <MdOutlineCarRental style={{ width: '24px', height: '24px' }} />,
    addCar: <CarCrashIcon style={{ width: '24px', height: '24px' }} />,
    ownerList: <FormatListNumberedIcon style={{ width: '24px', height: '24px' }} />,
    owner: <GroupAddIcon style={{ width: '24px', height: '24px' }} />,
    setMonthlyPrice: <FaDollarSign style={{ width: '24px', height: '24px' }} />,
};

// Function to get menu items
const menuItems = async () => {
    const response = await axios.get(`${localUrl}/login/dashboard/get/all/user/${userId}`, {
        headers: {
            Authorization: token,
        },
    });
    return response.data.menuItems.map((item) => item.toLowerCase());
};

// Function to get nav config
const getNavConfig = async () => {
    const availableMenuItems = await menuItems();

    const baseConfig = [
        {
            title: 'dashboard',
            path: '/dashboard',
            icon: icons.dashboard,
        },
        {
            title: 'partners',
            path: '/user',
            icon: icons.partners,
        },
        {
            title: 'Messenger',
            path: '/messenger',

            icon: icons.messenger,
        },

        {
            title: 'bookings',
            icon: icons.bookings,
            path: '/your-bookings',
        },
        {
            title: 'Create Booking',
            icon: icons.addBooking,
            path: '/booking-creation',
        },
        {
            title: 'travel',
            icon: icons.travel,
            children: [
                {
                    title: 'Add Car',
                    path: '/add-a-car',
                    icon: icons.addCar,
                },
                {
                    title: 'Cars',
                    path: '/your-cars',
                    icon: icons.car,
                },
                {
                    title: 'My Ride',
                    path: '/your-car-details/owner-car',
                    icon: icons.addCar,
                },

                {
                    title: 'Add Owner',
                    path: '/add-an-car-owner',
                    icon: icons.owner,
                },
                {
                    title: 'Car Owner',
                    path: '/cars-owner',
                    icon: icons.ownerList,
                },
            ],
        },
        {
            title: 'Hotels',
            icon: icons.hotels,
            children: [
                {
                    title: 'Complaints',
                    path: '/your-complaints',
                    icon: icons.complaints,
                },
                {
                    title: 'Your Hotel',
                    icon: icons.hotels,
                    path: '/your-hotels',
                },
                {
                    title: 'Set Monthly Price',
                    icon: icons.setMonthlyPrice,
                    path: '/hotels/monthly-price',
                },
                {
                    title: 'Manage Coupons',
                    path: '/apply-pms-coupon',
                    icon: icons.coupon,
                },
            ],
        },

        {
            title: 'Admin features',
            icon: icons.admin,
            children: [
                {
                    title: 'Complaints',
                    path: '/complaints',
                    icon: icons.complaints,
                },
                {
                    title: 'Bookings',
                    icon: icons.bookings,
                    path: '/all-bookings',
                },

                {
                    title: 'Hotels',
                    icon: icons.hotels,
                    path: '/hotels',
                },
                {
                    title: 'Reviews',
                    path: '/all-reviews',
                    icon: icons.review,
                },
                {
                    title: 'Manage users',
                    path: '/all-users',
                    icon: icons.user,
                },
                {
                    title: 'Bulk Operation',
                    path: '/bulk-data-processing',
                    icon: icons.settings,
                },
                {
                    title: 'Add travel location',
                    path: '/add-travel-location',
                    icon: icons.travel,
                },
                {
                    title: 'Availability',
                    path: '/hotels/availability',
                    icon: icons.available,
                },
                {
                    title: 'Set Month',
                    path: '/hotels/monthly-price',
                    icon: icons.setMonthlyPrice,
                },
                {
                    title: 'Change banner',
                    path: '/change-banner',
                    icon: icons.banner,
                },
                {
                    title: 'Apply Coupons (Single Use)',
                    path: '/apply-coupon',
                    icon: icons.coupon,
                },
                {
                    title: 'Push notification',
                    path: '/send-notification-to-all',
                    icon: icons.notification,
                },
            ],
        },
    ];

    return baseConfig.filter((item) => {
        const isParentVisible = availableMenuItems.includes(item.title.toLowerCase());

        if (isParentVisible) {
            return true; // Show parent if it matches
        }

        // Check for children matches
        if (item.children) {
            const matchingChildren = item.children.filter((child) => availableMenuItems.includes(child.title.toLowerCase()));

            if (matchingChildren.length > 0) {
                item.children = matchingChildren; // Keep only matching children
                return true; // Show parent if it has any matching children
            }
        }

        return false; // Exclude if no matches
    });
};

// Export the function to fetch the nav config
export const fetchNavConfig = async () => {
    return await getNavConfig();
};

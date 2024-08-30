import { FaDollarSign, FaRegUserCircle } from 'react-icons/fa'; // Example import for FaDollarSign from 'react-icons/fa'
import {
  MdEvent,
  MdHotel,
  MdPerson,
  MdSettings,
  MdDashboard,
  MdOutlineTravelExplore,
  MdOutlineAdminPanelSettings,
} from 'react-icons/md'; // Ensure these are correct
import { CiImageOn } from 'react-icons/ci';
import { BsInfoSquare } from 'react-icons/bs';
import { VscFeedback } from 'react-icons/vsc';
import { RiCoupon3Line } from 'react-icons/ri';
// Define icon mappings
const icons = {
  dashboard: <MdDashboard style={{ width: '24px', height: '24px' }} />,
  partners: <MdPerson style={{ width: '24px', height: '24px' }} />,
  bookings: <MdEvent style={{ width: '24px', height: '24px' }} />,
  hotels: <MdHotel style={{ width: '24px', height: '24px' }} />,
  travel: <MdOutlineTravelExplore style={{ width: '24px', height: '24px' }} />,
  settings: <MdSettings style={{ width: '24px', height: '24px' }} />,
  complaints: <BsInfoSquare style={{ width: '24px', height: '24px' }} />,
  banner: <CiImageOn style={{ width: '24px', height: '24px' }} />,
  review: <VscFeedback style={{ width: '24px', height: '24px' }} />,
  coupon: <RiCoupon3Line style={{ width: '24px', height: '24px' }} />,
  admin: <MdOutlineAdminPanelSettings style={{ width: '24px', height: '24px' }} />,
  user: <FaRegUserCircle style={{ width: '24px', height: '24px' }} />,
  setMonthlyPrice: <FaDollarSign style={{ width: '24px', height: '24px' }} />,
};

const role = localStorage.getItem('user_role');

const getNavConfig = () => {
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
      title: 'bookings',
      icon: icons.bookings,
      children: [
        {
          title: 'Bookings',
          icon: icons.bookings,
          path: '/all-bookings',
        },
        {
          title: 'Your Bookings',
          icon: icons.bookings,
          path: '/your-bookings',
        },
      ],
    },
    {
      title: 'Hotels',
      icon: icons.hotels,
      children: [
        {
          title: 'Hotels',
          icon: icons.hotels,
          path: '/hotels',
        },
        {
          title: 'Your Hotel',
          icon: icons.hotels,
          path: '/your-hotels',
        },
        {
          title: 'Set Monthly Price',
          icon: icons.setMonthlyPrice, // Use the React Icon
          path: '/hotels/monthly-price',
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
          title: 'Add travel location',
          path: '/add-travel-location',
          icon: icons.travel,
        },
        {
          title: 'Change banner',
          path: '/change-banner',
          icon: icons.banner,
        },
        {
          title: 'Manage Coupons',
          path: '/apply-coupon',
          icon: icons.coupon,
        },
      ],
    },
  ];

  const Adminconfig = [''];
  const superAdminConfig = ['Bookings', 'partners', 'Admin features'];
  const AdminChildConfig = ['Your Hotel', 'Your Bookings'];
  const superAdminChildConfig = ['Hotels', 'Bookings'];

  if (role === 'admin') {
    return baseConfig.filter((item) => {
      if (Adminconfig.includes(item.title)) {
        return false;
      }
      if (item.children) {
        item.children = item.children.filter((child) => !AdminChildConfig.includes(child.title));
      }
      return true;
    });
  }
  if (role === 'superAdmin') {
    return baseConfig.filter((item) => {
      if (superAdminConfig.includes(item.title)) {
        return false;
      }
      if (item.children) {
        item.children = item.children.filter(
          (child) => !superAdminChildConfig.includes(child.title)
        );
      }
      return true;
    });
  }

  return baseConfig;
};

const navConfig = getNavConfig();

export default navConfig;

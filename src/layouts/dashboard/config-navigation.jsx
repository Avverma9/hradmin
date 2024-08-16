import { FaDollarSign } from 'react-icons/fa'; // Example import for FaDollarSign from 'react-icons/fa'
import { MdEvent, MdHotel, MdPerson, MdSettings, MdDashboard } from 'react-icons/md'; // Ensure these are correct
import { ImBlogger } from 'react-icons/im';
// Define icon mappings
const icons = {
  dashboard: <MdDashboard style={{ width: '24px', height: '24px' }} />,
  partners: <MdPerson style={{ width: '24px', height: '24px' }} />,
  bookings: <MdEvent style={{ width: '24px', height: '24px' }} />,
  hotels: <MdHotel style={{ width: '24px', height: '24px' }} />,
  blog: <ImBlogger style={{ width: '24px', height: '24px' }} />,
  settings: <MdSettings style={{ width: '24px', height: '24px' }} />,
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
      title: 'blog',
      path: '/blog',
      icon: icons.blog,
      children: [
        {
          title: 'All Posts',
          path: '/blog/all',
        },
        {
          title: 'Add Post',
          path: '/blog/add',
        },
      ],
    },
    {
      title: 'Site Settings',
      icon: icons.settings,
      children: [
        {
          title: 'Add travel location',
          path: '/add-travel-location',
          icon: icons.settings,
        },
        {
          title: 'Change banner',
          path: '/change-banner',
          icon: icons.settings,
        },
      ],
    },
  ];

  const Adminconfig = [''];
  const superAdminConfig = ['Bookings', 'partners', 'Site Settings'];
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

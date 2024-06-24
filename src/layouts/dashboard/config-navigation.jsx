import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}`} sx={{ width: 1, height: 1 }} />
);

const role = localStorage.getItem('user_role');

const getNavConfig = () => {
  const baseConfig = [
    {
      title: 'dashboard',
      path: '/',
      icon: icon('logo.png'),
    },
    {
      title: 'partners',
      path: '/user',
      icon: icon('ic_user.svg'),
    },
    {
      title: 'Hotels',
      icon: icon('ic_cart.svg'),
      children: [
        {
          title: 'All Hotels',
          path: '/hotels',
        },
        {
          title: 'Your Hotel',
          path: '/hotels/list',
        },
        {
          title: 'Add Hotel',
          path: '/hotels/add',
        },
      ],
    },
    {
      title: 'blog',
      path: '/blog',
      icon: icon('ic_blog.svg'),
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
      icon: icon('settings-svgrepo-com.svg'),
      children: [
        {
          title: 'Add travel location',
          path: '/add-travel-location',
          icon: icon('add-square-svgrepo-com.svg'),
        },
        {
          title: 'Change banner',
          path: '/change-banner',
          icon: icon('sync-svgrepo-com.svg'),
        },
      ],
    },
  ];

  // Define the titles to filter out for the admin role
  const Adminconfig = ['partners', 'Site Settings'];
  const AdminChildConfig = ['All Hotels']; // Define child items to filter out for the admin role
  // const superAdminConfig = [''];
  const superAdminChildConfig = ['Your Hotel'];
  if (role === 'admin') {
    return baseConfig.filter((item) => {
      // Filter top-level config
      if (Adminconfig.includes(item.title)) {
        return false;
      }
      // Filter children if they exist
      if (item.children) {
        item.children = item.children.filter((child) => !AdminChildConfig.includes(child.title));
      }
      return true;
    });
  }
  if (role === 'superAdmin') {
    return baseConfig.filter((item) => {
      // Filter top-level config
      // if (superAdminConfig.includes(item.title)) {
      //   return false;
      // }
      // Filter children if they exist
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

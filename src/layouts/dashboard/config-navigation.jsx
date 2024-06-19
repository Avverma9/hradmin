import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
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
    title: 'login',
    path: '/login',
    icon: icon('ic_lock.svg'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic_disabled.svg'),
  },
];

export default navConfig;

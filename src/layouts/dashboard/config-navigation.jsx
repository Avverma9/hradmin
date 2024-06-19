import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'partners',
    path: '/user',
    icon: icon('ic_user'),
  },
  {
    title: 'Hotels',
    icon: icon('ic_cart'),
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
    icon: icon('ic_blog'),
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
    icon: icon('ic_lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic_disabled'),
  },
];

export default navConfig;

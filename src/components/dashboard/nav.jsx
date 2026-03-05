/* eslint-disable react/self-closing-comp */
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import { NAV } from './config-layout';


import { useResponsive } from 'src/hooks/use-responsive';


// import Logo from 'src/components/logo';
// import Iconify from 'src/components/iconify';

import { usePathname } from '../routes/hooks';
import { fetchNavConfig } from './config-navigation';
import { account } from '../stuff/_mock/account';
import Scrollbar from '../stuff/scrollbar';
import Logo from '../stuff/logo';
import Iconify from '../stuff/iconify';
import { RouterLink } from '../routes/components';

// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');

  const userImage = sessionStorage.getItem('user_image');
  const userName = sessionStorage.getItem('user_name');
  const userRole = sessionStorage.getItem('user_role');

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const displayName = capitalizeFirstLetter(
    userRole === 'superAdmin' ? 'Super Admin' : userRole || account.displayName
  );

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Avatar src={userImage || account.photoURL} alt="photoURL" />

      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2">{userName || account.displayName}</Typography>
        <Typography variant="subtitle2">{displayName}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {account.role}
        </Typography>
      </Box>
    </Box>
  );

  const [navConfig, setNavConfig] = useState([]);

  useEffect(() => {
    const loadNavConfig = async () => {
      const config = await fetchNavConfig();
      setNavConfig(config);
    };

    loadNavConfig();
  }, []);

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {navConfig.map((item) => (
        <NavItem key={item.path || item.title} item={item} />
      ))}
    </Stack>
  );

  const renderUpgrade = <Box sx={{ px: 2.5, pb: 3, mt: 10 }}></Box>;

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ mt: 3, ml: 4 }} />

      {renderAccount}

      {renderMenu}

      <Box sx={{ flexGrow: 1 }} />

      {renderUpgrade}
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isNavigable = Boolean(item.path && String(item.path).startsWith('/'));
  const active =
    (isNavigable && item.path === pathname) ||
    (hasChildren && item.children.some((child) => child.path === pathname));

  useEffect(() => {
    if (hasChildren && item.children.some((child) => child.path === pathname)) {
      setOpen(true);
    }
  }, [hasChildren, item.children, pathname]);

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    }
  };

  return (
    <>
      <ListItemButton
        component={hasChildren || !isNavigable ? 'button' : RouterLink}
        href={!hasChildren && isNavigable ? item.path : undefined}
        onClick={hasChildren ? handleClick : undefined}
        disabled={!hasChildren && !isNavigable}
        sx={{
          minHeight: 44,
          borderRadius: 0.75,
          typography: 'body2',
          color: 'text.secondary',
          textTransform: 'capitalize',
          fontWeight: 'fontWeightMedium',
          ...(active && {
            color: 'primary.main',
            fontWeight: 'fontWeightSemiBold',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
            },
          }),
        }}
      >
        <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
          {item.icon}
        </Box>
        <Box component="span" sx={{ flexGrow: 1 }}>
          {item.title}
        </Box>
        {hasChildren && (
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            width={16}
            height={16}
          />
        )}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Stack component="nav" spacing={0.5} sx={{ pl: 4 }}>
            {item.children.map((child) => (
              <ListItemButton
                key={child.path || child.title}
                component={RouterLink}
                href={child.path}
                sx={{
                  minHeight: 32,
                  borderRadius: 0.75,
                  typography: 'body2',
                  color: 'text.secondary',
                  textTransform: 'capitalize',
                  fontWeight: 'fontWeightMedium',
                  ...(child.path === pathname && {
                    color: 'primary.main',
                    fontWeight: 'fontWeightSemiBold',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                    },
                  }),
                }}
              >
                <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
                  {child.icon}
                </Box>
                <Box component="span">{child.title}</Box>
              </ListItemButton>
            ))}
          </Stack>
        </Collapse>
      )}
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
};
/* eslint-disable react/self-closing-comp */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

import Iconify from '../../../components/stuff/iconify';
import { bgBlur } from '../../../../theme/css';
import { fetchNavConfig } from '../config-navigation';

// ----------------------------------------------------------------------

const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const StyledSearchbar = styled('div')(({ theme }) => ({
  ...bgBlur({
    color: theme.palette.background.default,
  }),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: HEADER_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {
  const [open, setOpen] = useState(false);
  const [navItems, setNavItems] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Recursive function to flatten nav tree
  const flattenNav = (items) => {
    let flat = [];
    for (const item of items) {
      if (item.path && item.title) {
        flat.push({ title: item.title, path: item.path });
      }
      if (item.children) {
        flat = [...flat, ...flattenNav(item.children)];
      }
    }
    return flat;
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchNavConfig(); // Make sure this returns nav config
        const flat = flattenNav(config);
        setNavItems(flat);
      } catch (error) {
        console.error('Failed to fetch nav config:', error);
      }
    };

    loadConfig();
  }, []);

  const handleSelect = (event, selected) => {
    if (selected?.path) {
      navigate(selected.path);
      handleClose();
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <IconButton onClick={handleOpen}>
            <Iconify icon="eva:search-fill" />
          </IconButton>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <StyledSearchbar>
            <Autocomplete
              fullWidth
              options={navItems}
              getOptionLabel={(option) => option.title}
              onInputChange={(e, newInputValue) => setSearchInput(newInputValue)}
              inputValue={searchInput}
              onChange={handleSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  placeholder="Search..."
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    startAdornment: (
                      <Iconify
                        icon="eva:search-fill"
                        sx={{ color: 'text.disabled', width: 20, height: 20, mr: 1 }}
                      />
                    ),
                  }}
                  sx={{ fontWeight: 'fontWeightBold' }}
                />
              )}
            />
          </StyledSearchbar>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}

import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from '../../components/stuff/iconify/iconify';

// ----------------------------------------------------------------------

export default function UserTableToolbar({
  numSelected,
  filterName,
  filterCity,
  filterRole,
  onFilterName,
  onFilterCity,
  onFilterRole,
  onExport,
  onDelete,
  onClearFilters,
  onTriggerSearch,
}) {
  const [showFilters, setShowFilters] = useState(false);

  // Options for dropdowns
  const roleOptions = ['Admin', 'PMS', 'TMS', 'CA', 'Rider'];
  const cityOptions = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Pune', 'Hyderabad'];

  const handleEnterPress = (event) => {
    if (event.key === 'Enter') {
      onTriggerSearch();
    }
  };

  return (
    <div>
      <Toolbar
        sx={{
          height: 96,
          display: 'flex',
          justifyContent: 'space-between',
          p: (theme) => theme.spacing(0, 1, 0, 3),
          ...(numSelected > 0 && {
            color: 'primary.main',
            bgcolor: 'primary.lighter',
            borderRadius: 1.5,
            m: (theme) => theme.spacing(0, 1),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography component="div" variant="subtitle1" sx={{ flexGrow: 1 }}>
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Partners
          </Typography>
        )}

        {numSelected > 0 ? (
          <Box>
            <Tooltip title="Export selected">
              <IconButton onClick={onExport}>
                <Iconify icon="eva:download-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={onDelete}>
                <Iconify icon="eva:trash-2-fill" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box>
            <Tooltip title="Export to Excel">
              <IconButton onClick={onExport}>
                <Iconify icon="eva:download-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter list">
              <IconButton onClick={() => setShowFilters((prev) => !prev)}>
                <Iconify icon="ic:round-filter-list" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            mx: { xs: 1, md: 2 },
            mb: 2,
            bgcolor: 'background.neutral',
            borderRadius: 1.5,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by Name, Email, Mobile"
                value={filterName}
                onChange={onFilterName}
                onKeyDown={handleEnterPress}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select // Changed to a dropdown
                label="City"
                value={filterCity}
                onChange={onFilterCity}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Cities</MenuItem>
                {cityOptions.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Role"
                value={filterRole}
                onChange={onFilterRole}
                select
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Roles</MenuItem>
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={onClearFilters}
                startIcon={<Iconify icon="ic:round-clear" />}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </div>
  );
}

UserTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  filterCity: PropTypes.string,
  filterRole: PropTypes.string,
  onFilterName: PropTypes.func,
  onFilterCity: PropTypes.func,
  onFilterRole: PropTypes.func,
  onExport: PropTypes.func,
  onDelete: PropTypes.func,
  onClearFilters: PropTypes.func,
  onTriggerSearch: PropTypes.func,
};
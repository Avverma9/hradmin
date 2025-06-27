import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  TextField,
  Box,
  IconButton,
  Button,
  Tooltip,
  Container,
  Typography,
  Paper,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Search, Clear, Edit, Add } from '@mui/icons-material';
import { tourList } from '../redux/reducers/tour/tour';
import { iconsList } from '../../../utils/icon';
import { useLoader } from '../../../utils/loader';

const TourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data = [], loading } = useSelector((state) => state.tour);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(tourList());
  }, [dispatch]);

  const getAmenityIcon = (amenity) => {
    const iconObj = iconsList.find(
      (icon) => icon.label.toLowerCase() === amenity.toLowerCase()
    );
    return iconObj ? React.cloneElement(iconObj.icon, { sx: { fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }}) : null;
  };

  const handleUpdate = (id) => {
    navigate(`/tour-update/${id}`);
  };

  const handleAddNew = () => {
    navigate('/add-tour-data'); // Assuming this is the route to add a new tour
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 20 },
    { field: 'travelAgencyName', headerName: 'Agency Name', width: 150 },
    { field: 'nights', headerName: 'Nights', width: 70, align: 'center', headerAlign: 'center' },
    { field: 'days', headerName: 'Days', width: 50, align: 'center', headerAlign: 'center' },
    { 
        field: 'price', 
        headerName: 'Price', 
        width: 120,
        renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}`
    },
    {
      field: 'amenities',
      headerName: 'Amenities',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.value?.slice(0, 3).map((amenity, idx) => (
            <span key={idx} style={{ marginRight: '8px' }}>
              {getAmenityIcon(amenity)}
              <Typography variant="caption" sx={{ verticalAlign: 'middle' }}>{amenity}</Typography>
            </span>
          ))}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="Edit this tour">
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Edit />}
            onClick={() => handleUpdate(params.row._id)}
          >
            View & Update
          </Button>
        </Tooltip>
      ),
    },
  ];

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredData = Array.isArray(data) ? data.filter((pkg) =>
    Object.values(pkg).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  ) : [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">Tour Packages</Typography>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNew}
            >
                Add New Tour
            </Button>
        </Box>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                 <TextField
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search tours..."
                    InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                    endAdornment: (
                      <IconButton
                        onClick={() => setSearchText("")}
                        style={{ visibility: searchText ? "visible" : "hidden" }}
                        size="small"
                      >
                        <Clear />
                      </IconButton>
                    ),
                  }}
                />
            </Box>

            <Box sx={{ height: 650, width: "100%" }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row._id}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    slots={{
                        toolbar: GridToolbar,
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'grey.100',
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Box>
        </Paper>
    </Container>
  );
};

export default TourList;

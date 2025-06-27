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
  Chip,
} from '@mui/material';
import { Search, Clear, Edit, Add, FlightTakeoff } from '@mui/icons-material';
import { tourRequest } from 'src/components/redux/reducers/tour/tour';

const TourRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data = [], loading } = useSelector((state) => state.tour);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(tourRequest());
  }, [dispatch]);

  const handleUpdate = (id) => {
    navigate(`/tour-update/${id}`);
  };

  const handleAddNew = () => {
    navigate('/add-tour-data'); // Navigate to the page for adding a new tour
  };

  const columns = [
    { field: 'travelAgencyName', headerName: 'Agency Name', width: 220 },
    { field: 'nights', headerName: 'Nights', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'days', headerName: 'Days', width: 80, align: 'center', headerAlign: 'center' },
    {
      field: 'price',
      headerName: 'Price',
      width: 80,
      renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}`,
    },
    {
      field: 'isAccepted',
      headerName: 'Status',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Accepted' : 'Not Accepted'}
          color={params.value ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
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
            <Typography variant="h4" fontWeight="bold">
                <FlightTakeoff sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tour Requests
            </Typography>
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
                    placeholder="Search requests..."
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

export default TourRequest;

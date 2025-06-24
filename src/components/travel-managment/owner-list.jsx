import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import {
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Container,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Close, Download, Visibility, Search } from '@mui/icons-material';
import { getAllOwner } from '../redux/reducers/travel/carOwner';

const OwnerList = () => {
  const dispatch = useDispatch();
  const { data: owners = [], loading } = useSelector((state) => state.owner);
  
  const [selectedDlImage, setSelectedDlImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwners, setFilteredOwners] = useState([]);

  useEffect(() => {
    dispatch(getAllOwner());
  }, [dispatch]);

  useEffect(() => {
    const ownersArray = Array.isArray(owners) ? owners : [];
    if (searchQuery.trim() === '') {
      setFilteredOwners(ownersArray);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredOwners(
        ownersArray.filter(
          (owner) =>
            owner?.mobile?.toString().toLowerCase().includes(lowercasedQuery) ||
            owner?.dl?.toString().toLowerCase().includes(lowercasedQuery)
        )
      );
    }
  }, [searchQuery, owners]);

  const handleViewDlImage = (dlImage) => {
    setSelectedDlImage(dlImage);
  };

  const closeDlImage = () => {
    setSelectedDlImage(null);
  };

  const handleDownloadImage = (dlImage) => {
    const link = document.createElement('a');
    link.href = dlImage;
    link.download = 'DL_Image.jpg';
    link.click();
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={params.row.images?.[0]} sx={{ mr: 1.5, width: 36, height: 36 }} />
              <Typography variant="body2">{params.value}</Typography>
          </Box>
      )
    },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'dl', headerName: 'DL Number', width: 150 },
    { field: 'city', headerName: 'City', width: 120 },
    { field: 'state', headerName: 'State', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Driving License">
          <IconButton
            variant="outlined"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleViewDlImage(params.row.dlImage?.[0]);
            }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = Array.isArray(filteredOwners) ? filteredOwners.map((owner) => ({
    id: owner._id, // Ensure unique id for each row
    ...owner
  })) : [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
            Car Owners
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                label="Search by Mobile or DL"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 300 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
                />
            </Box>

            <Paper elevation={0} sx={{ height: 650, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                />
            </Paper>
        </Paper>

      {/* Modal for DL Image */}
        <Dialog open={!!selectedDlImage} onClose={closeDlImage} maxWidth="sm">
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    Driving License
                    <IconButton onClick={closeDlImage}><Close/></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <img
                    src={selectedDlImage}
                    alt="DL"
                    style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => handleDownloadImage(selectedDlImage)}
                    startIcon={<Download/>}
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    </Container>
  );
};

export default OwnerList;

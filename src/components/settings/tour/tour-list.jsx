import { Add, Clear, Edit, Search, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Chip,
  alpha,
  useTheme
} from "@mui/material";
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarFilterButton, 
  GridToolbarDensitySelector, 
  GridToolbarExport,
  gridClasses 
} from "@mui/x-data-grid";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tourList } from "../../redux/reducers/tour/tour"; // Ensure correct path
import { useLoader } from "../../../../utils/loader"; // Ensure correct path

// --- Custom Toolbar ---
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const TourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Safe Access to Redux State
  const tourState = useSelector((state) => state.tour);
  const rawData = tourState?.data || [];
  const tours = Array.isArray(rawData) ? rawData : (rawData.data || []);
  const loading = tourState?.loading || false;

  const { showLoader, hideLoader } = useLoader();

  // Search States
  const [searchId, setSearchId] = useState("");
  const [searchAgency, setSearchAgency] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        try {
            showLoader();
            await dispatch(tourList());
        } finally {
            hideLoader();
        }
    };
    fetchData();
  }, [dispatch]);

  const handleUpdate = (id) => {
    navigate(`/tour-update/${id}`);
  };

  const handleAddNew = () => {
    navigate("/add-tour-data");
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return tours.filter((pkg) => {
        const matchesId = !searchId || String(pkg._id).toLowerCase().includes(searchId.toLowerCase()) || String(pkg.agencyId).toLowerCase().includes(searchId.toLowerCase());
        const matchesAgency = !searchAgency || String(pkg.travelAgencyName).toLowerCase().includes(searchAgency.toLowerCase());
        return matchesId && matchesAgency;
    });
  }, [tours, searchId, searchAgency]);

  const columns = [
    { 
      field: "agencyId", 
      headerName: "Agency ID", 
      width: 130,
      valueGetter: (value, row) => row.agencyId || row._id?.slice(-6).toUpperCase(),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>
            {params.value}
        </Typography>
      )
    },
    { 
      field: "travelAgencyName", 
      headerName: "Agency Name", 
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" color="text.primary">
            {params.value}
        </Typography>
      )
    },
    {
        field: "city",
        headerName: "City",
        width: 150,
        valueGetter: (value, row) => row.city || "N/A"
    },
    {
        field: "state",
        headerName: "State",
        width: 150,
        valueGetter: (value, row) => row.state || "N/A"
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => {
         if (!row) return '';
         return `${row.nights || 0}N / ${row.days || 0}D`;
      },
      renderCell: (params) => (
        <span style={{ fontWeight: 500 }}>{params.value}</span>
      )
    },
    {
      field: "price",
      headerName: "Price",
      width: 140,
      align: 'right',
      headerAlign: 'right',
      type: 'number',
      renderCell: (params) => (
        <Typography color="text.primary" variant="body2" sx={{ fontFamily: 'monospace' }}>
          ₹{Number(params.value).toLocaleString("en-IN")}
        </Typography>
      ),
    },
    {
        field: "isCustomizable",
        headerName: "Type",
        width: 130,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
            <Chip 
                label={params.value ? "Custom" : "Fixed"} 
                size="small" 
                color={params.value ? "info" : "default"}
                variant="outlined"
                sx={{ height: 24, fontSize: '0.75rem', borderRadius: 1 }}
            />
        )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Tooltip title="Edit Tour">
          <IconButton
            size="small"
            onClick={() => handleUpdate(params.row._id)}
            color="primary"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F2F4F7", minHeight: "100vh", pb: 4 }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* Header Section */}
        <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            mb={4}
        >
            <Box>
                <Typography variant="h4" fontWeight="700" color="text.primary">
                    Tour List
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Detailed view of all registered tour packages.
                </Typography>
            </Box>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNew}
                sx={{
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: "600",
                }}
            >
                Add Tour
            </Button>
        </Stack>

        {/* Search Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    placeholder="Filter by ID..."
                    size="small"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                        endAdornment: searchId && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchId("")}><Clear fontSize="small" /></IconButton></InputAdornment>
                    }}
                    sx={{ width: { xs: '100%', md: 300 } }}
                />
                <TextField
                    placeholder="Filter by Agency Name..."
                    size="small"
                    value={searchAgency}
                    onChange={(e) => setSearchAgency(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                        endAdornment: searchAgency && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchAgency("")}><Clear fontSize="small" /></IconButton></InputAdornment>
                    }}
                    sx={{ width: { xs: '100%', md: 300 } }}
                />
            </Stack>
        </Paper>

        {/* Classic Table DataGrid */}
        <Paper 
            elevation={2} 
            sx={{ 
                height: 650, 
                width: "100%", 
                borderRadius: 2,
                overflow: "hidden" 
            }}
        >
            <DataGrid
                rows={filteredData}
                columns={columns}
                loading={loading}
                getRowId={(row) => row._id}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                slots={{ toolbar: CustomToolbar }}
                disableRowSelectionOnClick
                
                // --- Classic Table Styling Properties ---
                density="standard"
                showCellVerticalBorder={true}
                showColumnVerticalBorder={true}
                rowHeight={52} // Standard table row height
                
                sx={{
                    border: 0,
                    // Header Styling
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f1f5f9", // Light gray background
                        color: "#475569",
                        fontSize: "0.80rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        borderBottom: "2px solid #e2e8f0",
                    },
                    // Cell Styling
                    "& .MuiDataGrid-cell": {
                        borderBottom: "1px solid #f0f0f0",
                        color: "#334155",
                        fontSize: "0.875rem",
                    },
                    // Zebra Striping
                    [`& .${gridClasses.row}:nth-of-type(even)`]: {
                        backgroundColor: "#fafafa",
                    },
                    [`& .${gridClasses.row}:hover`]: {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    // Footer
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "2px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                    },
                }}
            />
        </Paper>
        </Container>
    </Box>
  );
};

export default TourList;
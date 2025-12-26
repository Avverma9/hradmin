import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  Grid,
  alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Add,
  Edit,
  FlightTakeoff,
  CheckCircleOutline,
  PendingOutlined,
  ListAlt,
  ArrowForward,
  MoreVert
} from "@mui/icons-material";
import { tourRequest } from "src/components/redux/reducers/tour/tour"; // Check path
import { useLoader } from "../../../../utils/loader";

// --- Styled Components ---

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: "none",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    textTransform: "uppercase",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px dashed ${theme.palette.divider}`,
  },
  "& .MuiDataGrid-row": {
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-withBorderColor": {
    borderColor: theme.palette.divider,
  },
}));

const StatCard = ({ title, value, icon, color, subtext }) => (
  <Card
    sx={{
      height: "100%",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
      borderRadius: 4,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: "flex",
          }}
        >
          {icon}
        </Box>
        {/* Optional decorative element or percentage could go here */}
      </Stack>
      <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight="500">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

// --- Custom Components ---

function CustomToolbar() {
  return (
    <GridToolbarContainer
      sx={{
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={1}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Stack>
      <GridToolbarQuickFilter
        variant="outlined"
        size="small"
        placeholder="Search agencies, cities..."
        sx={{
          width: { xs: "100%", sm: 300 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "background.paper",
          },
        }}
      />
    </GridToolbarContainer>
  );
}

// --- Main Component ---

const TourRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data = [], loading } = useSelector((state) => state.tour);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoader();
        await dispatch(tourRequest());
      } finally {
        hideLoader();
      }
    };
    fetchData();
  }, [dispatch]);

  const handleUpdate = (id) => navigate(`/tour-update/${id}`);
  const handleAddNew = () => navigate("/add-tour-data");

  // Calculate Stats
  const stats = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const accepted = rows.filter((r) => r?.isAccepted).length;
    return {
      total: rows.length,
      accepted,
      pending: rows.length - accepted,
    };
  }, [data]);

  // Define Columns
  const columns = useMemo(
    () => [
      {
        field: "travelAgencyName",
        headerName: "Agency",
        flex: 1.5,
        minWidth: 220,
        renderCell: (params) => (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: params.row.isAccepted
                  ? theme.palette.primary.main
                  : theme.palette.warning.main,
                color: "#fff",
                width: 32,
                height: 32,
                fontSize: "0.875rem",
              }}
            >
              {params.value?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="600">
                {params.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {params.row.agencyId || "N/A"}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "city",
        headerName: "Location",
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        ),
      },
      {
        field: "themes",
        headerName: "Theme",
        width: 140,
        renderCell: (params) => (
          <Chip 
            label={params.value} 
            size="small" 
            sx={{ borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark, fontWeight: 600 }} 
          />
        ),
      },
      {
        field: "duration",
        headerName: "Duration",
        width: 120,
        align: "center",
        headerAlign: "center",
        valueGetter: (value, row) => `${row?.nights}N / ${row?.days}D`,
        renderCell: (params) => (
            <Typography variant="body2" fontWeight="500">
                {params.row.nights}N / {params.row.days}D
            </Typography>
        )
      },
      {
        field: "price",
        headerName: "Price",
        width: 140,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="700" color="success.main">
            ₹{Number(params.value ?? 0).toLocaleString("en-IN")}
          </Typography>
        ),
      },
      {
        field: "isAccepted",
        headerName: "Status",
        width: 140,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const isAccepted = params.value;
          return (
            <Chip
              icon={isAccepted ? <CheckCircleOutline fontSize="small" /> : <PendingOutlined fontSize="small" />}
              label={isAccepted ? "Accepted" : "Pending"}
              color={isAccepted ? "success" : "warning"}
              size="small"
              variant={isAccepted ? "filled" : "outlined"}
              sx={{ fontWeight: 600, minWidth: 90 }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleUpdate(params.row._id)}
              sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [theme]
  );

  const rows = Array.isArray(data) ? data : [];

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* Header Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          mb={4}
        >
          <Box>
            <Typography variant="h4" fontWeight="800" color="text.primary">
              Tour Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor incoming tour packages and manage approvals.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{
              boxShadow: theme.shadows[4],
              borderRadius: 3,
              px: 4,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Create New Tour
          </Button>
        </Stack>

        {/* Stats Section */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Total Requests"
              value={stats.total}
              icon={<ListAlt fontSize="medium" />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Pending Approval"
              value={stats.pending}
              icon={<PendingOutlined fontSize="medium" />}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Accepted Tours"
              value={stats.accepted}
              icon={<CheckCircleOutline fontSize="medium" />}
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>

        {/* DataGrid Section */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <StyledDataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            rowHeight={70} // Slightly taller rows for better readability
            slots={{
              toolbar: CustomToolbar,
            }}
            autoHeight={rows.length < 10}
            sx={{
                minHeight: 500
            }}
          />
        </Card>
      </Container>
    </Box>
  );
};

export default TourRequest;
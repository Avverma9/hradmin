import {
  Add,
  ArrowForward,
  CheckCircleOutline,
  ListAlt,
  PendingOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tourRequest } from "src/components/redux/reducers/tour/tour";
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

const StatCard = ({ title, value, icon, color }) => (
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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
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

  const tourState = useSelector((state) => state.tour);
  const rawData = tourState?.data || [];
  // Ensure data is always an array
  const data = Array.isArray(rawData) ? rawData : rawData.data || [];
  const loading = tourState?.loading || false;

  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoader();
        await dispatch(tourRequest());
      } catch (error) {
        console.error("Failed to fetch tours", error);
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
        headerName: "Agency Details",
        flex: 1.5,
        minWidth: 280,
        renderCell: (params) => (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Avatar
              sx={{
                bgcolor: params.row.isAccepted
                  ? theme.palette.primary.main
                  : theme.palette.warning.main,
                color: "#fff",
                width: 36,
                height: 36,
                fontSize: "0.875rem",
                fontWeight: "bold",
                boxShadow: 1,
              }}
            >
              {params.value?.charAt(0).toUpperCase() || "A"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight="600" noWrap>
                {params.value || "Unknown Agency"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                noWrap
              >
                ID: {params.row.agencyId || params.row._id?.substring(0, 8)}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "location",
        headerName: "Location",
        width: 180,
        // FIX: Updated syntax for valueGetter (value, row)
        valueGetter: (params) => {
          const row = params?.row || {};
          const city = row.city || (row.location && row.location.city) || "";
          const state = row.state || (row.location && row.location.state) || "";
          return city && state ? `${city}, ${state}` : city || state || "N/A";
        },
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        ),
      },
      {
        field: "themes",
        headerName: "Theme",
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.value || "Standard"}
            size="small"
            sx={{
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              color: theme.palette.info.dark,
              fontWeight: 600,
              fontSize: "0.75rem",
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          />
        ),
      },
      {
        field: "duration",
        headerName: "Duration",
        width: 120,
        align: "center",
        headerAlign: "center",
        // FIX: Updated syntax for valueGetter (value, row)
        valueGetter: (params) => {
          const row = params?.row || {};
          return `${row.nights || 0}N / ${row.days || 0}D`;
        },
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{
              borderColor: theme.palette.divider,
              color: "text.primary",
              fontWeight: 500,
            }}
          />
        ),
      },
      {
        field: "price",
        headerName: "Package Price",
        width: 140,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Typography
            variant="body2"
            fontWeight="700"
            color="success.main"
            sx={{ fontSize: "0.9rem" }}
          >
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
              icon={
                isAccepted ? (
                  <CheckCircleOutline fontSize="small" />
                ) : (
                  <PendingOutlined fontSize="small" />
                )
              }
              label={isAccepted ? "Accepted" : "Pending"}
              color={isAccepted ? "success" : "warning"}
              size="small"
              variant={isAccepted ? "filled" : "outlined"}
              sx={{ fontWeight: 600, minWidth: 100 }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        width: 80,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleUpdate(params.row._id)}
              sx={{
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
              }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [theme, handleUpdate]
  );

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
              Tour Management
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Overview of all incoming tour requests and their status.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: 3,
              px: 4,
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              background: theme.palette.primary.main,
              "&:hover": { background: theme.palette.primary.dark },
            }}
          >
            Create Tour
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
              title="Pending Action"
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
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            bgcolor: "#fff",
          }}
        >
          <StyledDataGrid
            rows={stats.total > 0 ? data : []} // Ensure rows is array
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id} // Use _id from API
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            rowHeight={76} // Comfortable row height for multiline text
            slots={{
              toolbar: CustomToolbar,
            }}
            autoHeight={data.length > 0 && data.length < 10}
            sx={{
              minHeight: 500,
              "& .MuiDataGrid-virtualScroller": {
                bgcolor: "#fff",
              },
            }}
          />
        </Card>
      </Container>
    </Box>
  );
};

export default TourRequest;

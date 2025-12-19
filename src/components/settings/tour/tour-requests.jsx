import React, { useEffect, useMemo, useState } from "react";
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
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { Add, Edit, FlightTakeoff } from "@mui/icons-material";
import { tourRequest } from "src/components/redux/reducers/tour/tour";
import { useLoader } from "../../../../utils/loader";

function CustomToolbar({ onAddNew }) {
  return (
    <GridToolbarContainer sx={{ p: 1.25, gap: 1, justifyContent: "space-between" }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <GridToolbarQuickFilter
          debounceMs={300}
          placeholder="Search tours…"
          sx={{
            "& .MuiInputBase-root": { minWidth: { xs: 200, sm: 260 } },
          }}
        />
        <Button variant="contained" startIcon={<Add />} onClick={onAddNew}>
          Add Tour
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
}

const TourRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const stats = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const accepted = rows.filter((r) => r?.isAccepted).length;
    return { total: rows.length, accepted, pending: rows.length - accepted };
  }, [data]);

  const columns = useMemo(
    () => [
      { field: "travelAgencyName", headerName: "Agency", flex: 1, minWidth: 180 },
      { field: "city", headerName: "City", width: 120 },
      { field: "themes", headerName: "Theme", width: 140 },
      { field: "nights", headerName: "Nights", width: 90, align: "center", headerAlign: "center" },
      { field: "days", headerName: "Days", width: 90, align: "center", headerAlign: "center" },
      {
        field: "price",
        headerName: "Price",
        width: 130,
        align: "right",
        headerAlign: "right",
        valueFormatter: (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
      },
      {
        field: "isAccepted",
        headerName: "Status",
        width: 150,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value ? "Accepted" : "Pending"}
            color={params.value ? "success" : "warning"}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 170,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={() => handleUpdate(params.row._id)}
          >
            View / Edit
          </Button>
        ),
      },
    ],
    []
  );

  const rows = Array.isArray(data) ? data : [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          borderColor: "divider",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={800}>
                <FlightTakeoff sx={{ mr: 1, verticalAlign: "middle" }} />
                Tour Requests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage incoming packages, review details, and update status.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Total: ${stats.total}`} variant="outlined" />
              <Chip label={`Accepted: ${stats.accepted}`} color="success" variant="outlined" />
              <Chip label={`Pending: ${stats.pending}`} color="warning" variant="outlined" />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ height: 680, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            slots={{
              toolbar: () => <CustomToolbar onAddNew={handleAddNew} />,
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "grey.50",
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                bgcolor: "action.hover",
              },
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default TourRequest;

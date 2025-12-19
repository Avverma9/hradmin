import { Add, Clear, Edit, Search } from "@mui/icons-material";
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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { iconsList } from "../../../../utils/icon";
import { tourList } from "../../redux/reducers/tour/tour";

const TourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data = [], loading } = useSelector((state) => state.tour);

  // Separate state for each search bar
  const [searchId, setSearchId] = useState("");
  const [searchAgency, setSearchAgency] = useState("");

  useEffect(() => {
    dispatch(tourList());
  }, [dispatch]);

  const getAmenityIcon = (amenity) => {
    const iconObj = iconsList.find(
      (icon) => icon.label.toLowerCase() === amenity.toLowerCase()
    );
    return iconObj
      ? React.cloneElement(iconObj.icon, {
          sx: { fontSize: "1rem", verticalAlign: "middle", mr: 0.5 },
        })
      : null;
  };

  const handleUpdate = (id) => {
    navigate(`/tour-update/${id}`);
  };

  const handleAddNew = () => {
    navigate("/add-tour-data");
  };

  // Multi-field filter logic: applies both searchId & searchAgency
  const filteredData = Array.isArray(data)
    ? data.filter(
        (pkg) =>
          (!searchId ||
            String(pkg._id).toLowerCase().includes(searchId.toLowerCase())) &&
          (!searchAgency ||
            String(pkg.travelAgencyName)
              .toLowerCase()
              .includes(searchAgency.toLowerCase()))
      )
    : [];

  const columns = [
    { field: "agencyId", headerName: "ID", width: 150 },
    { field: "travelAgencyName", headerName: "Agency", width: 170 },
    {
      field: "nights",
      headerName: "Nights",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "days",
      headerName: "Days",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params) => (
        <Typography color="primary" fontWeight="bold">
          ₹{params.value.toLocaleString("en-IN")}
        </Typography>
      ),
    },
    {
      field: "amenities",
      headerName: "Amenities",
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {params.value?.slice(0, 3).map((amenity, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "grey.100",
                px: 1,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              {getAmenityIcon(amenity)}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {amenity}
              </Typography>
            </Box>
          ))}
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Tooltip title="Edit this tour">
          <Button
            variant="contained"
            size="small"
            color="secondary"
            startIcon={<Edit />}
            onClick={() => handleUpdate(params.row._id)}
            sx={{ boxShadow: 2 }}
          >
            Update
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          mb={3}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "primary.main", letterSpacing: 1 }}
          >
            Tour Packages
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{
              borderRadius: 3,
              px: 3,
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: 2,
              "&:hover": {
                background: "linear-gradient(90deg,#1976d2,#42a5f5)",
              },
            }}
          >
            Add Tour
          </Button>
        </Stack>
        {/* Advanced search bar section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
        >
          <TextField
            label="Search by ID"
            variant="outlined"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Tour ID"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton
                  onClick={() => setSearchId("")}
                  style={{ visibility: searchId ? "visible" : "hidden" }}
                  size="small"
                >
                  <Clear />
                </IconButton>
              ),
            }}
            sx={{
              minWidth: { xs: 120, sm: 160 },
              bgcolor: "grey.100",
              borderRadius: 2,
            }}
          />
          <TextField
            label="Search by Agency"
            variant="outlined"
            size="small"
            value={searchAgency}
            onChange={(e) => setSearchAgency(e.target.value)}
            placeholder="Agency Name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton
                  onClick={() => setSearchAgency("")}
                  style={{ visibility: searchAgency ? "visible" : "hidden" }}
                  size="small"
                >
                  <Clear />
                </IconButton>
              ),
            }}
            sx={{
              minWidth: { xs: 130, sm: 200 },
              bgcolor: "grey.100",
              borderRadius: 2,
            }}
          />
        </Stack>
        <Box
          sx={{
            height: { xs: 440, md: 650 },
            width: "100%",
            bgcolor: "grey.50",
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
          <DataGrid
            rows={filteredData}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            slots={{ toolbar: GridToolbar }}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                py: 1,
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "grey.200",
                fontWeight: "bold",
                fontSize: "1rem",
                letterSpacing: 0.5,
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "grey.100",
                boxShadow: 1,
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default TourList;

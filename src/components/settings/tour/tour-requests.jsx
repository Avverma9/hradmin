import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  TextField,
  Box,
  IconButton,
  Button,
  styled,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import {  tourRequest } from "src/components/redux/reducers/tour/tour";

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "#1976d2",
  color: "#fff",
  padding: "5px 10px",
  fontSize: "0.85rem",
  borderRadius: "5px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "0.3s ease",
  "&:hover": {
    backgroundColor: "#115293",
  },
}));

const TourRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = useSelector((state) => state.tour.data);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(tourRequest());
  }, [dispatch]);

  const handleUpdate = (id) => {
    navigate(`/tour-update/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "travelAgencyName", headerName: "Agency Name", width: 180 },
    { field: "nights", headerName: "Nights", width: 100 },
    { field: "days", headerName: "Days", width: 100 },
    { field: "price", headerName: "Price", width: 120 },
    {
        field: "isAccepted",
        headerName: "Status",
        width: 150,
        renderCell: (params) => (
          <span
            style={{
              color: params.value ? "green" : "red",
              fontWeight: 600,
            }}
          >
            {params.value ? "Accepted" : "Not Accepted"}
          </span>
        ),
      },
      
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Edit this tour">
          <StyledButton onClick={() => handleUpdate(params.row._id)}>
            <EditIcon fontSize="small" />
            View & Update
          </StyledButton>
        </Tooltip>
      ),
    },
  ];

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredData = data.filter((pkg) =>
    Object.values(pkg).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div style={{ height: 500, width: "100%" }}>
     <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Box sx={{ fontSize: "24px", fontWeight: "bold", color: "#fffff" }}>
    ✈️ Tour Requests
  </Box>
        <TextField
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search..."
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" />,
            endAdornment: (
              <IconButton
                onClick={() => setSearchText("")}
                style={{
                  visibility: searchText ? "visible" : "hidden",
                  padding: 0,
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Box>

      <DataGrid
        rows={filteredData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row._id}
        components={{ Toolbar: GridToolbar }}
        sx={{
          border: "1px dotted #ccc",
          "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders": {
            border: "1px dotted #ccc",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px dotted #ccc",
          },
        }}
      />
    </div>
  );
};

export default TourRequest;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tourList } from "../redux/reducers/tour/tour";
import { iconsList } from "../../../utils/icon";
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
import { useLoader } from "../../../utils/loader";

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

const TourList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = useSelector((state) => state.tour.data);
  const [searchText, setSearchText] = useState("");
  const { showLoader, hideLoader } = useLoader()

  useEffect(() => {
    try {
      showLoader();
      // Fetch the tour list
      dispatch(tourList()).then(() => {
        hideLoader();
      });
    }
    catch (error) {
      hideLoader();
      console.error("Error fetching tour list:", error);
    }
  }, [dispatch]);

  const getAmenityIcon = (amenity) => {
    const iconObj = iconsList.find(
      (icon) => icon.label.toLowerCase() === amenity.toLowerCase()
    );
    return iconObj ? iconObj.icon : null;
  };

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
      field: "amenities",
      headerName: "Amenities",
      width: 200,
      renderCell: (params) => (
        <div>
          {params.value?.slice(0, 3).map((amenity, idx) => {
            const icon = getAmenityIcon(amenity);
            return (
              <span key={idx} style={{ marginRight: "8px" }}>
                {icon && <span>{icon}</span>} {amenity}
              </span>
            );
          })}
        </div>
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
          ✈️ Tour List
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

export default TourList;

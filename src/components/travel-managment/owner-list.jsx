import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOwner } from "../redux/reducers/travel/carOwner";
import {
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  Modal,
} from "@mui/material";
import "./owner-list.css";

const OwnerList = () => {
  const owners = useSelector((state) => state.owner.data);
  const dispatch = useDispatch();
  const [selectedDlImage, setSelectedDlImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOwners, setFilteredOwners] = useState([]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        await dispatch(getAllOwner());
      } catch (error) {
        console.error("Error fetching owner data:", error);
      }
    };

    fetchOwners();
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOwners(owners);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredOwners(
        owners.filter(
          (owner) =>
            owner.mobile?.toLowerCase().includes(lowercasedQuery) ||
            owner.dl?.toLowerCase().includes(lowercasedQuery),
        ),
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
    const link = document.createElement("a");
    link.href = dlImage;
    link.download = "DL_Image.jpg";
    link.click();
  };

  const columns = [
    { field: "name", headerName: "Name", width: 160 },
    { field: "role", headerName: "Role", width: 120 },
    { field: "mobile", headerName: "Mobile", width: 140 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "dl", headerName: "DL", width: 120 },
    { field: "city", headerName: "City", width: 120 },
    { field: "state", headerName: "State", width: 120 },
    { field: "pinCode", headerName: "Pin Code", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            handleViewDlImage(params.row.dlImage[0]);
          }}
        >
          View DL
        </Button>
      ),
    },
  ];

  const rows = filteredOwners.map((owner) => ({
    id: owner._id,
    name: owner.name,
    role: owner.role,
    mobile: owner.mobile,
    email: owner.email,
    dl: owner.dl,
    city: owner.city,
    state: owner.state,
    address: owner.address,
    pinCode: owner.pinCode,
    dlImage: owner.dlImage,
  }));

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          textAlign: "center",
          backgroundColor: "#f5f5f5",
          padding: 2,
          borderRadius: 1,
          border: "1px solid #ddd",
          fontSize: "1rem",
        }}
      >
        List of registered car owners with associated documents and contact details.
      </Typography>

      <Box sx={{ mb: 2, textAlign: "right" }}>
        <TextField
          label="Search by Mobile or DL"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Paper elevation={3}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 20, 30]}
          checkboxSelection
          sx={{ height: 600, border: 0 }}
        />
      </Paper>

      {/* Modal for DL Image */}
      <Modal open={!!selectedDlImage} onClose={closeDlImage}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            boxShadow: 24,
            p: 3,
            borderRadius: 1,
            maxWidth: 500,
            textAlign: "center",
          }}
        >
          <img
            src={selectedDlImage}
            alt="DL"
            style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleDownloadImage(selectedDlImage)}
            >
              Download DL Image
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default OwnerList;

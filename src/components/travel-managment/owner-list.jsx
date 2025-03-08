import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOwner } from "../redux/reducers/travel/carOwner";
import { Paper, Button } from "@mui/material";
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
    // { field: 'id', headerName: 'ID', width: 70 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "role", headerName: "Role", width: 150 },
    { field: "mobile", headerName: "Mobile", width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "dl", headerName: "DL", width: 150 },
    { field: "city", headerName: "City", width: 150 },
    { field: "state", headerName: "State", width: 150 },
    { field: "address", headerName: "Address", width: 250 },
    { field: "pinCode", headerName: "Pin Code", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={(event) => {
              event.stopPropagation(); // Prevent row selection on button click
              handleViewDlImage(params.row.dlImage[0]);
            }}
            
          >
            View DL Image
          </Button>
        );
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: 20 };

  // Prepare the filteredOwners data for the DataGrid
  const rows = filteredOwners.map((owner, index) => ({
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
    <div className="owner-list">
      <h2
        style={{
          textAlign: "center",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          padding: "10px",
          fontSize: "14px",
        }}
      >
       The following list contains detailed information about the car owners. Each owner is categorized by their personal details, including the car they own, and additional information that helps provide a comprehensive view of each owner.
      </h2>
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10, 20, 30, 40]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>

      {/* View DL Image Modal */}
      {selectedDlImage && (
        <div className="view-dl-image active">
          <div className="modal-content">
            <button className="close-btn" onClick={closeDlImage}>
              &times;
            </button>
            <img src={selectedDlImage} alt="DL" />
            <div className="modal-actions">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDownloadImage(selectedDlImage)}
              >
                Download Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerList;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { tourList } from "../redux/reducers/tour/tour";
import { Box } from "@mui/material";
import { styled } from "@mui/system";

// Custom Styled Box for the DialogContent
const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "travelAgencyName", headerName: "Travel Agency", width: 200 },
  { field: "state", headerName: "State", width: 100 },
  { field: "city", headerName: "City", width: 150 },
  { field: "visitngPlaces", headerName: "Visiting Places", width: 250 },
  { field: "price", headerName: "Price", type: "number", width: 100 },
  { field: "nights", headerName: "Nights", type: "number", width: 100 },
  { field: "days", headerName: "Days", type: "number", width: 100 },
  { field: "themes", headerName: "Themes", width: 150 },
  { field: "starRating", headerName: "Rating", type: "number", width: 100 },
  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => (
      <>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => params.row.handleView(params.row)}
          style={{ marginRight: 8 }}
        >
          View
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => params.row.handleUpdate(params.row)}
        >
          Update
        </Button>
      </>
    ),
  },
];

export default function TourList() {
  const dispatch = useDispatch();
  const tour = useSelector((state) => state.tour.data);
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    dispatch(tourList());
  }, [dispatch]);

  const handleView = (row) => {
    setSelectedData(row);
    setOpen(true);
  };

  const handleUpdate = (row) => {
    console.log("Update button clicked for:", row);
    // Add logic for update functionality
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
  };

  const rows = tour?.map((tour, index) => ({
    id: index + 1,
    travelAgencyName: tour.travelAgencyName,
    state: tour.state,
    city: tour.city,
    visitngPlaces: tour.visitngPlaces,
    price: tour.price,
    nights: tour.nights,
    days: tour.days,
    themes: tour.themes,
    starRating: tour.starRating,
    handleView: handleView,
    handleUpdate: handleUpdate,
  }));

  return (
    <>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>

      {/* Modal for Viewing Data */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#3f51b5", color: "white", textAlign: "center" }}>
          <Typography variant="h6">Tour Package Details</Typography>
        </DialogTitle>
        <DialogContentStyled>
          {selectedData && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse", // Ensures borders are merged together
                border: "1px solid #ddd", // Outer border
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd", // Grid line for each cell
                    }}
                  >
                    Travel Agency:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.travelAgencyName}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    State:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.state}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    City:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.city}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Visiting Places:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.visitngPlaces}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Price:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    ₹{selectedData.price}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Nights:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.nights}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Days:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.days}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Themes:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.themes}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Star Rating:
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {selectedData.starRating}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </DialogContentStyled>
        <DialogActions sx={{ padding: "16px" }}>
          <Button onClick={handleClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { styled, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Button,
  Dialog,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { fetchTravelBookingsAdmin, updateTravelBooking } from "src/components/redux/reducers/travel/booking";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import UpdateBookingModal from "src/components/travel-managment/update-booking";
import BookingDetails from "src/components/travel-managment/bookings-view";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  fontFamily: "Roboto, sans-serif",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "600",
    },
  },
  "& .MuiDataGrid-row": {
    "&:nth-of-type(odd)": {
      backgroundColor: alpha(theme.palette.action.hover, 0.02),
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.light, 0.15),
    },
    "&.Mui-selected": {
      backgroundColor: alpha(theme.palette.primary.light, 0.2),
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.light, 0.25),
      },
    },
  },
  "& .MuiDataGrid-toolbarContainer": {
    padding: theme.spacing(1),
    "& .MuiButton-text": {
      color: theme.palette.primary.main,
    },
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

const columns = (handleView, handleUpdate) => [
  { field: "bookingId", headerName: "Booking ID", width: 100 },
  { field: "bookedBy", headerName: "Customer", width: 120 },
  {
    field: "pickupD",
    headerName: "Pickup Time",
    type: "dateTime",
    minWidth: 180,
    valueGetter: (value) => value && new Date(value),
  },
  {
    field: "dropD",
    headerName: "Drop-off Time",
    type: "dateTime",
    minWidth: 180,
    valueGetter: (value) => value && new Date(value),
  },
  {
    field: "totalSeatPrice",
    headerName: "Total Seat Price",
    width: 120,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 160,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleView(params.row)}
        >
          View
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleUpdate(params.row)}
        >
          Update
        </Button>
      </Stack>
    ),
  },
];

export default function TravelBookings() {
  const dispatch = useDispatch();
  const { bookingsAdmin, loading, error } = useSelector(
    (state) => state.travelBooking
  );

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);

  useEffect(() => {
    if (!bookingsAdmin || bookingsAdmin.length === 0) {
      dispatch(fetchTravelBookingsAdmin()).catch((err) =>
        console.error("Failed to fetch bookings:", err)
      );
    }
  }, [dispatch, bookingsAdmin]);

  const handleView = (booking) => {
    setViewBooking(booking);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewBooking(null);
  };

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateBooking = async (updatedData) => {
    setUpdateLoading(true);
    try {
      await dispatch(updateTravelBooking({ id: updatedData._id || updatedData.bookingId, data: updatedData }));
      await dispatch(fetchTravelBookingsAdmin());
      handleCloseUpdateModal();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ padding: { xs: 2, md: 4 }, borderRadius: "16px" }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AdminPanelSettingsOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Travel Bookings Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View, filter, and export all travel bookings from the grid below.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ width: "100%", height: 650 }}>
            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography color="error">Error: {error}</Typography>
              </Box>
            )}
            {!loading && !error && (
              <StyledDataGrid
                rows={bookingsAdmin || []}
                columns={columns(handleView, handleUpdate)}
                getRowId={(row) => row.bookingId || row._id}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
              />
            )}
          </Box>

          {selectedBooking && updateModalOpen && (
            <UpdateBookingModal
              booking={selectedBooking}
              onUpdate={handleUpdateBooking}
              onClose={handleCloseUpdateModal}
              loading={updateLoading}
            />
          )}

          {viewBooking && (
            <Dialog open={viewModalOpen} onClose={handleCloseViewModal} maxWidth="sm" fullWidth>
              <BookingDetails booking={viewBooking} onClose={handleCloseViewModal} />
            </Dialog>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
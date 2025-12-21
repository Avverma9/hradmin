import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Skeleton,
  Button,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  useGridApiContext,
} from "@mui/x-data-grid";
import Papa from "papaparse";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { userDetails } from "src/components/redux/reducers/user";
import UserDetailsModal from "./user-details";
import { useLoader } from "../../../../utils/loader";

// --- Helper Functions ---

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  const safeName = typeof name === "string" && name ? name : "No Name";
  const nameParts = safeName.split(" ");
  const children =
    nameParts.length > 1 && nameParts[1]
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : safeName[0];

  return {
    sx: {
      bgcolor: stringToColor(safeName),
      color: (theme) => theme.palette.getContrastText(stringToColor(safeName)),
      width: 36,
      height: 36,
      fontSize: "0.9rem",
    },
    children: children.toUpperCase(),
  };
}

// --- Custom Toolbar & Enhanced Export Button ---

const CustomExportButton = ({ userDataMap }) => {
  const apiRef = useGridApiContext();

  const flattenUserDataForExport = (users) => {
    const flatData = [];
    users.forEach((user) => {
      const userInfo = {
        userId: user.userId,
        userName: user.name,
        userEmail: user.email,
        userMobile: user.mobile,
        userProfileUrl: user.profile?.[0] || "",
      };

      if (user.bookings && user.bookings.length > 0) {
        user.bookings.forEach((booking) => {
          const roomDetails = booking.roomDetails?.[0] || {};
          const hotelDetails = booking.hotelDetails || {};

          flatData.push({
            ...userInfo,
            bookingId: booking.bookingId,
            bookingStatus: booking.bookingStatus,
            totalBookingPrice: booking.price,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            hotelName: hotelDetails.hotelName,
            hotelCity: hotelDetails.hotelCity,
            hotelEmail: hotelDetails.hotelEmail,
            roomId: roomDetails.roomId,
            roomType: roomDetails.type,
            roomBedTypes: roomDetails.bedTypes,
            roomPrice: roomDetails.price,
          });
        });
      } else {
        flatData.push(userInfo);
      }
    });
    return flatData;
  };

  const handleExport = () => {
    const selectedRowIds = apiRef.current.getSelectedRows().keys();
    const rowIds = Array.from(selectedRowIds);

    let usersToExport;
    if (rowIds.length > 0) {
      usersToExport = rowIds.map((id) => userDataMap.get(id));
    } else {
      const visibleRowModels = apiRef.current.getSortedRows();
      usersToExport = visibleRowModels.map((rowModel) =>
        userDataMap.get(rowModel.id),
      );
    }

    const flattenedData = flattenUserDataForExport(usersToExport);
    const csv = Papa.unparse(flattenedData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "user_bookings_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      startIcon={<FileDownloadIcon />}
      size="small"
    >
      Export Bookings
    </Button>
  );
};

function CustomToolbar({ userDataMap }) {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <Stack direction="row" flexGrow={1} spacing={1}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <CustomExportButton userDataMap={userDataMap} />
      </Stack>
    </GridToolbarContainer>
  );
}

function CustomNoRowsOverlay() {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <PeopleOutlineIcon sx={{ fontSize: 60, color: "grey.400" }} />
      <Typography variant="h6" color="text.secondary">
        No Users Found
      </Typography>
    </Stack>
  );
}

// --- Main Component ---

const AllUser = () => {
  const { userData = [] } = useSelector((state) => state.user);
  const { showLoader, hideLoader, isLoading } = useLoader();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const userDataMap = useMemo(() => {
    const map = new Map();
    userData.forEach((user) => map.set(user.userId, user));
    return map;
  }, [userData]);

  useEffect(() => {
    if (userData.length > 0) return;
    const fetchUserDetails = async () => {
      showLoader();
      try {
        await dispatch(userDetails());
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        hideLoader();
      }
    };
    fetchUserDetails();
  }, [dispatch, showLoader, hideLoader, userData.length]);

  const handleOpen = useCallback((user) => {
    setSelectedUser(user);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedUser(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              alt={params?.row?.name}
              src={params?.row?.profile?.[0]}
              {...(!params?.row?.profile?.[0] &&
                stringAvatar(params?.row?.name))}
            />
            <Typography variant="body2" fontWeight="bold">
              {params?.row?.name || "-"}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        minWidth: 220,
      },
      {
        field: "password",
        headerName: "Password",
        minWidth: 150,
      },
      {
        field: "mobile",
        headerName: "Mobile",
        width: 150,
      },
      {
        field: "bookingCount",
        headerName: "Bookings",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <Typography variant="body2" fontWeight="bold">
              {params?.row?.bookings?.length || 0}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title="View Details">
            {/* FIXED: Added check to ensure params.row exists before passing to handler */}
            <IconButton
              color="primary"
              size="small"
              onClick={() => params?.row && handleOpen(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [handleOpen],
  );

  const rows = useMemo(
    () => userData.map((user) => ({ ...user, id: user.userId })),
    [userData],
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        User Management
      </Typography>
      <Box
        sx={{
          height: "70vh",
          width: "100%",
          "& .MuiDataGrid-root": { border: "none", borderRadius: 2 },
          "& .MuiDataGrid-cell": {
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "action.hover",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          checkboxSelection
          disableRowSelectionOnClick
          rowHeight={64}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            toolbar: () => <CustomToolbar userDataMap={userDataMap} />,
            noRowsOverlay: CustomNoRowsOverlay,
            loadingOverlay: () => (
              <Stack height="100%">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} height="64px" />
                ))}
              </Stack>
            ),
          }}
        />
      </Box>
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={open}
          onClose={handleClose}
        />
      )}
    </Box>
  );
};

export default AllUser;

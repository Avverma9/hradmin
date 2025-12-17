import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Container,
  Avatar,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Stack,
} from "@mui/material";
import {
  Close,
  Download,
  Visibility,
  Search,
  Delete,
  Warning,
} from "@mui/icons-material";
import { getAllOwner, deleteCarOwner } from "../redux/reducers/travel/carOwner";
import { useLoader } from "../../../utils/loader";
import { useResponsive } from "../../hooks/use-responsive";

const CustomNoRowsOverlay = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    }}
  >
    <img
      src="/assets/illustrations/illustration_empty_content.svg"
      alt="No data"
      width={240}
    />
    <Typography variant="h6" sx={{ mt: 1, color: "text.secondary" }}>
      No Owners Found
    </Typography>
    <Typography variant="body2" sx={{ color: "text.disabled" }}>
      There is no data to display at the moment.
    </Typography>
  </Box>
);

const OwnerMobileCard = ({ owner, onView, onDelete }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 3,
      p: 2,
      bgcolor: "background.paper",
      boxShadow: 4,
      borderColor: "divider",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar
        src={owner.images?.[0]}
        sx={{ width: 56, height: 56, bgcolor: "grey.100" }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {owner.name || "Unnamed Owner"}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {owner.email || owner.mobile}
        </Typography>
        <Stack direction="row" spacing={2} mt={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              City
            </Typography>
            <Typography variant="body2">
              {owner.city || "-"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              DL Number
            </Typography>
            <Typography variant="body2">{owner.dl || "-"}</Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
    <Divider sx={{ my: 2 }} />
    <Stack direction="row" spacing={2} justifyContent="space-between">
      <Button
        variant="outlined"
        fullWidth
        size="small"
        onClick={() => onView(owner.dlImage?.[0])}
        sx={{ textTransform: "none" }}
      >
        View DL
      </Button>
      <Button
        variant="contained"
        color="error"
        fullWidth
        size="small"
        onClick={() => onDelete(owner._id)}
        sx={{ textTransform: "none" }}
      >
        Delete
      </Button>
    </Stack>
  </Paper>
);

const OwnerList = () => {
  const dispatch = useDispatch();
  const { data: owners = [], loading } = useSelector((state) => state.owner);
  const { showLoader, hideLoader } = useLoader();
  const mdUp = useResponsive("up", "md");
  const [selectedDlImage, setSelectedDlImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);

  useEffect(() => {
    dispatch(getAllOwner());
  }, [dispatch]);

  const filteredOwners = React.useMemo(() => {
    const ownersArray = Array.isArray(owners) ? owners : [];
    if (searchQuery.trim() === "") {
      return ownersArray;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return ownersArray.filter(
      (owner) =>
        owner?.mobile?.toString().toLowerCase().includes(lowercasedQuery) ||
        owner?.dl?.toString().toLowerCase().includes(lowercasedQuery),
    );
  }, [searchQuery, owners]);

  const handleViewDlImage = (dlImage) => setSelectedDlImage(dlImage);
  const closeDlImage = () => setSelectedDlImage(null);

  const handleDownloadImage = (dlImage) => {
    const link = document.createElement("a");
    link.href = dlImage;
    link.download = "DL_Image.jpg";
    link.click();
  };

  const handleDeleteClick = (id) => {
    setSelectedOwnerId(id);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setSelectedOwnerId(null);
    setOpenConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedOwnerId) {
      try {
        showLoader();
        await dispatch(deleteCarOwner(selectedOwnerId));
        await dispatch(getAllOwner());
      } catch (error) {
        console.error("Something went wrong", error);
      } finally {
        hideLoader();
      }
    }
    handleCloseConfirm();
  };
  

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={params.row.images?.[0]}
            sx={{ mr: 1.5, width: 36, height: 36 }}
          />
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    { field: "mobile", headerName: "Mobile", width: 130 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
    { field: "dl", headerName: "DL Number", width: 150 },
    { field: "city", headerName: "City", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Driving License">
            <IconButton
              size="small"
              onClick={() => handleViewDlImage(params.row.dlImage?.[0])}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Owner">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = Array.isArray(filteredOwners)
    ? filteredOwners.map((owner) => ({
        id: owner._id,
        ...owner,
      }))
    : [];

  return (
    <Container maxWidth="xl" sx={{ py: mdUp ? 3 : 2 }}>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardHeader
          title={
            <Typography variant={mdUp ? "h5" : "h6"} fontWeight="bold">
              Car Owners
            </Typography>
          }
          action={
            <TextField
              label="Search by Mobile or DL"
              variant="outlined"
              size={mdUp ? "small" : "small"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: mdUp ? 300 : "100%", mt: { xs: 1, md: 0 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          }
        />
        <CardContent>
          {mdUp ? (
            <Box sx={{ height: 700, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                rowHeight={52}
                columnHeaderHeight={56}
                density="standard"
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                slots={{ noRowsOverlay: CustomNoRowsOverlay, toolbar: GridToolbar }}
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "action.hover",
                    fontWeight: 700,
                    fontSize: 13,
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: 13,
                    py: 1.25,
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    minHeight: 480,
                  },
                }}
              />
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading owners...</Typography>
              ) : filteredOwners.length === 0 ? (
                <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="body2">No Owners Found</Typography>
                </Paper>
              ) : (
                filteredOwners.map((owner) => (
                  <OwnerMobileCard
                    key={owner._id}
                    owner={owner}
                    onView={handleViewDlImage}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDlImage} onClose={closeDlImage} maxWidth="sm" fullScreen={!mdUp}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Driving License
          <IconButton onClick={closeDlImage}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img
            src={selectedDlImage}
            alt="Driving License"
            style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => handleDownloadImage(selectedDlImage)}
            startIcon={<Download />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirm} onClose={handleCloseConfirm} maxWidth="xs" fullScreen={!mdUp}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" /> Are you sure?
        </DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone. This will permanently delete the car
            owner and all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OwnerList;

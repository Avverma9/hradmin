/* eslint-disable consistent-return */
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";

import { styled } from "@mui/material/styles";
import {
  Table,
  Paper,
  Button,
  Select,
  TableRow,
  Checkbox,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  InputLabel,
  ButtonGroup,
  FormControl,
  TableContainer,
  TablePagination,
} from "@mui/material";

import { localUrl } from "../../../../utils/util";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllHotels,
  getHotelsByFilters,
  getHotelsCity,

} from "src/components/redux/reducers/hotel";
import { useLoader } from "../../../../utils/loader";
import { applyCoupon } from "src/components/redux/reducers/coupon";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.action.selected : "inherit",
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Bulk = () => {
  const data = useSelector((state) => state.hotel.data);
  const byCity = useSelector((state) => state.hotel.byCity);
  const byFilter = useSelector((state) => state.hotel.byFilter);
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isAcceptedFilter, setIsAcceptedFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotels, setSelectedHotels] = useState(new Set());
  const [action, setAction] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getAllHotelsData = async () => {
    try {
      await dispatch(getAllHotels());
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to fetch hotels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllHotelsData();
    dispatch(getHotelsCity());
  }, [dispatch]);

  useEffect(() => {
    if (action === "applyCoupon" && selectedHotels.size > 0) {
      const selectedData = data.filter((hotel) =>
        selectedHotels.has(hotel.hotelId),
      );

      const roomTypes = new Set();

      selectedData.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          if (room.type) {
            roomTypes.add(room.type);
          }
        });
      });

      setAvailableRoomTypes(Array.from(roomTypes));
    }
  }, [action, selectedHotels, data]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleCityChange = async (event) => {
    setSelectedCity(event.target.value);
    await dispatch(getHotelsByFilters(event.target.value));
  };

  const hotelToShow = selectedCity ? byFilter?.data : data;

  const filteredData = hotelToShow?.filter((hotel) => {
    const matchesSearchQuery =
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery);

    const matchesAcceptedFilter =
      isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;

    return matchesSearchQuery && matchesAcceptedFilter;
  });

  const paginatedData = filteredData?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const getMinRoomPrice = (rooms) => {
    if (!rooms || rooms.length === 0) return 0;
    return Math.min(...rooms.map((room) => room.price)).toFixed(2);
  };

  const handleHotelSelect = (hotelId) => {
    setSelectedHotels((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(hotelId)) {
        newSelection.delete(hotelId);
      } else {
        newSelection.add(hotelId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedHotels.size === paginatedData.length) {
      setSelectedHotels(new Set());
    } else {
      setSelectedHotels(new Set(paginatedData.map((hotel) => hotel.hotelId)));
    }
  };

  const exportToExcel = () => {
    const ids = Array.from(selectedHotels);
    if (ids.length === 0) return toast.warning("No hotels selected.");

    const selectedData = data.filter((hotel) =>
      selectedHotels.has(hotel.hotelId),
    );

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Hotels");

    XLSX.writeFile(wb, "Selected_Hotels.xlsx");
    toast.success("Exported selected hotels to Excel.");
  };

  const executeAction = async () => {
    const ids = Array.from(selectedHotels);
    if (ids.length === 0) return toast.warning("No hotels selected.");

    if (action === "export") {
      exportToExcel();
      return;
    }

    if (action === "applyCoupon") {
      if (!couponCode) return toast.warning("Please enter a coupon code.");
      if (!selectedRoomType)
        return toast.warning("Please select a room type.");

      showLoader();
      try {
        const selectedData = data.filter((hotel) => ids.includes(hotel.hotelId));
        const roomIds = [];

        selectedData.forEach((hotel) => {
          hotel.rooms?.forEach((room) => {
            if (room.type === selectedRoomType) {
              roomIds.push(room.roomId);
            }
          });
        });

        if (roomIds.length === 0) {
          toast.warning("No rooms found for selected room type.");
          return;
        }

        const payload = {
          couponCode,
          hotelIds: ids,
          roomIds,
        };

        await dispatch(applyCoupon(payload)).unwrap();
        toast.success("Coupon applied successfully!");
      } catch (error) {
        console.error("Error applying coupon:", error);
        toast.error(
          error?.message || error?.error || "Failed to apply coupon",
        );
      } finally {
        hideLoader();
      }
    }

    // Implement other actions (remove, accept, etc.) here...
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Hotel Management
      </Typography>

      <TextField
        label="Search..."
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ ml: 2, mb: 2, width: "100px", height: "20px" }}
      />

      <FormControl sx={{ ml: 2, mb: 2, width: "150px" }}>
        <InputLabel id="city-select-label">Search by City</InputLabel>
        <Select
          labelId="city-select-label"
          value={selectedCity}
          onChange={handleCityChange}
          variant="outlined"
        >
          {byCity.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" sx={{ ml: 2, mb: 2, minWidth: 120 }}>
        <InputLabel>Action</InputLabel>
        <Select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          label="Action"
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="remove">Remove Hotels</MenuItem>
          <MenuItem value="accept">Accept Hotels</MenuItem>
          <MenuItem value="move">Move to Front Page</MenuItem>
          <MenuItem value="removeFront">Remove from Front Page</MenuItem>
          <MenuItem value="applyCoupon">Apply Coupon</MenuItem>
          <MenuItem value="removeCoupon">Remove Coupon</MenuItem>
          <MenuItem value="export">Export Selected</MenuItem>
          <MenuItem value="delete">Delete Permanently</MenuItem>
        </Select>
      </FormControl>

      {action === "applyCoupon" && (
        <>
          <TextField
            label="Coupon Code"
            variant="outlined"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            sx={{ ml: 2, mb: 2, width: "150px" }}
          />
          <FormControl sx={{ ml: 2, mb: 2, width: "150px" }}>
            <InputLabel id="room-type-label">Room Type</InputLabel>
            <Select
              labelId="room-type-label"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              label="Room Type"
            >
              {availableRoomTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <ButtonGroup variant="contained" sx={{ ml: 2, mb: 2 }} size="small">
        <Button sx={{ minWidth: 100 }} onClick={executeAction}>
          {action === "export" ? "Export Selected" : "Execute Action"}
        </Button>
        <Button
          sx={{ minWidth: 100 }}
          variant="outlined"
          onClick={handleSelectAll}
        >
          {selectedHotels?.size === paginatedData?.length
            ? "Deselect All"
            : "Select All"}
        </Button>
      </ButtonGroup>

      <ButtonGroup variant="contained" sx={{ ml: 2, mb: 2 }} size="small">
        <Button sx={{ minWidth: 50 }} onClick={() => setIsAcceptedFilter(null)}>
          All
        </Button>
        <Button sx={{ minWidth: 50 }} onClick={() => setIsAcceptedFilter(true)}>
          Accepted
        </Button>
        <Button sx={{ minWidth: 50 }} onClick={() => setIsAcceptedFilter(false)}>
          Not Accepted
        </Button>
      </ButtonGroup>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Select</StyledTableCell>
                <StyledTableCell>Hotel Name</StyledTableCell>
                <StyledTableCell>Owner Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Published</StyledTableCell>
                <StyledTableCell>Min Room Price ($)</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData?.map((hotel) => (
                <StyledTableRow
                  key={hotel.hotelId}
                  selected={selectedHotels.has(hotel.hotelId)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedHotels.has(hotel.hotelId)}
                      onChange={() => handleHotelSelect(hotel.hotelId)}
                    />
                  </TableCell>
                  <TableCell>{hotel.hotelName}</TableCell>
                  <TableCell>{hotel.hotelOwnerName}</TableCell>
                  <TableCell>{hotel.hotelEmail}</TableCell>
                  <TableCell>
                    {new Date(hotel.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getMinRoomPrice(hotel.rooms)}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </div>
  );
};

export default Bulk;

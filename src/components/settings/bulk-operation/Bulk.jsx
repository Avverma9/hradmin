/* eslint-disable consistent-return */
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  ButtonGroup,
  FormControl,
  TablePagination,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  getAllHotels,
  getHotelsByFilters,
  getHotelsCity,
} from "src/components/redux/reducers/hotel";
import { useLoader } from "../../../../utils/loader";
import {
  getCouponAppliedHotels,
} from "src/components/redux/reducers/coupon";
import HotelTable from "./hotel-table";
import { executeBulkAction } from "./bulkUtils";
const Bulk = () => {
  const data = useSelector((state) => state.hotel.data);
  const byCity = useSelector((state) => state.hotel.byCity);
  const byFilter = useSelector((state) => state.hotel.byFilter);
  const applied = useSelector((state) => state.coupon.applied);
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
      toast.error("Failed to fetch hotels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllHotelsData();
    dispatch(getHotelsCity());
    dispatch(getCouponAppliedHotels());
  }, [dispatch]);

  const getAppliedCouponHotels = async () => {
    try {
      await dispatch(getCouponAppliedHotels());
    } catch (error) {
      toast.error("Failed to fetch hotels with applied coupons.");
    }
  };
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

    if (action === "removeCoupon") {
      getAppliedCouponHotels();
    }
  }, [action, selectedHotels, data]);

  useEffect(() => {
    if (data?.length > 0) {
      const allRoomTypes = new Set();
      data.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          if (room.type) {
            allRoomTypes.add(room.type);
          }
        });
      });
      setAvailableRoomTypes(Array.from(allRoomTypes));
    }
  }, [data]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };
  const handleCityChange = async (event) => {
    setSelectedCity(event.target.value);
    await dispatch(getHotelsByFilters(event.target.value));
  };
  const hotelToShow =
    action === "removeCoupon"
      ? applied // Show only hotels with coupons applied
      : selectedCity !== "All City" && selectedCity
        ? byFilter?.data
        : data;

  const filteredData = hotelToShow?.filter((hotel) => {
    const matchesSearchQuery =
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery);

    const matchesAcceptedFilter =
      isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;

    const matchesRoomType =
      action !== "applyCoupon" ||
      !selectedRoomType ||
      hotel.rooms?.some((room) => room.type === selectedRoomType);

    return matchesSearchQuery && matchesAcceptedFilter && matchesRoomType;
  });

  const paginatedData = filteredData?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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

  const executeAction = async () => {
    await executeBulkAction({
      action,
      selectedHotels,
      data,
      couponCode,
      selectedRoomType,
      dispatch,
      showLoader, hideLoader
    });
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
          <MenuItem value="All City">All City</MenuItem>
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
          <MenuItem value="moveFrom">Move to Front Page</MenuItem>
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
        <Button
          sx={{ minWidth: 50 }}
          onClick={() => setIsAcceptedFilter(false)}
        >
          Not Accepted
        </Button>
      </ButtonGroup>
      <HotelTable
        data={paginatedData}
        selectedHotels={selectedHotels}
        handleHotelSelect={handleHotelSelect}
      />
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

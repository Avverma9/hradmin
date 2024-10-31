/* eslint-disable consistent-return */
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
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
} from '@mui/material';

import { localUrl } from '../../../../utils/util';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHotels } from 'src/components/redux/reducers/hotel';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.action.selected : 'inherit',
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Bulk = () => {
  const data = useSelector((state) => state.hotel.data);

  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptedFilter, setIsAcceptedFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotels, setSelectedHotels] = useState(new Set());
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

  const getAllHotelsData = async () => {
    try {
      await dispatch(getAllHotels());
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllHotelsData();
  }, [dispatch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredData = data.filter((hotel) => {
    const matchesSearchQuery =
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery);

    const matchesAcceptedFilter =
      isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;

    return matchesSearchQuery && matchesAcceptedFilter;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const executeAction = async () => {
    const ids = Array.from(selectedHotels);
    if (ids.length === 0) return toast.warning('No hotels selected.');

    let endpoint;
    switch (action) {
      case 'remove':
        endpoint = '/remove/hotels';
        break;
      case 'accept':
        endpoint = '/accept/hotels';
        break;
      case 'move':
        endpoint = '/move/to/frontpage';
        break;
      case 'removeFront':
        endpoint = '/remove/from/frontpage';
        break;
      case 'applyCoupon':
        endpoint = '/apply/coupon';
        break;
      case 'removeCoupon':
        endpoint = '/remove-bulk-coupons-from-hotels/by-hotel/id';
        break;
      case 'export':
        return; // This will be handled by a separate function.
      case 'delete':
        endpoint = '/delete/hotels';
        break;
      default:
        return toast.warning('Please select an action.');
    }

    try {
      const response = await fetch(`${localUrl}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelIds: ids }),
      });
      if (response.ok) {
        toast.success(`Action "${action}" executed successfully.`);
        getAllHotels(); // Refresh the list
      } else {
        toast.error(`Failed to execute action "${action}".`);
      }
    } catch (error) {
      console.error(`Error executing action "${action}":`, error);
      toast.error(`An error occurred while executing action "${action}".`);
    }
  };

  const exportToExcel = () => {
    const ids = Array.from(selectedHotels);
    if (ids.length === 0) return toast.warning('No hotels selected.');

    const selectedData = data.filter((hotel) => selectedHotels.has(hotel.hotelId));

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Selected Hotels');

    XLSX.writeFile(wb, 'Selected_Hotels.xlsx');
    toast.success('Exported selected hotels to Excel.');
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
        sx={{ ml: 2, mb: 2, width: '100px', height: '20px' }} // Adjust width and height
      />

      <FormControl variant="outlined" sx={{ ml: 2, mb: 2, minWidth: 120 }}>
        <InputLabel>Action</InputLabel>
        <Select value={action} onChange={(e) => setAction(e.target.value)} label="Action">
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
      <ButtonGroup variant="contained" sx={{ ml: 2, mb: 2 }} size="small">
        <Button
          sx={{ minWidth: 100 }}
          onClick={action === 'export' ? exportToExcel : executeAction}
        >
          {action === 'export' ? 'Export Selected' : 'Execute Action'}
        </Button>

        <Button sx={{ minWidth: 100 }} variant="outlined" onClick={handleSelectAll}>
          {selectedHotels.size === paginatedData.length ? 'Deselect All' : 'Select All'}
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
        <Button sx={{ minWidth: 50 }} onClick={() => setIsAcceptedFilter(false)}>
          Offered
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
              {paginatedData.map((hotel) => (
                <StyledTableRow key={hotel.hotelId} selected={selectedHotels.has(hotel.hotelId)}>
                  <TableCell>
                    <Checkbox
                      checked={selectedHotels.has(hotel.hotelId)}
                      onChange={() => handleHotelSelect(hotel.hotelId)}
                    />
                  </TableCell>
                  <TableCell>{hotel.hotelName}</TableCell>
                  <TableCell>{hotel.hotelOwnerName}</TableCell>
                  <TableCell>{hotel.hotelEmail}</TableCell>
                  <TableCell>{new Date(hotel.createdAt).toLocaleDateString()}</TableCell>
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
        count={filteredData.length}
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

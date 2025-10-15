import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
} from '@mui/material';
import { Search, FileDownload, Clear } from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import 'react-toastify/dist/ReactToastify.css';
import { fDate, fDateTime } from '../../../../utils/format-time';
import { useLoader } from '../../../../utils/loader';
import { getHotelsCity } from 'src/components/redux/reducers/hotel';
import { fetchFilteredBookings, searchBooking } from 'src/components/redux/reducers/booking';
import BookingUpdateModal from 'src/components/bookings/booking-update-modal';
import { hotelEmail } from '../../../../utils/util';

const STATUS_OPTIONS = ['', 'Confirmed', 'Pending', 'Cancelled', 'Checked-in', 'Checked-out'];
const PAGE_SIZE = 10;

const StatusChip = ({ status }) => {
  const map = {
    Confirmed: { color: 'success', label: 'Confirmed' },
    Pending: { color: 'warning', label: 'Pending' },
    Cancelled: { color: 'error', label: 'Cancelled' },
    'Checked-in': { color: 'primary', label: 'Checked-in' },
    'Checked-out': { color: 'info', label: 'Checked-out' },
  };
  const { color, label } = map[status] || { color: 'default', label: status || 'N/A' };
  return <Chip label={label} color={color} size="small" variant="filled" />;
};

export default function PanelBookings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  const cities = useSelector((s) => s.hotel.byCity);
  const filtered = useSelector((s) => s.booking.filtered);
  const searchResults = useSelector((s) => s.booking.search);
  const all = searchResults.length ? searchResults : filtered;

  const [filters, setFilters] = useState({
    bookingId: '',
    couponCode: '',
    city: '',
    status: '',
    date: '',
  });
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Load cities once
  useEffect(() => {
    dispatch(getHotelsCity());
    return () => dispatch({ type: 'booking/clearSearch' });
  }, [dispatch]);

  // Fetch bookings on filter change
  useEffect(() => {
    const timer = setTimeout(async () => {
      showLoader();
      try {
        const params = new URLSearchParams();
        filters.status && params.append('bookingStatus', filters.status);
        filters.date && params.append('date', filters.date);
        filters.city && params.append('hotelCity', filters.city);
        hotelEmail && params.append('createdBy', hotelEmail);
        await dispatch(fetchFilteredBookings(params.toString()));
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        hideLoader();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, filters]);

  // Update table rows
  useEffect(() => {
    setRows(all.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(all.length > PAGE_SIZE);
  }, [all]);

  const loadMore = useCallback(() => {
    const next = (page + 1) * PAGE_SIZE;
    setRows(all.slice(0, next + PAGE_SIZE));
    setPage((p) => p + 1);
    setHasMore(all.length > (page + 2) * PAGE_SIZE);
  }, [all, page]);

  const handleFilterChange = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const handleSearch = async () => {
    if (!filters.bookingId && !filters.couponCode) {
      toast.warn('Enter Booking ID or Coupon Code');
      return;
    }
    showLoader();
    try {
      await dispatch(
        searchBooking({
          bookingId: filters.bookingId,
          couponCode: filters.couponCode,
        })
      );
    } catch {
      toast.error('Search failed');
    } finally {
      hideLoader();
    }
  };

  const clearAll = () => {
    setFilters({ bookingId: '', couponCode: '', city: '', status: '', date: '' });
    dispatch({ type: 'booking/clearSearch' });
  };

  const exportCSV = () => {
    if (!all.length) {
      toast.info('No data to export');
      return;
    }
    const hdr = [
      'Booking ID',
      'User',
      'Status',
      'Source',
      'Payment',
      'Check-In',
      'Check-Out',
      'Created By',
      'Created At',
    ];
    const data = all.map((b) => [
      b.bookingId,
      b.user?.name,
      b.bookingStatus,
      b.bookingSource || 'Site',
      b.pm || 'Offline',
      fDate(b.checkInDate),
      fDate(b.checkOutDate),
      `${b.createdBy?.user} (${b.createdBy?.email})`,
      fDateTime(b.createdAt),
    ]);
    const csv = [hdr, ...data].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        {/* Header */}
        <CardHeader
          title="Panel Bookings"
          subheader={`Total Bookings: ${all.length}`}
          action={
            <Tooltip title="Export CSV">
              <IconButton onClick={exportCSV}>
                <FileDownload />
              </IconButton>
            </Tooltip>
          }
          sx={{ px: 3, pt: 2 }}
        />
        <Divider />

        {/* Filters */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Booking ID"
                size="small"
                fullWidth
                value={filters.bookingId}
                onChange={handleFilterChange('bookingId')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Coupon Code"
                size="small"
                fullWidth
                value={filters.couponCode}
                onChange={handleFilterChange('couponCode')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>City</InputLabel>
                <Select value={filters.city} label="City" onChange={handleFilterChange('city')}>
                  <MenuItem value="">All Cities</MenuItem>
                  {cities.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={handleFilterChange('status')}>
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s || 'All Statuses'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.date}
                onChange={handleFilterChange('date')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2} container spacing={1}>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" onClick={handleSearch} startIcon={<Search />}>
                  Search
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" onClick={clearAll} startIcon={<Clear />}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Divider />

        {/* Table */}
        <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={rows.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            }
            endMessage={
              all.length > 0 && (
                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                  <strong>End of list</strong>
                </Typography>
              )
            }
            scrollableTarget="scrollableDiv"
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Check-In</TableCell>
                  <TableCell>Check-Out</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.bookingId} hover>
                    <TableCell>{b.bookingId}</TableCell>
                    <TableCell>{b.user?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <StatusChip status={b.bookingStatus} />
                    </TableCell>
                    <TableCell>{b.bookingSource || 'Site'}</TableCell>
                    <TableCell>{b.pm || 'Offline'}</TableCell>
                    <TableCell>{fDate(b.checkInDate)}</TableCell>
                    <TableCell>{fDate(b.checkOutDate)}</TableCell>
                    <TableCell>
                      {b.createdBy?.user} ({b.createdBy?.email})
                    </TableCell>
                    <TableCell>{fDateTime(b.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/your-booking-details/${b.bookingId}`)}>
                        View
                      </Button>
                      <Button size="small" color="warning" onClick={() => setModalData(b)}>
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfiniteScroll>
        </TableContainer>
      </Paper>

      {modalData && (
        <BookingUpdateModal
          open
          bookingData={modalData}
          onClose={() => setModalData(null)}
          onSave={() => setModalData(null)}
        />
      )}
    </Container>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiImage, FiClock, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Chip,
  Modal,
  Select,
  styled,
  Tooltip,
  MenuItem,
  Container,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  CircularProgress,
  Button,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { fDateTime } from '../../../../utils/format-time';
import { localUrl, userName as name, hotelEmail as email, userId } from '../../../../utils/util';
import FeedbackDialog from './Feedback';
import { fetchUsers } from 'src/components/redux/reducers/user';

const COMPLAINT_STATUS = {
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  WORKING: 'Working',
  CLOSED: 'Closed',
};

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === COMPLAINT_STATUS.PENDING
      ? theme.palette.warning.main
      : status === COMPLAINT_STATUS.RESOLVED
      ? theme.palette.success.main
      : status === COMPLAINT_STATUS.WORKING
      ? theme.palette.info.main
      : status === COMPLAINT_STATUS.CLOSED
      ? theme.palette.error.main
      : theme.palette.grey[500],
  color: theme.palette.common.white,
  fontSize: '0.75rem',
  height: '24px',
  lineHeight: '1',
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(3),
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'clamp(300px, 80vw, 800px)',
  maxHeight: '90vh',
  overflowY: 'auto',
}));

const StyledModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(1),
}));

const CompactCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CardContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const ModalImage = styled('img')({
  width: '100%',
  height: 'auto',
  display: 'block',
  borderRadius: '8px',
});

const Complaint = () => {
  const dispatch = useDispatch();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [timelineOpen, setTimelineOpen] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create complaint form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [regarding, setRegarding] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [createHotelEmail, setCreateHotelEmail] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [issue, setIssue] = useState('');
  const [images, setImages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [fetchTimer, setFetchTimer] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [complaintId, setComplaintId] = useState('');
  const [viewFeedback, setViewFeedback] = useState('');

  const allUsers = useSelector((state) => (Array.isArray(state.user.userData) ? state.user.userData : []));

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${localUrl}/get/all-complaint-on-admin/panel`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const result = await response.json();
      setComplaints(result);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    dispatch(fetchUsers());
  }, [fetchComplaints, dispatch]);

  // Logic to fetch hotel details based on bookingId
  useEffect(() => {
    if (fetchTimer) clearTimeout(fetchTimer);
    if (bookingId) {
      const timer = setTimeout(async () => {
        setLoadingHotels(true);
        try {
          const response = await fetch(
            `${localUrl}/get/all/filtered/booking/by/query?bookingId=${bookingId}`
          );
          if (!response.ok) throw new Error('Could not fetch hotel details');
          const data = await response.json();
          setHotels(data || []);
        } catch (err) {
          console.error('Error fetching hotel data:', err);
          toast.error(err.message || 'Failed to fetch hotel data.');
          setHotels([]);
        } finally {
          setLoadingHotels(false);
        }
      }, 1500);
      setFetchTimer(timer);
    } else {
      setHotels([]);
      setLoadingHotels(false);
    }
    return () => {
      if (fetchTimer) clearTimeout(fetchTimer);
    };
  }, [bookingId]);

  const updateComplaintStatus = useCallback(
    async (id, status, feedBack) => {
      try {
        const updatedByEntry = {
          name,
          email,
          feedBack,
          status,
          updatedAt: new Date().toISOString(),
        };
        const response = await fetch(
          `${localUrl}/approveComplaint-on-panel/by-id/${id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, feedBack, updatedBy: updatedByEntry }),
          }
        );
        if (!response.ok) throw new Error('Failed to update status');

        setComplaints((prev) =>
          prev.map((c) =>
            c._id === id
              ? {
                  ...c,
                  status,
                  updatedBy: [...(c.updatedBy || []), updatedByEntry],
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
        toast.success('Status Updated!');
      } catch (err) {
        console.error('Error updating status:', err);
        toast.error('Failed to update status');
      } finally {
        setFeedbackOpen(false);
      }
    },
    []
  );

  const handleStatusChange = useCallback((id, status) => {
    setCurrentComplaintId(id);
    setNewStatus(status);
    setFeedbackOpen(true);
  }, []);

  const handleFeedbackSubmit = useCallback(
    (feedBack) => {
      if (currentComplaintId && newStatus) {
        updateComplaintStatus(currentComplaintId, newStatus, feedBack);
      }
    },
    [currentComplaintId, newStatus, updateComplaintStatus]
  );

  const handleOpenTimeline = useCallback((complaint) => {
    setSelectedComplaint(complaint);
    setTimelineOpen(true);
  }, []);

  const handleCloseTimeline = useCallback(() => {
    setTimelineOpen(false);
    setSelectedComplaint(null);
  }, []);

  const handleHotelChange = useCallback(
    (event) => {
      const selectedHotelId = event.target.value;
      const selectedHotel = hotels.find((h) => h?.hotelDetails?.hotelId === selectedHotelId);
      if (selectedHotel) {
        setHotelId(selectedHotel.hotelDetails.hotelId);
        setHotelName(selectedHotel.hotelDetails.hotelName);
        setCreateHotelEmail(selectedHotel.hotelDetails.hotelEmail);
      }
    },
    [hotels]
  );

  const resetCreateForm = () => {
    setRegarding('');
    setHotelName('');
    setHotelId('');
    setCreateHotelEmail('');
    setBookingId('');
    setIssue('');
    setImages([]);
    setHotels([]);
    setAssignedTo('');
  };

  const handleCreateComplaintSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData();
      formData.append('userId', complaintId);
      formData.append('regarding', regarding);
      formData.append('hotelName', hotelName);
      formData.append('hotelId', hotelId);
      formData.append('hotelEmail', createHotelEmail);
      formData.append('bookingId', bookingId);
      formData.append('issue', issue);
      if (assignedTo) {
        formData.append('assignedTo', assignedTo);
      }
      Array.from(images).forEach((file) => formData.append('images', file));

      try {
        const response = await fetch(`${localUrl}/create-a-complaint/on/hotel`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create complaint');
        }
        toast.success('Complaint created successfully!');
        setIsCreateModalOpen(false);
        fetchComplaints();
        resetCreateForm();
      } catch (err) {
        toast.error('Failed to create complaint.');
        console.error('Error creating complaint:', err);
      }
    },
    [
      userId,
      regarding,
      hotelName,
      hotelId,
      createHotelEmail,
      bookingId,
      issue,
      images,
      fetchComplaints,
      assignedTo,
    ]
  );

  const filteredComplaints = useMemo(
    () =>
      complaints?.filter((complaint) => {
        const searchTextLower = searchText.toLowerCase();
        const latestUpdate = complaint.updatedBy?.at(-1) || {};
        const matchesSearchText =
          complaint.hotelName?.toLowerCase().includes(searchTextLower) ||
          (latestUpdate.email || '').toLowerCase().includes(searchTextLower) ||
          complaint.complaintId?.includes(searchText);
        const matchesStatus = statusFilter === '' || complaint.status === statusFilter;
        return matchesSearchText && matchesStatus;
      }),
    [complaints, searchText, statusFilter]
  );

  const ComplaintTimeline = ({ open, onClose, timeline }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case COMPLAINT_STATUS.PENDING:
          return 'warning';
        case COMPLAINT_STATUS.RESOLVED:
          return 'success';
        case COMPLAINT_STATUS.WORKING:
          return 'info';
        case COMPLAINT_STATUS.CLOSED:
          return 'error';
        default:
          return 'grey';
      }
    };

    const sortedTimeline = useMemo(
      () =>
        timeline
          ? [...timeline].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
          : [],
      [timeline]
    );

    return (
      <Modal open={open} onClose={onClose}>
        <ModalContainer>
          <StyledModalHeader>
            <Typography variant="h6">Complaint Update History</Typography>
            <IconButton onClick={onClose} size="small">
              <FiX />
            </IconButton>
          </StyledModalHeader>
          {sortedTimeline.length > 0 ? (
            <Timeline position="alternate" sx={{ padding: 0 }}>
              {sortedTimeline.map((update, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(update.status)} />
                    {index < sortedTimeline.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        boxShadow: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {update.name}
                        </Typography>
                        <StatusChip status={update.status} label={update.status} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {fDateTime(update.updatedAt)}
                      </Typography>
                      {update.feedBack && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          **Feedback:** {update.feedBack}
                        </Typography>
                      )}
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <Typography color="text.secondary">No update history available.</Typography>
          )}
        </ModalContainer>
      </Modal>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Complaints List
        </Typography>
        <Button variant="contained" onClick={() => setIsCreateModalOpen(true)} size="large">
          Create New Complaint
        </Button>
      </Box>

      <Box
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by hotel name, email or complaint ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All</MenuItem>
                {Object.values(COMPLAINT_STATUS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {`Failed to load complaints: ${error}`}
        </Typography>
      ) : filteredComplaints.length > 0 ? (
        filteredComplaints.map((c) => {
          const latest = c.updatedBy?.at(-1) || {};
          return (
            <CompactCard key={c._id}>
              <CardHeader>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Complaint ID: {c.complaintId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regarding: {c.regarding}
                  </Typography>
                </Box>
                <StatusChip status={c.status} label={c.status} />
              </CardHeader>

              <CardContent>
                <Typography variant="body1">
                  <strong>Hotel:</strong> {c.hotelName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Issue:</strong> {c.issue}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {fDateTime(c.updatedAt)} by {latest.name || 'N/A'}
                </Typography>
              </CardContent>

              <ButtonsContainer>
                <Tooltip title="View Attachments">
                  <IconButton
                    onClick={() => {
                      setSelectedComplaint(c);
                      setOpenAttachmentsModal(true);
                    }}
                  >
                    <FiImage />
                  </IconButton>
                </Tooltip>

                <Tooltip title="See Updates">
                  <IconButton onClick={() => handleOpenTimeline(c)}>
                    <FiClock />
                  </IconButton>
                </Tooltip>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c._id, e.target.value)}
                    label="Status"
                  >
                    {Object.values(COMPLAINT_STATUS).map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ButtonsContainer>
            </CompactCard>
          );
        })
      ) : (
        <Typography align="center" color="text.secondary">
          No complaints found.
        </Typography>
      )}

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <Modal open={openAttachmentsModal} onClose={() => setOpenAttachmentsModal(false)}>
        <ModalContainer>
          <StyledModalHeader>
            <Typography variant="h6">Attachments</Typography>
            <IconButton onClick={() => setOpenAttachmentsModal(false)} size="small">
              <FiX />
            </IconButton>
          </StyledModalHeader>
          {selectedComplaint?.images?.length > 0 ? (
            selectedComplaint.images.map((img, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <ModalImage src={img} alt={`Attachment ${i + 1}`} />
              </Box>
            ))
          ) : (
            <Typography>No attachments available</Typography>
          )}
        </ModalContainer>
      </Modal>

      <ComplaintTimeline
        open={timelineOpen}
        onClose={handleCloseTimeline}
        timeline={selectedComplaint?.updatedBy}
      />

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalContainer>
          <StyledModalHeader>
            <Typography variant="h6">Create a New Complaint</Typography>
            <IconButton onClick={() => setIsCreateModalOpen(false)} size="small">
              <FiX />
            </IconButton>
          </StyledModalHeader>
          <Box component="form" onSubmit={handleCreateComplaintSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Booking ID"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="hotel-name-label">Hotel</InputLabel>
                  {loadingHotels ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 40,
                      }}
                    >
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <Select
                      labelId="hotel-name-label"
                      value={hotelId}
                      label="Hotel"
                      onChange={handleHotelChange}
                      disabled={!bookingId || hotels.length === 0}
                    >
                      {hotels.map((h) => (
                        <MenuItem key={h?.hotelDetails?.hotelId} value={h?.hotelDetails?.hotelId}>
                          {h?.hotelDetails?.hotelName}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Regarding</InputLabel>
                  <Select
                    value={regarding}
                    onChange={(e) => setRegarding(e.target.value)}
                    label="Regarding"
                  >
                    <MenuItem value="Booking">Booking</MenuItem>
                    <MenuItem value="Hotel">Hotel</MenuItem>
                    <MenuItem value="Website">Website</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12}>
                <Autocomplete
                  freeSolo
                  options={allUsers}
                  getOptionLabel={(option) =>
                    typeof option === 'string'
                      ? option
                      : `${option.userName || 'Unknown'} (${option.email})`
                  }
                  filterOptions={(options, state) =>
                    options.filter((user) =>
                      user.email.toLowerCase().includes(state.inputValue.toLowerCase())
                    )
                  }
                  inputValue={assignedTo}
                  onInputChange={(event, newInputValue) => {
                    setAssignedTo(newInputValue);
                  }}
                  onChange={(event, newValue) => {
                  if (newValue && newValue.email) {
                      setComplaintId(newValue.userId);
                    } else {
                      setAssignedTo('');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned To"
                      placeholder="Enter email"
                      size="small"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Issue Description"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="outlined" component="label" fullWidth size="small" sx={{ mb: 1 }}>
                  Upload Images (max 3)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => setImages(Array.from(e.target.files))}
                  />
                </Button>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ccc',
                      }}
                    >
                      <img
                        src={img instanceof File ? URL.createObjectURL(img) : img}
                        alt={`upload-${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                      >
                        &times;
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button variant="contained" type="submit">
                    Submit Complaint
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export default Complaint;
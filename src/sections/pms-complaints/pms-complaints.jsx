/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import { toast } from 'react-toastify';
/* eslint-disable no-shadow */
import { FiEye, FiImage } from 'react-icons/fi';
/* eslint-disable import/no-unresolved */
import React, { useMemo, useState, useEffect } from 'react';

import { Info } from '@mui/icons-material';
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
  IconButton as MuiIconButton,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';
import { localUrl, userName as name, hotelEmail as email } from 'src/utils/util';

import FeedbackDialog from '../settings/complaints/Feedback';

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'Pending'
      ? theme.palette.warning.main
      : status === 'Resolved'
      ? theme.palette.success.main
      : status === 'Working'
      ? theme.palette.info.main // You can adjust this color as needed
      : theme.palette.error.main,
  color: theme.palette.common.white,
  fontSize: '0.75rem',
}));

const FeedbackModalContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  maxWidth: '80%',
  maxHeight: '80%',
  overflowY: 'auto',
  padding: theme.spacing(3),
  position: 'relative',
}));

const FeedbackModalHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.25rem',
  marginBottom: theme.spacing(2),
}));

const FeedbackModalContent = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.5,
}));

const CloseButton = styled('button')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '1.5rem',
  color: theme.palette.text.primary,
}));

const CompactCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const CompactCardContent = styled(Box)(({ theme }) => ({
  flex: 1,
  marginLeft: theme.spacing(2),
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const AttachmentsButton = styled(MuiIconButton)(({ theme }) => ({
  // Adjust styling if needed
}));
const ComplaintId = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(0.5), // Adjust spacing to move it further up
  left: theme.spacing(0.5), // Adjust spacing to move it further left
  backgroundColor: theme.palette.grey[200],
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 'bold',
  fontSize: '0.75rem', // Adjust font size if necessary
  color: theme.palette.text.primary,
  zIndex: 1, // Ensure it appears above other content
}));
const ModalImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '100%',
  display: 'block',
  margin: 'auto',
}));

const ViewFeedbackButton = styled(MuiIconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [feedBack, setFeedback] = useState('');
  const [viewFeedback, setViewFeedback] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          status: statusFilter,
          complaintId: searchText,
          hotelEmail: email,
        }).toString();
        const response = await fetch(
          `${localUrl}/get/all-complaint-on-admin/panel/by-filter?${query}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch complaints');
        }
        const result = await response.json();
        setComplaints(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [searchText, statusFilter]);

  const updateComplaintStatus = async (id, newStatus, feedBack) => {
    try {
      const updatedBy = {
        name,
        email,
      };

      await fetch(`${localUrl}/approveComplaint-on-panel/by-id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, feedBack, updatedBy }),
      });

      const query = new URLSearchParams({
        status: statusFilter,
        complaintId: searchText,
        hotelEmail: email,
      }).toString();
      const response = await fetch(
        `${localUrl}/get/all-complaint-on-admin/panel/by-filter?${query}`
      );
      const updatedComplaints = await response.json();
      setComplaints(updatedComplaints);

      toast.success('Status Updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setFeedbackOpen(false);
      setFeedback('');
    }
  };

  const handleStatusChange = (id, status) => {
    setCurrentComplaintId(id);
    setNewStatus(status);
    setFeedbackOpen(true);
  };

  const handleFeedbackSubmit = (feedBack) => {
    if (currentComplaintId && newStatus) {
      updateComplaintStatus(currentComplaintId, newStatus, feedBack);
    }
  };

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleViewFeedback = (feedBack) => {
    setViewFeedback(feedBack);
  };

  const filteredComplaints = useMemo(
    () =>
      complaints?.filter((complaint) => {
        const matchesSearchText = complaint.complaintId
          .toLowerCase()
          .includes(searchText.toLowerCase());
        const matchesStatus = statusFilter === '' || complaint.status === statusFilter;
        return matchesSearchText && matchesStatus;
      }),
    [complaints, searchText, statusFilter]
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: '#3f51b5',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            background: 'black',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            fontFamily: 'Roboto, Arial, sans-serif',
          }}
        >
          Complaints List
        </Typography>

        {/* Search and Filter Controls */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter complaint id ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Working">Working</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body2" align="center" color="error">
            {`Failed to load complaints: ${error}`}
          </Typography>
        ) : filteredComplaints.length > 0 ? (
          <Box>
            {filteredComplaints.map((complaint) => (
              <CompactCard key={complaint._id}>
                <ComplaintId>{`${complaint.complaintId}`}</ComplaintId> {/* Display ID here */}
                <StatusChip label={complaint.status} status={complaint.status} />
                <CompactCardContent>
                  <Typography variant="body2">
                    <strong>Issue:</strong> {complaint.issue}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Hotel:</strong> {complaint.hotelName} | <strong>Regarding:</strong>{' '}
                    {complaint.regarding}
                  </Typography>
                  <Typography variant="caption" color="red">
                    Last status Changed on {fDateTime(complaint.updatedAt)}{' '}
                    <Tooltip
                      title={
                        <>
                          <Typography variant="body2">
                            <strong>Name:</strong> {complaint?.updatedBy?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {complaint?.updatedBy?.email || 'Not provided'}
                          </Typography>
                        </>
                      }
                      arrow
                    >
                      <IconButton size="small" aria-label="view-updater-info">
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </CompactCardContent>
                <ButtonsContainer>
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Working">Working</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                  <ViewFeedbackButton
                    aria-label="view-feedback"
                    onClick={() => handleViewFeedback(complaint.feedBack)}
                  >
                    <FiEye />
                  </ViewFeedbackButton>
                  <AttachmentsButton
                    aria-label="view-attachments"
                    onClick={() => handleOpenModal(complaint)}
                  >
                    <FiImage />
                  </AttachmentsButton>
                </ButtonsContainer>
              </CompactCard>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" align="center" color="textSecondary">
            No complaints found.
          </Typography>
        )}

        {/* Feedback Dialog */}
        {feedbackOpen && (
          <FeedbackDialog
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            onSubmit={handleFeedbackSubmit}
          />
        )}

        {/* Modal for Viewing Attachments */}
        {selectedComplaint && (
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Box
              sx={{
                maxWidth: '90%',
                maxHeight: '90%',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                selectedComplaint.images.map((image, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <ModalImage src={image} alt={`Attachment ${index + 1}`} />
                  </Box>
                ))
              ) : (
                <Typography>No attachments available</Typography>
              )}
            </Box>
          </Modal>
        )}

        {/* View Feedback Modal */}
        {viewFeedback && (
          <Modal
            open={!!viewFeedback}
            onClose={() => setViewFeedback('')}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FeedbackModalContainer style={{ width: '300px' }}>
              <CloseButton onClick={() => setViewFeedback('')}>&times;</CloseButton>
              <FeedbackModalHeader variant="h6">Feedback</FeedbackModalHeader>
              <FeedbackModalContent>{viewFeedback}</FeedbackModalContent>
            </FeedbackModalContainer>
          </Modal>
        )}
      </Box>
    </Container>
  );
};

export default Complaint;

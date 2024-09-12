/* eslint-disable no-nested-ternary */
import { toast } from 'react-toastify';
/* eslint-disable no-shadow */
import { FiImage } from 'react-icons/fi';
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';

import {
  Box,
  Chip,
  Modal,
  Select,
  styled,
  MenuItem,
  Container,
  Typography,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton as MuiIconButton,
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import { fDate } from 'src/utils/format-time';

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'Pending'
      ? theme.palette.warning.main
      : status === 'Resolved'
      ? theme.palette.success.main
      : theme.palette.error.main,
  color: theme.palette.common.white,
  fontSize: '0.75rem',
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

const ModalImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '100%',
  display: 'block',
  margin: 'auto',
}));

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`${localUrl}/get/all-complaint-on-admin/panel`); // Replace with your API endpoint
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
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${localUrl}/approveComplaint-on-panel/by-id/${id}`, {
        // Replace with your API endpoint
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === id ? { ...complaint, status: newStatus } : complaint
        )
      );
      toast.success("Status Updated !")
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

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

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body2" align="center" color="error">
            {`Failed to load complaints: ${error}`}
          </Typography>
        ) : complaints.length > 0 ? (
          <Box>
            {complaints.map((complaint) => (
              <CompactCard key={complaint._id}>
                <StatusChip label={complaint.status} status={complaint.status} />
                <CompactCardContent>
                  <Typography variant="body2">
                    <strong>Issue:</strong> {complaint.issue}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Hotel:</strong> {complaint.hotelName} | <strong>Regarding:</strong>{' '}
                    {complaint.regarding}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {fDate(complaint.createdAt)}
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
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
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
      </Box>
    </Container>
  );
};

export default Complaint;

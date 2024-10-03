/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Table,
  Paper,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { localUrl } from '../../../../utils/util';


const WhoSeen = ({ open, onClose, userIds }) => {
  const [seenBy, setSeenBy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeenBy = async () => {
      // Reset state before fetching
      setSeenBy([]);
      setLoading(true);
      setError(null);

      if (userIds.length > 0) {
        try {
          const response = await axios.post(
            `${localUrl}/seen/by/list/of/user/for/notification/userId`,
            { userIds }
          );
          setSeenBy(response.data);
        } catch (error) {
          setError('Error fetching seen by data.');
          console.error('Error fetching seen by data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // If there are no userIds, stop loading
      }
    };

    fetchSeenBy();
  }, [userIds]); // Ensure that userIds is correctly updated

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Who Has Seen This Notification</DialogTitle>
      <DialogContent>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60vh',
            }}
          >
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : seenBy.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seenBy.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography align="center">No data available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Define prop types
WhoSeen.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userIds: PropTypes.arrayOf(
    PropTypes.shape({
      $oid: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default WhoSeen;

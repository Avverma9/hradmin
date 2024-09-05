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
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { localUrl } from 'src/utils/util';

const WhoSeen = ({ open, onClose, userIds }) => {
  const [seenBy, setSeenBy] = useState([]);

  useEffect(() => {
    if (userIds.length > 0) {
      const fetchSeenBy = async () => {
        try {
          const response = await axios.post(
            `${localUrl}/seen/by/list/of/user/for/notification/userId`,
            { userIds }
          );
          setSeenBy(response.data);
        } catch (error) {
          console.error('Error fetching seen by data:', error);
        }
      };

      fetchSeenBy();
    }
  }, [userIds]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Who Has Seen This Notification</DialogTitle>
      <DialogContent>
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
  userIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default WhoSeen;

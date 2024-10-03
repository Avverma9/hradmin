import React from 'react';
import PropTypes from 'prop-types';
import { IoMdClose } from 'react-icons/io';

import {
  Table,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { fDateTime } from '../../../../utils/format-time';

const RoomModal = ({ open, handleClose, selectedHotel, handleOpenCouponModal }) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
    <DialogTitle>
      Rooms of {selectedHotel?.hotelName}
      <IconButton
        edge="end"
        color="inherit"
        onClick={handleClose}
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <IoMdClose />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      {selectedHotel?.rooms && selectedHotel.rooms.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Bed Types</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Count Rooms</TableCell>
              <TableCell>Offer Price Less</TableCell>
              <TableCell>Offer Expiry</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedHotel.rooms.map((room) => (
              <TableRow key={room.roomId}>
                <TableCell>{room.type}</TableCell>
                <TableCell>{room.bedTypes}</TableCell>
                <TableCell>{room.price}</TableCell>
                <TableCell>{room.countRooms}</TableCell>
                <TableCell>{room.offerPriceLess}</TableCell>
                <TableCell>{fDateTime(room.offerExp)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenCouponModal(room)}
                  >
                    Apply
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>No rooms available</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

RoomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedHotel: PropTypes.shape({
    hotelName: PropTypes.string,
    rooms: PropTypes.arrayOf(
      PropTypes.shape({
        roomId: PropTypes.number.isRequired,
        type: PropTypes.string,
        bedTypes: PropTypes.string,
        price: PropTypes.number,
        countRooms: PropTypes.number,
        offerPriceLess: PropTypes.number,
        offerExp: PropTypes.string,
      })
    ),
  }),
  handleOpenCouponModal: PropTypes.func.isRequired,
};

export default RoomModal;

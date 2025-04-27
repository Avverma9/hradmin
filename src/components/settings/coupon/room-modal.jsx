import React from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { IoMdClose } from "react-icons/io";
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
  Tooltip,
  Chip,
} from "@mui/material";
import { fDateTime, indianTime } from "../../../../utils/format-time";
import { removeBulkCoupon } from "src/components/redux/reducers/coupon";
import { useLoader } from "../../../../utils/loader";

const RoomModal = ({
  open,
  handleClose,
  selectedHotel,
  handleOpenCouponModal,
}) => {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const removeCoupon = async () => {
    try {
      const payload = {
        hotelIds: [selectedHotel.hotelId],
      };
      showLoader();
      await dispatch(removeBulkCoupon(payload)).unwrap();
      window.location.reload();
    } catch (error) {
      console.error("Failed to remove coupon:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h6">Rooms - {selectedHotel?.hotelName}</Typography>
        <IconButton
          edge="end"
          onClick={handleClose}
          aria-label="close"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <IoMdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2 }}>
        {selectedHotel?.rooms && selectedHotel.rooms.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Bed</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Rooms</TableCell>
                <TableCell>Offer ₹</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedHotel.rooms.map((room) => (
                <TableRow key={room.roomId} hover>
                  <TableCell
                    sx={{
                      maxWidth: 150,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography variant="body2">
                      {room.type}
                      {room.isOffer && (
                        <Tooltip title="Offer Running">
                          <Chip
                            size="small"
                            label="Offer"
                            color="primary"
                            sx={{
                              ml: 1,
                              height: "20px",
                              fontSize: "0.7rem",
                            }}
                          />
                        </Tooltip>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>{room.bedTypes || "-"}</TableCell>
                  <TableCell>₹{room.price}</TableCell>
                  <TableCell>{room.countRooms}</TableCell>
                  <TableCell>
                    {room.isOffer ? `₹${room.offerPriceLess}` : "-"}
                  </TableCell>
                  <TableCell>
                    {room.isOffer ? indianTime(room.offerExp) : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {room.isOffer ? (
                      <Tooltip title="Remove Offer">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={removeCoupon}
                        >
                          Remove
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Apply Offer">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenCouponModal(room)}
                        >
                          Apply
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No rooms available.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ pr: 2, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

RoomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedHotel: PropTypes.shape({
    hotelId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    hotelName: PropTypes.string,
    rooms: PropTypes.arrayOf(
      PropTypes.shape({
        roomId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
          .isRequired,
        type: PropTypes.string,
        bedTypes: PropTypes.string,
        price: PropTypes.number,
        countRooms: PropTypes.number,
        offerPriceLess: PropTypes.number,
        offerExp: PropTypes.string,
        isOffer: PropTypes.bool,
      }),
    ),
  }),
  handleOpenCouponModal: PropTypes.func.isRequired,
};

export default RoomModal;

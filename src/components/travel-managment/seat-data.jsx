import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSeatsData } from "../redux/reducers/travel/car";
import "./seat.css";
import { FaChair } from "react-icons/fa";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

export default function SeatData({ open, onClose, id }) {
  const dispatch = useDispatch();
  const seatData = useSelector((state) => state.car.seatsData);

  useEffect(() => {
    if (id) {
      dispatch(getSeatsData(id));
    }
  }, [id, dispatch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Available seats</DialogTitle>
      <DialogContent>
        <div className="seat-container">
          {seatData &&
            Array.isArray(seatData) &&
            seatData?.map((car) =>
              car.seats.map((data) => (
                <div
                  key={data._id}
                  className={`seat ${data.isBooked ? "booked" : "available"}`}
                >
                  <FaChair className="seat-icon" />
                  <div className="seat-type">{data.seatType}</div>
                  <div className="seat-number">Seat: {data.seatNumber}</div>
                  <div className="seat-price">₹{data.seatPrice}</div>
                  {data.isBooked && <div className="booked-by">Booked</div>}
                </div>
              )),
            )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

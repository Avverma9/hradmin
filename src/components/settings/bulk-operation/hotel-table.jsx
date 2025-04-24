// src/components/HotelTable.js

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Button,
} from "@mui/material";

import { styled } from "@mui/material/styles";

const HotelTable = ({ selectedHotels, handleHotelSelect, data }) => {
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.common.white,
  }));

  const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
    backgroundColor: selected ? theme.palette.action.selected : "inherit",
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  const ViewButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  }));

  const getMinRoomPrice = (rooms) => {
    if (!rooms || rooms.length === 0) return 0;
    return Math.min(...rooms.map((room) => room.price)).toFixed(2);
  };

  const viewHotel = (id) => {
    window.location.href = `view-hotel-details/${id}`;
  };

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Select</StyledTableCell>
            <StyledTableCell>Hotel Name</StyledTableCell>
            <StyledTableCell>Owner Name</StyledTableCell>
            <StyledTableCell>On front</StyledTableCell>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>Min Room Price</StyledTableCell>
            <StyledTableCell>Action</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((hotel) => (
            <StyledTableRow
              key={hotel.hotelId}
              selected={selectedHotels.has(hotel.hotelId)}
            >
              <TableCell>
                <Checkbox
                  checked={selectedHotels.has(hotel.hotelId)}
                  onChange={() => handleHotelSelect(hotel.hotelId)}
                />
              </TableCell>
              <TableCell>
                {hotel.hotelName}
                {hotel.rooms?.some((room) => room.isOffer) && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginLeft: 8,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#2196f3',
                    }}
                    title="Offer Available"
                  />
                )}
              </TableCell>


              <TableCell>{hotel.hotelOwnerName}</TableCell>
              <TableCell>{hotel?.onFront ? "Yes" : "No"}</TableCell>
              <TableCell>
                {hotel.isAccepted ? "Accepted" : "Not Accepted"}
              </TableCell>
              <TableCell>{getMinRoomPrice(hotel.rooms)}</TableCell>
              <TableCell>
                <ViewButton size="small" onClick={() => viewHotel(hotel?.hotelId)}>
                  View
                </ViewButton>
              </TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HotelTable;
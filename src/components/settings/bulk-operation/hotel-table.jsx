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
  const getMinRoomPrice = (rooms) => {
    if (!rooms || rooms.length === 0) return 0;
    return Math.min(...rooms.map((room) => room.price)).toFixed(2);
  };

  console.log("data", data);
  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Select</StyledTableCell>
            <StyledTableCell>Hotel Name</StyledTableCell>
            <StyledTableCell>Owner Name</StyledTableCell>
            <StyledTableCell>Email</StyledTableCell>
            <StyledTableCell>Published</StyledTableCell>
            <StyledTableCell>Min Room Price ($)</StyledTableCell>
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
              <TableCell>{hotel.hotelName}</TableCell>
              <TableCell>{hotel.hotelOwnerName}</TableCell>
              <TableCell>{hotel.hotelEmail}</TableCell>
              <TableCell>
                {new Date(hotel.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{getMinRoomPrice(hotel.rooms)}</TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HotelTable;

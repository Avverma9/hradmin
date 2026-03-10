/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { LuBedDouble } from "react-icons/lu";
import React, { useState, useEffect } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

import {
  Box,
  Grid,
  Modal,
  Input,
  Select,
  Button,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  useMediaQuery,
} from "@mui/material";

import { localUrl } from "../../../utils/util";


import "./button.css";
import {
  Header,
  RoomItem,
  RoomImage,
  RoomActions,
  RoomDetails,
  ModalContent,
  ImagePreview,
  UploadButton,
} from "./view/manageRoomsCss";
import { useBedTypes } from "../../../utils/additional/bedTypes";
import { useRoomTypes } from "../../../utils/additional/roomTypes";

const AddRoomModal = ({ open, onClose, hotelId, onUpdated = () => {} }) => {
  const [roomType, setRoomType] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [bedTypesValue, setBedTypesValue] = useState("");
  const [countRooms, setCountRooms] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [soldOut, setSoldOut] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bedTypes = useBedTypes()
  const roomTypes = useRoomTypes()
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const fetchRooms = () => {
    axios
      .get(`${localUrl}/hotels/get-by-id/${hotelId}`)
      .then((response) => {
        const hotelData = response?.data?.data ?? response?.data ?? {};
        const roomList = Array.isArray(hotelData?.rooms) ? hotelData.rooms : [];

        const normalizedRooms = roomList.map((room, index) => ({
          ...room,
          roomId: room?.roomId || room?.id || room?._id || `room-${index}`,
          type: room?.type || room?.name || "Room",
          bedTypes: room?.bedTypes || room?.bedType || "",
          price: room?.price ?? room?.pricing?.finalPrice ?? room?.pricing?.basePrice ?? "",
          countRooms: room?.countRooms ?? room?.inventory?.available ?? 0,
          totalRooms: room?.totalRooms ?? room?.inventory?.total ?? 0,
          soldOut: room?.soldOut ?? false,
          isOffer: room?.isOffer ?? room?.features?.isOffer ?? false,
          images: Array.isArray(room?.images) ? room.images[0] || "" : room?.images || "",
        }));

        setRooms(normalizedRooms);
      })
      .catch(() => {
        console.error("Error fetching rooms");
        setRooms([]);
      });
  };

  useEffect(() => {
    if (hotelId) {
      fetchRooms(); // Fetch rooms when hotelId changes
    }
  }, [hotelId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleAddRoom = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("hotelId", hotelId);
    formData.append("type", roomType);
    formData.append("price", roomPrice);
    formData.append("bedTypes", bedTypesValue);
    formData.append("countRooms", countRooms);
    formData.append("totalRooms", totalRooms || countRooms);
    formData.append("soldOut", soldOut);

    images.forEach((file) => {
      formData.append("images", file);
    });

    axios
      .post(`${localUrl}/create-a-room-to-your-hotel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Room added successfully");
        fetchRooms();
        onUpdated();
        resetForm(); // Clear form after success
      })
      .catch(() => {
        toast.error("Error adding room");
      })
      .finally(() => {
        setLoading(false);
        setIsAddingRoom(false);
      });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRoomType("");
    setRoomPrice("");
    setBedTypesValue("");
    setCountRooms("");
    setTotalRooms("");
    setImages([]); // Clear images
    setCurrentRoomId(null);
    setSoldOut(false);
    setIsAddingRoom(false);
  };

  const handleDelete = (roomId) => {
    axios
      .request({
        url: `${localUrl}/delete-rooms-by-id`,
        method: "DELETE",
        data: { roomId },
      })
      .then(() => {
        toast.success("Room deleted successfully");
        fetchRooms();
        onUpdated();
      })
      .catch(() => {
        toast.error("Error deleting room");
      });
  };

  const handleUpdateRoom = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("roomId", currentRoomId);
    formData.append("type", roomType);
    formData.append("price", roomPrice);
    formData.append("bedTypes", bedTypesValue);
    formData.append("countRooms", countRooms);
    formData.append("totalRooms", totalRooms || countRooms);
    formData.append("soldOut", soldOut);

    images.forEach((file) => {
      formData.append("images", file);
    });

    axios
      .patch(`${localUrl}/update-your/room`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Room updated successfully");
        fetchRooms();
        onUpdated();
        resetForm(); // Clear form after success
      })
      .catch(() => {
        toast.error("Error updating room");
      })
      .finally(() => {
        setLoading(false);
        setIsAddingRoom(false);
      });
  };

  const handleEdit = (room) => {
    setRoomType(room.type);
    setRoomPrice(room.price);
    setBedTypesValue(room.bedTypes);
    setCountRooms(room.countRooms);
    setTotalRooms(room.totalRooms);
    setImages([]); // Optionally clear images or handle images differently
    setCurrentRoomId(room.roomId);
    setSoldOut(Boolean(room.soldOut));
    setIsAddingRoom(true);
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <ModalContent>
        <Header>
          <Typography variant="h6">
            {isAddingRoom
              ? currentRoomId
                ? "Update Room"
                : "Add Room"
              : "Available Hotel Rooms"}
          </Typography>
          <Button onClick={handleCancel} color="inherit">
            Close
          </Button>
        </Header>
        {!isAddingRoom ? (
          <>
            {Array.isArray(rooms) && rooms.length > 0 ? (
              <Box>
                {rooms.map((room, index) => (
                  <RoomItem key={index}>
                    <RoomImage src={room?.images} alt={`room ${index}`} />
                    <RoomDetails>
                      <Typography variant="h6">
                        {room?.type}
                        {room.isOffer && (
                          <span
                            style={{
                              marginLeft: 8,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "#2196f3",
                              display: "inline-block",
                            }}
                            title="Offer Available"
                          />
                        )}
                      </Typography>
                      <Typography style={{ color: "red" }} variant="body1">
                        <FaIndianRupeeSign /> {room?.price}
                      </Typography>
                      <Typography variant="body1">
                        <LuBedDouble /> {room?.bedTypes}
                      </Typography>
                      <Typography style={{ color: "green" }} variant="body2">
                        Available Rooms - {room?.countRooms}
                      </Typography>
                    </RoomDetails>
                    <RoomActions>
                      <button
                        className="custom-button"
                        onClick={() => handleDelete(room.roomId)}
                        startIcon={<AiOutlineDelete />}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEdit(room)}
                        className="custom-button"
                        startIcon={<AiOutlineEdit />}
                      >
                        Update
                      </button>
                    </RoomActions>
                  </RoomItem>
                ))}
              </Box>
            ) : (
              <>
                <Typography>This hotel has no room availability.</Typography>
                <img
                  src="https://images.tv9kannada.com/wp-content/uploads/2022/03/sorry.jpg"
                  alt="No room"
                  style={{ width: "100px", height: "auto" }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    label="Room Type"
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type._id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Room Price"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={roomPrice}
                  onChange={(e) => setRoomPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Bed Type</InputLabel>
                  <Select
                    value={bedTypesValue}
                    onChange={(e) => setBedTypesValue(e.target.value)}
                    label="Bed Type"
                  >
                    {bedTypes.map((type) => (
                      <MenuItem key={type._id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Available rooms"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={countRooms}
                  onChange={(e) => setCountRooms(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total rooms"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Input
                  type="file"
                  inputProps={{ multiple: true }}
                  onChange={handleFileChange}
                  sx={{ display: "none" }}
                  id="upload-file"
                />
                <label htmlFor="upload-file">
                  <UploadButton component="span">Choose Images</UploadButton>
                </label>
                <ImagePreview>
                  {images.length > 0 &&
                    images.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`File ${index}`}
                        style={{
                          width: isMobile ? "60px" : "80px",
                          height: isMobile ? "60px" : "80px",
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ))}
                </ImagePreview>
              </Grid>
            </Grid>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="custom-button"
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={currentRoomId ? handleUpdateRoom : handleAddRoom}
                className="custom-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : currentRoomId
                    ? "Update Room"
                    : "Add Room"}
              </Button>
            </div>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {!isAddingRoom && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddingRoom(true)}
            >
              Add Room
            </Button>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

AddRoomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
  onUpdated: PropTypes.func,
};

export default AddRoomModal;

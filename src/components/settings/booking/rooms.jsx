import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Box,
} from "@mui/material";

export default function Rooms({
  rooms = [],
  onRoomSelect,
  divRef,
  selectedRooms,
}) {
  const handleRoomClick = (room) => {
    // This logic correctly toggles the room selection.
    onRoomSelect(room);
  };

  return (
    <Box sx={{ padding: 1 }} ref={divRef}>

      {rooms.length === 0 ? (
        <Typography variant="h6">No rooms available</Typography>
      ) : (
        <Grid container spacing={2}>

          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={6} lg={6} key={room.roomId}>

              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  border: selectedRooms.some((r) => r.roomId === room.roomId)
                    ? "2px solid"
                    : "1px solid",
                  borderColor: selectedRooms.some(
                    (r) => r.roomId === room.roomId,
                  )
                    ? "primary.main"
                    : "divider",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                  position: "relative", // Added for absolute positioning of the badge
                }}
              >
                {room.countRooms === 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "error.main",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      zIndex: 1, // Ensure it's above other card content
                    }}
                  >
                    Sold Out
                  </Box>
                )}

                <CardMedia
                  component="img"
                  sx={{
                    height: 180,
                    objectFit: "cover",
                  }}
                  image={
                    room?.images?.[0] ||
                    "https://www.thespruce.com/thmb/2_Q52GK3rayV1wnqm6vyBvgI3Ew=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/put-together-a-perfect-guest-room-1976987-hero-223e3e8f697e4b13b62ad4fe898d492d.jpg"
                  }
                  alt={`Room Image - ${room?.type || "Unknown"}`}
                />

                <CardContent sx={{ flexGrow: 1, paddingBottom: 1 }}>

                  <Typography variant="h6" component="div" noWrap>
                   {room.type}

                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>

                    <strong>Bed Type:</strong> {room.bedTypes}

                  </Typography>

                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ marginTop: 1 }}
                  >

                    <strong>₹{room.price}</strong>{" "}
                    <Typography variant="caption">per night</Typography>

                  </Typography>

                  {room.isOffer && room.offerName && (
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ marginTop: 1 }}
                    >

                      <strong>Offer:</strong> {room.offerName} - Save ₹
                      {room.offerPriceLess}

                    </Typography>
                  )}

                </CardContent>

                <Button
                  variant={
                    selectedRooms.some((r) => r.roomId === room.roomId)
                      ? "contained"
                      : "outlined"
                  }
                  color="primary"
                  onClick={() => handleRoomClick(room)}
                  sx={{ margin: "0 16px 16px" }}
                  disabled={room.countRooms === 0} // Disable button if sold out
                >

                  {selectedRooms.some((r) => r.roomId === room.roomId)
                    ? "Selected"
                    : "Select"}

                </Button>

              </Card>

            </Grid>
          ))}

        </Grid>
      )}

    </Box>
  );
}
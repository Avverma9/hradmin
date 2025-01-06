import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Grid, Box } from '@mui/material';

export default function Rooms({ rooms = [], onRoomSelect, divRef, selectedRooms }) {
    const handleRoomClick = (room) => {
        // Check if the room is already selected
        if (selectedRooms.some((r) => r.roomId === room.roomId)) {
            // Remove the room if it's selected
            onRoomSelect(room, true); // true indicates removal
        } else {
            // Add the room if it's not selected
            onRoomSelect(room, false); // false indicates addition
        }
    };

    return (
        <Box sx={{ padding: 1 }} ref={divRef}>
            {rooms.length === 0 ? (
                <Typography variant="h6">No rooms available</Typography>
            ) : (
                <Grid container spacing={1}>
                    {rooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={room.roomId}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', padding: 1 }}>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: 150,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        marginBottom: 1,
                                    }}
                                    image={
                                        room?.images?.[0] ||
                                        'https://www.thespruce.com/thmb/2_Q52GK3rayV1wnqm6vyBvgI3Ew=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/put-together-a-perfect-guest-room-1976987-hero-223e3e8f697e4b13b62ad4fe898d492d.jpg'
                                    }
                                    alt={`Room Image - ${room?.type || 'Unknown'}`}
                                />
                                <CardContent sx={{ paddingBottom: 1 }}>
                                    <Typography variant="h6" component="div" noWrap>
                                        {room.type}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        <strong>Bed Type:</strong> {room.bedTypes}
                                    </Typography>
                                    <Typography variant="body1" color="text.primary" sx={{ marginTop: 1 }}>
                                        <strong>Price:</strong> ₹{room.price} per night
                                    </Typography>
                                    {room.isOffer && room.offerName && (
                                        <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                                            <strong>Offer:</strong> {room.offerName} - Save ₹{room.offerPriceLess}
                                        </Typography>
                                    )}
                                </CardContent>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleRoomClick(room)}
                                    sx={{ margin: '0 4px 8px', alignSelf: 'center' }}
                                >
                                    {selectedRooms.some((r) => r.roomId === room.roomId) ? 'Remove' : 'Select'}
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

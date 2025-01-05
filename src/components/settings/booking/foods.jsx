import React from 'react';
import { Card, CardContent, CardMedia, Button, Typography, Grid, Box } from '@mui/material';

export default function Food({ foodData, onFoodSelect }) {
    const foodItems = Array.isArray(foodData) && foodData.length > 0 ? foodData : [];

    return (
        <Box sx={{ padding: 1 }}>
            {/* Display message if foodData is empty or not available */}
            {foodItems.length === 0 ? (
                <Typography variant="h6">No food items available</Typography>
            ) : (
                <Grid container spacing={1}>
                    {/* Map over foodData array */}
                    {foodItems.map((foodItem, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', padding: 1 }}>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: 150, // Reduced image height for compact layout
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        marginBottom: 1,
                                    }}
                                    image={foodItem.images}
                                    alt={foodItem.name}
                                />
                                <CardContent sx={{ paddingBottom: 1 }}>
                                    <Typography variant="body2" component="div" noWrap sx={{ fontWeight: 'bold' }}>
                                        {foodItem.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }} noWrap>
                                        {foodItem.about}
                                    </Typography>
                                    <Typography variant="body2" color="text.primary" sx={{ marginTop: 1, fontSize: '0.9rem' }}>
                                        <strong>Price:</strong> ₹{foodItem.price}
                                    </Typography>
                                </CardContent>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => {
                                        onFoodSelect(foodItem);
                                    }}
                                    sx={{ margin: '0 4px 8px', alignSelf: 'center' }}
                                >
                                    Select
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

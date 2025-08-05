import React from 'react';
import { Card, CardContent, CardMedia, Button, Typography, Grid, Box } from '@mui/material';

export default function Food({ foodData = [], onFoodSelect, selectedFoods }) {
    const handleFoodClick = (foodItem) => {
        // This logic correctly toggles the food selection.
        onFoodSelect(foodItem);
    };

    return (
        <Box sx={{ padding: 1 }}>
            {foodData.length === 0 ? (
                <Typography variant="h6">No food items available</Typography>
            ) : (
                <Grid container spacing={2}>
                    {foodData.map((foodItem) => (
                        <Grid item xs={12} sm={6} md={6} lg={6} key={foodItem.foodId}>
                            <Card sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                border: selectedFoods.some((f) => f.foodId === foodItem.foodId) ? '2px solid' : '1px solid',
                                borderColor: selectedFoods.some((f) => f.foodId === foodItem.foodId) ? 'primary.main' : 'divider',
                                transition: 'border-color 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    boxShadow: 6,
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: 180,
                                        objectFit: 'cover',
                                    }}
                                    image={
                                        foodItem.images?.[0] ||
                                        'https://via.placeholder.com/300x200.png?text=No+Image'
                                    }
                                    alt={foodItem.name}
                                />
                                <CardContent sx={{ flexGrow: 1, paddingBottom: 1 }}>
                                    <Typography variant="h6" component="div" noWrap>
                                        {foodItem.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {foodItem.about}
                                    </Typography>
                                    <Typography variant="h6" color="text.primary">
                                        <strong>₹{foodItem.price}</strong>
                                    </Typography>
                                </CardContent>
                                <Button
                                    variant={selectedFoods.some((f) => f.foodId === foodItem.foodId) ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => handleFoodClick(foodItem)}
                                    sx={{ margin: '0 16px 16px' }}
                                >
                                    {selectedFoods.some((f) => f.foodId === foodItem.foodId) ? 'Selected' : 'Select'}
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
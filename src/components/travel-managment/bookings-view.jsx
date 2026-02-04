import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Divider,
    Button,
    Box,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const BookingDetails = ({ booking, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const {
        vehicleNumber,
        pickupP,
        dropP,
        pickupD,
        dropD,
        bookedBy,
        customerMobile,
        bookingDate,
        price,
        bookingCode,
        seats,
        totalSeatPrice,
    } = booking;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Info Row Component for cleaner code
    const InfoRow = ({ label, value, icon }) => (
        <Box
            sx={{
                backgroundColor: 'grey.50',
                p: isMobile ? 1 : 1.25,
                borderRadius: 1.5,
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                height: '100%',
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: 'block',
                    mb: 0.25,
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    fontWeight: 500,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    wordBreak: 'break-word',
                }}
            >
                {value || 'N/A'}
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            }}
        >
            {/* Header - Sticky on mobile */}
            <Paper
                elevation={2}
                sx={{
                    position: isMobile ? 'sticky' : 'relative',
                    top: 0,
                    zIndex: 1,
                    borderRadius: isMobile ? 0 : '12px 12px 0 0',
                    p: isMobile ? 1.5 : 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography
                            variant={isMobile ? 'subtitle1' : 'h6'}
                            fontWeight={700}
                            color="white"
                        >
                            Booking Details
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.85)' }}
                        >
                            ID: {bookingCode}
                        </Typography>
                    </Box>
                    {onClose && (
                        isMobile ? (
                            <IconButton
                                size="small"
                                onClick={onClose}
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={onClose}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Close
                            </Button>
                        )
                    )}
                </Stack>
            </Paper>

            {/* Scrollable Content */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: isMobile ? 1.5 : 2.5,
                    pb: isMobile ? 10 : 2.5,
                }}
            >
                {/* Customer Info Section */}
                <Typography
                    variant="overline"
                    sx={{
                        display: 'block',
                        mb: 1,
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                    }}
                >
                    Customer Information
                </Typography>
                <Grid container spacing={isMobile ? 1 : 1.5} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <InfoRow label="Booked By" value={bookedBy} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow label="Mobile" value={customerMobile} />
                    </Grid>
                    <Grid item xs={12}>
                        <InfoRow label="Booking Date" value={formatDateTime(bookingDate)} />
                    </Grid>
                </Grid>

                {/* Trip Details Section */}
                <Typography
                    variant="overline"
                    sx={{
                        display: 'block',
                        mb: 1,
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                    }}
                >
                    Trip Details
                </Typography>
                <Grid container spacing={isMobile ? 1 : 1.5} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                        <InfoRow label="Vehicle Number" value={vehicleNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow label="Pickup Location" value={pickupP} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow label="Drop Location" value={dropP} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow label="Pickup Date & Time" value={formatDateTime(pickupD)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow label="Drop Date & Time" value={formatDateTime(dropD)} />
                    </Grid>
                </Grid>

                {/* Seat Information Section */}
                {seats && seats.length > 0 && (
                    <>
                        <Typography
                            variant="overline"
                            sx={{
                                display: 'block',
                                mb: 1,
                                color: 'primary.main',
                                fontWeight: 700,
                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                            }}
                        >
                            Seat Information ({seats.length} {seats.length === 1 ? 'Seat' : 'Seats'})
                        </Typography>

                        <Stack spacing={isMobile ? 1 : 1.25} sx={{ mb: 2 }}>
                            {seats.map((seat, index) => (
                                <Box
                                    key={seat._id || index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: isMobile ? 1 : 1.25,
                                        borderRadius: 1.5,
                                        bgcolor: 'primary.lighter',
                                        border: '1px solid',
                                        borderColor: 'primary.light',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            fontWeight={700}
                                            sx={{ mb: 0.5, fontSize: isMobile ? '0.8125rem' : '0.875rem' }}
                                        >
                                            Seat #{seat.seatNumber}
                                        </Typography>
                                        <Chip
                                            label={seat.seatType}
                                            color="primary"
                                            size="small"
                                            sx={{
                                                height: isMobile ? 20 : 24,
                                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        variant={isMobile ? 'body1' : 'h6'}
                                        fontWeight={700}
                                        color="primary"
                                    >
                                        ₹{seat.seatPrice}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </>
                )}
            </Box>

            {/* Total Price Section - Fixed at bottom on mobile */}
            <Paper
                elevation={isMobile ? 8 : 0}
                sx={{
                    position: isMobile ? 'fixed' : 'relative',
                    bottom: isMobile ? 0 : 'auto',
                    left: isMobile ? 0 : 'auto',
                    right: isMobile ? 0 : 'auto',
                    zIndex: 2,
                    borderRadius: isMobile ? '16px 16px 0 0' : 0,
                    p: isMobile ? 2 : 2.5,
                    background: isMobile
                        ? 'linear-gradient(to top, #ffffff 0%, #f8f9fa 100%)'
                        : 'transparent',
                    borderTop: isMobile ? '2px solid' : 'none',
                    borderColor: 'divider',
                }}
            >
                <Divider sx={{ mb: 1.5, display: isMobile ? 'none' : 'block' }} />
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{
                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                fontWeight: 600,
                            }}
                        >
                            Total Amount
                        </Typography>
                        {seats && seats.length > 0 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', fontSize: isMobile ? '0.65rem' : '0.7rem' }}
                            >
                                {seats.length} seat{seats.length > 1 ? 's' : ''} booked
                            </Typography>
                        )}
                    </Box>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        fontWeight={800}
                        color="primary"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        ₹{price || 0}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default BookingDetails;

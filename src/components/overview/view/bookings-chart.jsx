import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Card,
    Grid,
    Select,
    MenuItem,
    Typography,
    CardHeader,
    CardContent,
    FormControl,
    Skeleton,
} from '@mui/material';
import {
    Bar,
    Cell,
    Pie,
    BarChart,
    PieChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { getBookingsData } from 'src/components/redux/reducers/statistics/statistics';

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    return years;
};

const processBookingData = (data = []) => {
    if (!Array.isArray(data) || data.length === 0) {
        return { pieData: [], barData: [], uniqueStatuses: [], total: 0 };
    }

    const statusCounts = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const uniqueStatuses = [...new Set(data.map(item => item.status))].sort();

    const barData = monthNames.map(name => {
        const monthEntry = { month: name };
        uniqueStatuses.forEach(status => { monthEntry[status] = 0; });
        return monthEntry;
    });

    data.forEach(item => {
        if (item && item.status && typeof item.count === 'number') {
            const monthIndex = parseInt(item.month.split('-')[1], 10) - 1;
            if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
                barData[monthIndex][item.status] = (barData[monthIndex][item.status] || 0) + item.count;
            }
            statusCounts[item.status] = (statusCounts[item.status] || 0) + item.count;
        }
    });

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    return { pieData, barData, uniqueStatuses, total };
};

const STATUS_COLORS = {
    Confirmed: '#22c55e',
    Cancelled: '#ef4444',
    Pending: '#f97316',
    'Checked-out': '#3b82f6',
    'Checked-in': '#8b5cf6',
    Default: '#a1a1aa',
};

const BookingChart = () => {
    const dispatch = useDispatch();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const yearOptions = useMemo(() => generateYearOptions(), []);

    const { bookingsData, loading } = useSelector((state) => (state.statistics));

    useEffect(() => {
        if (selectedYear) {
            dispatch(getBookingsData(selectedYear));
        }
    }, [dispatch, selectedYear]);

    const { pieData, barData, uniqueStatuses, total } = useMemo(() => processBookingData(bookingsData), [bookingsData]);
    const hasData = useMemo(() => pieData && pieData.length > 0, [pieData]);

    const renderCenterText = () => (
        <>
            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '2rem', fontWeight: 'bold', fill: '#212529' }}>
                {total}
            </text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '0.9rem', fill: '#6c757d' }}>
                Total Bookings
            </text>
        </>
    );

    return (
        <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardHeader
                title="Yearly Booking Analysis"
                action={
                    <FormControl size="small" variant="outlined">
                        <Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {yearOptions.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                }
                sx={{ py: 2, px: 3 }}
            />
            <CardContent>
                {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
                ) : !hasData ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                            No booking data found for {selectedYear}.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Box sx={{ height: 400 }}>
                                <Typography variant="h6" align="center" gutterBottom>Monthly Breakdown</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} dy={5} tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.05)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '30px' }} />
                                        {uniqueStatuses.map(status => (
                                            <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status] || STATUS_COLORS.Default} radius={[4, 4, 0, 0]} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ height: 400, position: 'relative' }}>
                                <Typography variant="h6" align="center" gutterBottom>Overall Status</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        />
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={85} outerRadius={125} paddingAngle={4}>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Default} />
                                            ))}
                                        </Pie>
                                        {renderCenterText()}
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default BookingChart;
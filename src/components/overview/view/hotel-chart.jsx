import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Card,
    Select,
    MenuItem,
    Typography,
    CardHeader,
    CardContent,
    FormControl,
    Skeleton,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Cell,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import { getHotelDataByYear } from 'src/components/redux/reducers/statistics/statistics';

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    return years;
};

const formatChartData = (data) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap = new Map();

    if (Array.isArray(data)) {
        data.forEach(item => {
            if (item && typeof item.month === 'string') {
                const monthIndex = parseInt(item.month.split('-')[1], 10) - 1;
                if (!isNaN(monthIndex)) {
                    dataMap.set(monthIndex, item.count);
                }
            }
        });
    }

    return monthNames.map((name, index) => ({
        month: name,
        'Hotels Created': dataMap.get(index) || 0,
    }));
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 3 }}>
                <Typography variant="subtitle2" gutterBottom>{label}</Typography>
                <Typography variant="body2" sx={{ color: payload[0].fill }}>
                    {`New Hotels: ${payload[0].value}`}
                </Typography>
            </Box>
        );
    }
    return null;
};

const HotelChart = () => {
    const dispatch = useDispatch();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const yearOptions = useMemo(() => generateYearOptions(), []);

    const { monthlyCounts, isLoading } = useSelector((state) => ({
        monthlyCounts: state.statistics.hotelChartData,
        isLoading: state.statistics.isLoading,
    }));

    useEffect(() => {
        if (selectedYear) {
            dispatch(getHotelDataByYear(selectedYear));
        }
    }, [dispatch, selectedYear]);

    const { chartData, hasData, total, maxValue } = useMemo(() => {
        const formattedData = formatChartData(monthlyCounts);
        const totalCount = formattedData.reduce((sum, item) => sum + item['Hotels Created'], 0);
        const maxVal = Math.max(...formattedData.map(item => item['Hotels Created']));
        return {
            chartData: formattedData,
            hasData: totalCount > 0,
            total: totalCount,
            maxValue: maxVal,
        };
    }, [monthlyCounts]);

    return (
        <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardHeader
                title="Hotel"
                subheader={!isLoading && `Total in ${selectedYear}: ${total}`}
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
            <CardContent sx={{ pt: 1, '&.MuiCardContent-root': { pb: 2 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
                    ) : !hasData ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="subtitle1" color="text.secondary">
                                No hotel registration data found for {selectedYear}.
                            </Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                                barSize={20}
                            >
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.4}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} dy={5} tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(136, 132, 216, 0.05)' }} />
                                <Bar dataKey="Hotels Created" radius={[4, 4, 0, 0]} animationDuration={1000}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry['Hotels Created'] === maxValue && maxValue > 0 ? '#82ca9d' : 'url(#barGradient)'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default HotelChart;
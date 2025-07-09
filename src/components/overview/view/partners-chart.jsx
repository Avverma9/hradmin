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
    Chip,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { getPartnersStatistics } from 'src/components/redux/reducers/statistics/statistics';

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    return years;
};

const formatPartnerChartData = (data = []) => {
    if (!Array.isArray(data) || data.length === 0) {
        return { chartData: [], uniqueRoles: [], roleTotals: {} };
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const uniqueRoles = [...new Set(data.map(item => item.role))].sort();
    
    const roleTotals = uniqueRoles.reduce((acc, role) => {
        acc[role] = 0;
        return acc;
    }, {});

    const chartDataTemplate = monthNames.map(name => {
        const monthEntry = { month: name };
        uniqueRoles.forEach(role => {
            monthEntry[role] = 0;
        });
        return monthEntry;
    });

    data.forEach(item => {
        if (item && typeof item.month === 'string' && item.role) {
            const monthIndex = parseInt(item.month.split('-')[1], 10) - 1;
            if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
                chartDataTemplate[monthIndex][item.role] = (chartDataTemplate[monthIndex][item.role] || 0) + item.count;
                roleTotals[item.role] += item.count;
            }
        }
    });

    return { chartData: chartDataTemplate, uniqueRoles, roleTotals };
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 3 }}>
                <Typography variant="subtitle2" gutterBottom>{label}</Typography>
                {payload.map((entry, index) => (
                    <Typography key={index} variant="body2" sx={{ color: entry.stroke }}>
                        {`${entry.name}: ${entry.value}`}
                    </Typography>
                ))}
            </Box>
        );
    }
    return null;
};

const PartnerChart = () => {
    const dispatch = useDispatch();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const yearOptions = useMemo(() => generateYearOptions(), []);

    const { partnerStats, isLoading } = useSelector((state) => ({
        partnerStats: state.statistics.partnersChartData,
        isLoading: state.statistics.isLoading,
    }));

    useEffect(() => {
        if (selectedYear) {
            dispatch(getPartnersStatistics(selectedYear));
        }
    }, [dispatch, selectedYear]);

    const { chartData, uniqueRoles, roleTotals } = useMemo(() => formatPartnerChartData(partnerStats), [partnerStats]);
    const hasData = useMemo(() => partnerStats && partnerStats.length > 0, [partnerStats]);

    const roleColors = useMemo(() => {
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];
        return uniqueRoles.reduce((acc, role, index) => {
            acc[role] = colors[index % colors.length];
            return acc;
        }, {});
    }, [uniqueRoles]);

    const subheaderContent = useMemo(() => {
        if (isLoading || !hasData) return null;
        
        const breakdown = Object.entries(roleTotals)
            .map(([role, count]) => `${role} (${count})`)
            .join(', ');

        return `Total for ${selectedYear}: ${breakdown}`;
    }, [isLoading, hasData, selectedYear, roleTotals]);

    return (
        <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardHeader
                title="Partners"
                subheader={subheaderContent}
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
                sx={{ py: 2, px: 3, alignItems: 'flex-start' }}
                subheaderTypographyProps={{ whiteSpace: 'normal', mt: 0.5 }}
            />
            <CardContent sx={{ pt: 1, '&.MuiCardContent-root': { pb: 2 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
                    ) : !hasData ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="subtitle1" color="text.secondary">
                                No partner registration data found for {selectedYear}.
                            </Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} dy={5} tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                {uniqueRoles.map(role => (
                                    <Line
                                        key={role}
                                        type="monotone"
                                        dataKey={role}
                                        stroke={roleColors[role]}
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default PartnerChart;
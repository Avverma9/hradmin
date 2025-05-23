import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    createGst,
    getGst,
    getAllGst,
    updateGst,
    deleteGst,
} from 'src/components/redux/reducers/gst';

export default function Gst() {
    const dispatch = useDispatch();
    const gstData = useSelector((state) => state.gst.gst);
    const gstList = useSelector((state) => state.gst.gstList);

    const [gst, setGst] = useState({
        gstPrice: '',
        gstMinThreshold: '',
        gstMaxThreshold: '',
        type: '',
    });

    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        dispatch(getAllGst());
    }, [dispatch]);

    useEffect(() => {
        if (selectedType) {
            const payload = { selectedType }
            dispatch(getGst(payload));
        }
    }, [selectedType, dispatch]);


    const handleOpenCreate = () => {
        setIsEdit(false);
        setGst({
            gstPrice: '',
            gstMinThreshold: '',
            gstMaxThreshold: '',
            type: selectedType || '',
        });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setIsEdit(false);
        setGst({
            gstPrice: '',
            gstMinThreshold: '',
            gstMaxThreshold: '',
            type: '',
        });
    };

    const handleChange = (e) => {
        setGst({ ...gst, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            dispatch(updateGst(gst));
        } else {
            dispatch(createGst(gst));
        }
        handleClose();
        setTimeout(() => {
            window.location.reload();
        }, 300);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this GST?')) {
            dispatch(deleteGst(id));
            setTimeout(() => {
                dispatch(getAllGst());
                if (selectedType) dispatch(getGst(selectedType));
            }, 300);
        }
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                GST Settings
            </Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel>Select GST Type</InputLabel>
                <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    label="Select GST Type"
                >
                    <MenuItem value="Tour">Tour</MenuItem>
                    <MenuItem value="Travel">Travel</MenuItem>
                    <MenuItem value="Hotel">Hotel</MenuItem>
                </Select>
            </FormControl>

            <Box mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenCreate}
                    disabled={!selectedType}
                >
                    Create GST
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>GST Price</TableCell>
                            <TableCell>GST Min Threshold</TableCell>
                            <TableCell>GST Max Threshold</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(selectedType && gstData ? [gstData] : gstList)?.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>{item.gstPrice}%</TableCell>
                                <TableCell>{item.gstMinThreshold}</TableCell>
                                <TableCell>{item.gstMaxThreshold}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                            setIsEdit(true);
                                            setGst(item);
                                            setOpenModal(true);
                                        }}
                                    >
                                        Update
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </Button>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Update GST' : 'Create GST'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            label="Minimum Threshold (₹)"
                            name="gstMinThreshold"
                            value={gst.gstMinThreshold}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            type="number"
                        />
                        <TextField
                            label="Maximum Threshold (₹)"
                            name="gstMaxThreshold"
                            value={gst.gstMaxThreshold}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            type="number"
                        />
                        <TextField
                            label="GST Price (%)"
                            name="gstPrice"
                            value={gst.gstPrice}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            type="number"
                        />
                        {gst.gstMinThreshold && gst.gstPrice ? (
                            <Typography variant="caption" color="text.secondary">
                                {gst.gstPrice}% of ₹{gst.gstMinThreshold} is ₹
                                {(parseFloat(gst.gstMinThreshold) * parseFloat(gst.gstPrice) / 100).toFixed(2)}
                            </Typography>
                        ) : null}
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Type</InputLabel>
                            <Select
                                name="type"
                                value={gst.type}
                                onChange={handleChange}
                                disabled={isEdit}
                            >
                                <MenuItem value="Tour">Tour</MenuItem>
                                <MenuItem value="Travel">Travel</MenuItem>
                                <MenuItem value="Hotel">Hotel</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

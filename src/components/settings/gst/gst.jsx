import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Grid, Card, CardContent, CardActions,
  Tabs, Tab, Stack, Tooltip, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  createGst, getGst, getAllGst, updateGst, deleteGst
} from 'src/components/redux/reducers/gst';

const GST_TYPES = ['Tour', 'Travel', 'Hotel'];

export default function Gst() {
  const dispatch = useDispatch();
  const gstData = useSelector((state) => state.gst.gst);
  const gstList = useSelector((state) => state.gst.gstList);

  const [gst, setGst] = useState({ gstPrice: '', gstMinThreshold: '', gstMaxThreshold: '', type: '' });
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const selectedType = GST_TYPES[selectedTab];

  useEffect(() => {
    dispatch(getAllGst());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getGst({ selectedType }));
  }, [selectedType, dispatch]);

  const openForm = (mode = 'create', item = null) => {
    setIsEdit(mode === 'edit');
    setGst(mode === 'edit' ? item : { gstPrice: '', gstMinThreshold: '', gstMaxThreshold: '', type: selectedType });
    setOpenModal(true);
  };

  const closeForm = () => {
    setOpenModal(false);
    setIsEdit(false);
    setGst({ gstPrice: '', gstMinThreshold: '', gstMaxThreshold: '', type: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isEdit ? dispatch(updateGst(gst)) : dispatch(createGst(gst));
    closeForm();
    setTimeout(() => window.location.reload(), 300);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this GST?')) {
      dispatch(deleteGst(id));
      setTimeout(() => {
        dispatch(getAllGst());
        if (selectedType) dispatch(getGst({ selectedType }));
      }, 300);
    }
  };

  const filteredList = (selectedType && gstData ? [gstData] : gstList)?.filter(
    (item) => item.type === selectedType
  );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>GST Settings</Typography>

      {/* Tabs for GST types */}
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        {GST_TYPES.map((type, idx) => (
          <Tab key={idx} label={type} />
        ))}
      </Tabs>

      {/* GST Cards or No Data */}
      <Grid container spacing={3}>
        {filteredList && filteredList.length > 0 ? (
          filteredList.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{item.type} GST</Typography>
                  <Typography variant="body2"><strong>GST %:</strong> {item.gstPrice}%</Typography>
                  <Typography variant="body2"><strong>Min Threshold:</strong> ₹{item.gstMinThreshold}</Typography>
                  <Typography variant="body2"><strong>Max Threshold:</strong> ₹{item.gstMaxThreshold}</Typography>
                </CardContent>
                <CardActions sx={{ mt: 'auto' }}>
                  <Button size="small" variant="outlined" onClick={() => openForm('edit', item)}>Edit</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(item._id)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              textAlign="center"
              py={6}
              px={2}
              sx={{ border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}
            >
              <Typography variant="h5" gutterBottom>🚫 No GST Data</Typography>
              <Typography variant="body2" color="text.secondary">
                No GST configuration found for <strong>{selectedType}</strong>. <br />
                Click the + button below to create one.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Floating Create Button */}
      <Tooltip title={`Create ${selectedType} GST`}>
        <Fab
          color="primary"
          onClick={() => openForm('create')}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            boxShadow: 6
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Create/Edit Dialog */}
      <Dialog open={openModal} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? 'Update GST' : `Create ${selectedType} GST`}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Min Threshold (₹)"
                  name="gstMinThreshold"
                  value={gst.gstMinThreshold}
                  onChange={(e) => setGst({ ...gst, [e.target.name]: e.target.value })}
                  fullWidth required type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Threshold (₹)"
                  name="gstMaxThreshold"
                  value={gst.gstMaxThreshold}
                  onChange={(e) => setGst({ ...gst, [e.target.name]: e.target.value })}
                  fullWidth required type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="GST Rate (%)"
                  name="gstPrice"
                  value={gst.gstPrice}
                  onChange={(e) => setGst({ ...gst, [e.target.name]: e.target.value })}
                  fullWidth required type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Type"
                  value={gst.type}
                  fullWidth
                  disabled
                />
              </Grid>

              {gst.gstMinThreshold && gst.gstPrice && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Preview: {gst.gstPrice}% of ₹{gst.gstMinThreshold} is ₹
                    {(parseFloat(gst.gstMinThreshold) * parseFloat(gst.gstPrice) / 100).toFixed(2)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

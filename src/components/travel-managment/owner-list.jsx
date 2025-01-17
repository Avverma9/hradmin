import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOwner } from '../redux/reducers/travel/carOwner';
import './owner-list.css';

const OwnerList = () => {
    const owners = useSelector((state) => state.owner.data);
    const dispatch = useDispatch();
    const [selectedDlImage, setSelectedDlImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOwners, setFilteredOwners] = useState([]);

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                await dispatch(getAllOwner());
            } catch (error) {
                console.error('Error fetching owner data:', error);
            }
        };

        fetchOwners();
    }, [dispatch]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredOwners(owners);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            setFilteredOwners(
                owners.filter(
                    (owner) => owner.mobile?.toLowerCase().includes(lowercasedQuery) || owner.dl?.toLowerCase().includes(lowercasedQuery)
                )
            );
        }
    }, [searchQuery, owners]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleViewDlImage = (dlImage) => {
        setSelectedDlImage(dlImage);
    };

    const closeDlImage = () => {
        setSelectedDlImage(null);
    };

    const handleDownloadImage = (dlImage) => {
        const link = document.createElement('a');
        link.href = dlImage;
        link.download = 'DL_Image.jpg';
        link.click();
    };

    return (
        <div className="owner-list">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <TextField
                    label="Search by Mobile or DL"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    fullWidth
                    style={{ maxWidth: '400px' }}
                />
            </div>

            <Grid container spacing={2}>
                {filteredOwners.map((owner) => (
                    <Grid item xs={12} sm={6} md={3} key={owner._id.$oid}>
                        <Card className="owner-card">
                            <CardMedia component="img" height="140" image={owner.images[0]} alt={owner.name} className="card-media" />
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {owner.name}
                                </Typography>
                                <div className="card-content">
                                    <Typography className="key">Role:</Typography>
                                    <Typography className="value">{owner.role}</Typography>

                                    <Typography className="key">Mobile:</Typography>
                                    <Typography className="value">{owner.mobile}</Typography>

                                    <Typography className="key">Email:</Typography>
                                    <Typography className="value">{owner.email}</Typography>

                                    <Typography className="key">DL:</Typography>
                                    <Typography className="value">{owner.dl}</Typography>

                                    <Typography className="key">City:</Typography>
                                    <Typography className="value">{owner.city}</Typography>

                                    <Typography className="key">State:</Typography>
                                    <Typography className="value">{owner.state}</Typography>

                                    <Typography className="key">Address:</Typography>
                                    <Typography className="value">{owner.address}</Typography>

                                    <Typography className="key">Pin Code:</Typography>
                                    <Typography className="value">{owner.pinCode}</Typography>
                                </div>
                            </CardContent>

                            <div className="card-actions">
                                <Button variant="contained" color="primary" onClick={() => handleViewDlImage(owner.dlImage[0])}>
                                    View DL Image
                                </Button>
                            </div>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* View DL Image Modal */}
            {selectedDlImage && (
                <div className="view-dl-image active">
                    <div className="modal-content">
                        <button className="close-btn" onClick={closeDlImage}>
                            &times;
                        </button>
                        <img src={selectedDlImage} alt="DL" />
                        <div className="modal-actions">
                            <Button variant="contained" color="secondary" onClick={() => handleDownloadImage(selectedDlImage)}>
                                Download Image
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerList;

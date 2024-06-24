/* eslint-disable perfectionist/sort-imports */
/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import { localUrl } from 'src/utils/util';
import React, { useState, useEffect } from 'react';

const TravelLocation = () => {
  const [travelData, setTravelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [isCreated, setIsCreated] = useState(false);

  const fetchTravelData = async () => {
    try {
      const response = await axios.get(`${localUrl}/get-all/travel/location`);
      setTravelData(response.data.map((item, index) => ({ ...item, id: index + 1 })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    formData.append('location', location);

    try {
      const response = await axios.post(`${localUrl}/add-a/travel/location`, formData);
      if (response.status === 201) {
        setIsCreated(true);
        fetchTravelData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${localUrl}/delete-by-id/travel/location/${id}`);
      fetchTravelData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h4 className="mb-4">Travel Locations</h4>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row mb-3">
          <label htmlFor="location" className="col-sm-2 col-form-label">
            Location
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              placeholder='Enter Location'
              className="form-control"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="images" className="col-sm-2 col-form-label">
            Images
          </label>
          <div className="col-sm-10">
            <input
              type="file"
              className="form-control"
              id="images"
              multiple
              onChange={(e) => setImages([...e.target.files])}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-sm-10 offset-sm-2">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </form>
      {isCreated && (
        <div className="alert alert-success mt-3">
          <strong>Success!</strong> Travel location created successfully!
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {travelData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.location}</td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    {row.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Travel location ${index + 1}`}
                        className="img-thumbnail"
                        style={{ width: '50px', height: '50px' }}
                      />
                    ))}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TravelLocation;

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { tourById, tourUpdate } from "../redux/reducers/tour/tour";
import EditableField from "./EditableField";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';

const deepCopy = (obj) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  } else {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error("Deep copy failed:", e);
      return null;
    }
  }
};

export default function TourUpdate() {
  const { editData: editDataArray, loading, error } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editableData, setEditableData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(tourById(id));
    }
    setEditableData(null);
    setEditMode({});
    setSaveError(null);
  }, [id, dispatch]);

  useEffect(() => {
    if (Array.isArray(editDataArray) && editDataArray.length > 0) {
      const tourObject = deepCopy(editDataArray[0]);
      setEditableData(tourObject);
      setEditMode({});
    } else if (!loading && editDataArray) {
        setEditableData(null);
    } else if (!loading && !editDataArray) {
         setEditableData(null);
    }
  }, [editDataArray, loading, id]);

  const handleInputChange = useCallback((fieldName, value) => {
    setEditableData((prevData) => {
      if (!prevData) return null;
      const newData = deepCopy(prevData);
      const parts = fieldName.match(/dayWise-(\d+)-(\w+)/);

      if (parts) {
        const [, dayIndex, dayField] = parts;
        const dayIdx = parseInt(dayIndex, 10);

        if (!newData.dayWise) newData.dayWise = [];
        if (!newData.dayWise[dayIdx]) newData.dayWise[dayIdx] = { day: dayIdx + 1 };

        const newDayWise = [...newData.dayWise];
        newDayWise[dayIdx] = {
            ...newDayWise[dayIdx],
            [dayField]: value,
        };
        newData.dayWise = newDayWise;

      } else {
        newData[fieldName] = value;
      }
      return newData;
    });
  }, []);

  const toggleEditMode = useCallback((fieldName) => {
    const currentlyEditing = !!editMode[fieldName];

    if (currentlyEditing && Array.isArray(editDataArray) && editDataArray.length > 0) {
        const originalTour = editDataArray[0];
        if (originalTour) {
             const parts = fieldName.match(/dayWise-(\d+)-(\w+)/);
             if (parts) {
                 const [, dayIndex, dayField] = parts;
                 const dayIdx = parseInt(dayIndex, 10);
                 if (originalTour.dayWise && originalTour.dayWise[dayIdx] !== undefined && originalTour.dayWise[dayIdx][dayField] !== undefined) {
                     handleInputChange(fieldName, originalTour.dayWise[dayIdx][dayField]);
                 }
             } else {
                  if (originalTour[fieldName] !== undefined) {
                     handleInputChange(fieldName, originalTour[fieldName]);
                  }
             }
        }
    }

     setEditMode((prev) => ({
        ...prev,
        [fieldName]: !currentlyEditing,
     }));

  }, [editMode, editDataArray, handleInputChange]);

  const handleSaveChanges = async () => {
    if (!editableData || !editableData._id) {
      setSaveError("No data to save or missing ID.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await dispatch(tourUpdate({ id: editableData._id, data: editableData })).unwrap();
      setEditMode({});
    } catch (err) {
      console.error("Failed to update tour:", err);
      setSaveError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading tour details: {error}</Alert>;
  }

  if (!editableData) {
    return <Alert severity="warning">Tour data not found or still loading.</Alert>;
  }

  const isAnyFieldEditing = Object.values(editMode).some(isEditing => isEditing);

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom component="h3">
        Update Tour Package Details
      </Typography>
      <Typography variant="caption" display="block" gutterBottom sx={{mb: 2}}>
        Click the edit icon (✎) next to a field to modify it. Click 'Save Changes' below to persist updates.
      </Typography>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Grid container spacing={0}>
         <Grid item xs={12}>
              <EditableField
                  label="Agency Name"
                  value={editableData.travelAgencyName}
                  fieldName="travelAgencyName"
                  isEditing={!!editMode["travelAgencyName"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
              />
              <EditableField
                  label="Overview"
                  value={editableData.overview}
                  fieldName="overview"
                  isEditing={!!editMode["overview"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
                  multiline
                  rows={4}
              />
              <EditableField
                  label="State"
                  value={editableData.state}
                  fieldName="state"
                  isEditing={!!editMode["state"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
              />
              <EditableField
                  label="City"
                  value={editableData.city}
                  fieldName="city"
                  isEditing={!!editMode["city"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
              />
              <EditableField
                  label="Package Price"
                  value={editableData.price}
                  fieldName="price"
                  isEditing={!!editMode["price"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
                  type="number"
              />
              
               <EditableField
                  label="Nights"
                  value={editableData.nights}
                  fieldName="nights"
                  isEditing={!!editMode["nights"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
                  type="number"
              />
               <EditableField
                  label="Days"
                  value={editableData.days}
                  fieldName="days"
                  isEditing={!!editMode["days"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
                  type="number"
              />
               <EditableField
                  label="Start Date"
                  value={editableData.from}
                  fieldName="from"
                  isEditing={!!editMode["from"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
                  type="date"
              />
               <EditableField
                  label="End Date"
                  value={editableData.to}
                  fieldName="to"
                  isEditing={!!editMode["to"]}
                  onChange={handleInputChange}
                  onToggleEdit={toggleEditMode}
                  type="date"
              />
         </Grid>
      </Grid>

       {editableData.dayWise && editableData.dayWise.length > 0 && (
           <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
                Day-wise Itinerary
            </Typography>
            {editableData.dayWise.map((day, dayIndex) => {
                 const fieldName = `dayWise-${dayIndex}-description`;
                 return (
                    <EditableField
                        key={day._id || dayIndex}
                        label={`Day ${day.day}`}
                        value={day.description}
                        fieldName={fieldName}
                        isEditing={!!editMode[fieldName]}
                        onChange={handleInputChange}
                        onToggleEdit={toggleEditMode}
                        multiline
                        rows={3}
                    />
                );
            })}
           </>
       )}

       <Divider sx={{ my: 3 }} />
       <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
                variant="contained"
                color="primary"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveChanges}
                disabled={isSaving || !isAnyFieldEditing}
            >
                {isSaving ? "Saving..." : "Save Changes"}
            </Button>
       </Box>
    </Paper>
  );
}
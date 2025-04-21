import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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
  TextareaAutosize,
  Select,
  MenuItem,
  FormHelperText,
  FormControl,
  Chip,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Rating from "@mui/material/Rating";
import CloseIcon from "@mui/icons-material/Close";

const deepCopy = (obj) => {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch (e) {
      console.warn(
        "structuredClone failed, falling back to JSON parse/stringify:",
        e,
      );
    }
  }
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error("Deep copy failed with JSON parse/stringify:", e);
    return null;
  }
};

export default function TourUpdate() {
  const {
    editData: editDataArray,
    loading,
    error,
  } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();

  const [editableData, setEditableData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(tourById(id));
    }
    setEditableData(null);
    setOriginalData(null);
    setEditMode({});
    setSaveError(null);
  }, [id, dispatch]);

  useEffect(() => {
    if (!loading && Array.isArray(editDataArray) && editDataArray.length > 0) {
      const tourObject = deepCopy(editDataArray[0]);
      if (tourObject) {
        tourObject.termsAndConditions = tourObject.termsAndConditions || {
          cancellation: "",
          refund: "",
          bookingPolicy: "",
        };
        tourObject.amenities = Array.isArray(tourObject.amenities) ? tourObject.amenities : [];
        tourObject.inclusion = tourObject.inclusion || [];
        tourObject.exclusion = tourObject.exclusion || [];
        tourObject.dayWise = tourObject.dayWise || [];
        tourObject.themes = tourObject.themes || "";
        tourObject.starRating = tourObject.starRating ?? 0;
        tourObject.visitingPlaces =
          tourObject.visitingPlaces || tourObject.visitngPlaces || "";
      }
      setEditableData(tourObject);
      setOriginalData(deepCopy(tourObject));
      setEditMode({});
    } else if (!loading) {
      setEditableData(null);
      setOriginalData(null);
    }
  }, [editDataArray, loading]);

  const handleInputChange = useCallback((fieldName, value) => {
    setEditableData((prevData) => {
      if (!prevData) return null;
      const newData = deepCopy(prevData);
      if (!newData) return prevData;

      const dayWiseParts = fieldName.match(/dayWise-(\d+)-description/);
      const termsParts = fieldName.match(/termsAndConditions-(\w+)/);
      const otherArrayFieldNames = ["inclusion", "exclusion"];
      const numberFieldNames = ["price", "nights", "days", "starRating"];

      if (dayWiseParts) {
        const [, dayIndexStr] = dayWiseParts;
        const dayIdx = parseInt(dayIndexStr, 10);
        if (!newData.dayWise) newData.dayWise = [];
        while (newData.dayWise.length <= dayIdx) {
          newData.dayWise.push({
            day: newData.dayWise.length + 1,
            description: "",
          });
        }
        if (!newData.dayWise[dayIdx])
          newData.dayWise[dayIdx] = { day: dayIdx + 1, description: "" };
        const newDayWise = [...newData.dayWise];
        newDayWise[dayIdx] = { ...newDayWise[dayIdx], description: value };
        newData.dayWise = newDayWise;
      } else if (termsParts) {
        const [, termField] = termsParts;
        if (!newData.termsAndConditions) newData.termsAndConditions = {};
        newData.termsAndConditions[termField] = value;
      } else if (fieldName === "amenities") {
        newData[fieldName] = Array.isArray(value) ? value : [];
      } else if (otherArrayFieldNames.includes(fieldName)) {
        newData[fieldName] =
          typeof value === "string"
            ? value
                .split("\n")
                .map((item) => item.trim())
                .filter((item) => item)
            : [];
      } else if (numberFieldNames.includes(fieldName)) {
        const numValue = value === "" || value === null ? "" : Number(value);
        if (value === "" || value === null || !isNaN(numValue)) {
          newData[fieldName] = numValue;
        } else {
          console.warn(`Invalid number input for ${fieldName}: ${value}`);
        }
      } else if (fieldName === "from" || fieldName === "to") {
        newData[fieldName] = value ? `${value}T00:00:00.000Z` : null;
      } else {
        newData[fieldName] = value;
      }
      return newData;
    });
  }, []);

  const handleRatingChange = useCallback(
    (newValue) => {
      handleInputChange("starRating", newValue === null ? "" : newValue);
    },
    [handleInputChange],
  );

  const toggleEditMode = useCallback(
    (fieldName) => {
      const currentlyEditing = !!editMode[fieldName];

      if (currentlyEditing && originalData) {
        const dayWiseParts = fieldName.match(/dayWise-(\d+)-description/);
        const termsParts = fieldName.match(/termsAndConditions-(\w+)/);
        const otherArrayFieldNames = ["inclusion", "exclusion"];
        let originalValue;

        if (dayWiseParts) {
          const [, dayIndexStr] = dayWiseParts;
          const dayIdx = parseInt(dayIndexStr, 10);
          originalValue = originalData.dayWise?.[dayIdx]?.description;
        } else if (termsParts) {
          const [, termField] = termsParts;
          originalValue = originalData.termsAndConditions?.[termField];
        } else if (fieldName === "amenities") {
           originalValue = Array.isArray(originalData[fieldName]) ? originalData[fieldName] : [];
        } else if (otherArrayFieldNames.includes(fieldName)) {
          originalValue = Array.isArray(originalData[fieldName])
            ? originalData[fieldName].join("\n")
            : "";
        } else if (fieldName === "from" || fieldName === "to") {
          originalValue = originalData[fieldName]
            ? originalData[fieldName].split("T")[0]
            : "";
        } else {
          originalValue = originalData[fieldName];
        }
        handleInputChange(fieldName, originalValue ?? (fieldName === "amenities" ? [] : ""));
      }

      setEditMode((prev) => ({
        ...prev,
        [fieldName]: !currentlyEditing,
      }));
    },
    [editMode, originalData, handleInputChange],
  );

  const handleSaveChanges = async () => {
    if (!editableData || !editableData._id) {
      setSaveError("Error: Cannot save. Tour data or ID is missing.");
      console.error("Save Error: editableData or _id is missing", editableData);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const dataToSave = deepCopy(editableData);

    if (dataToSave) {
      ["price", "nights", "days", "starRating"].forEach((field) => {
        if (dataToSave[field] === "") {
          dataToSave[field] = null;
        }
      });
      dataToSave.amenities = Array.isArray(dataToSave.amenities) ? dataToSave.amenities : [];
    } else {
      setSaveError("Error preparing data for saving.");
      setIsSaving(false);
      return;
    }

    try {
      const result = await dispatch(
        tourUpdate({ id: dataToSave._id, data: dataToSave }),
      ).unwrap();
      setEditMode({});
      setOriginalData(deepCopy(dataToSave));
      console.log("Tour updated successfully:", result);
    } catch (err) {
      console.error("Failed to update tour:", err);
      const errorMessage =
        err?.message ||
        err?.error?.message ||
        err?.data?.message ||
        "An unknown error occurred during save.";
      setSaveError(`Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          p: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading tour details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Error loading tour details: {error.message || JSON.stringify(error)}
      </Alert>
    );
  }

  if (!editableData || !originalData) {
    return (
      <Alert severity="warning" sx={{ m: 4 }}>
        Tour data not found or is unavailable. Please check the ID or try again
        later.
      </Alert>
    );
  }

  const hasChanges =
    JSON.stringify(editableData) !== JSON.stringify(originalData);

  return (
    <Paper
      elevation={3}
      sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, margin: "auto", mt: 4, mb: 4 }}
    >
      <Typography variant="h5" gutterBottom component="h2">
        Update Tour Package Details (ID: {editableData._id})
      </Typography>
      <Typography variant="caption" display="block" gutterBottom sx={{ mb: 2 }}>
        Click the edit icon (✎) next to a field to modify it. Click 'Save
        Changes' below to persist updates. Fields marked with * are multi-line.
      </Typography>

      {saveError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setSaveError(null)}
        >
          {saveError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider sx={{ mb: 1 }}>
            <Typography variant="overline">Basic Info</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Agency Name"
            value={editableData.travelAgencyName ?? ""}
            fieldName="travelAgencyName"
            isEditing={!!editMode["travelAgencyName"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Visiting Places"
            value={editableData.visitingPlaces ?? ""}
            fieldName="visitingPlaces"
            isEditing={!!editMode["visitingPlaces"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="State"
            value={editableData.state ?? ""}
            fieldName="state"
            isEditing={!!editMode["state"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="City"
            value={editableData.city ?? ""}
            fieldName="city"
            isEditing={!!editMode["city"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Themes"
            value={editableData.themes ?? ""}
            fieldName="themes"
            isEditing={!!editMode["themes"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              p: 1.5,
              border: "1px solid",
              borderColor: editMode["starRating"] ? "primary.main" : "grey.300",
              borderRadius: 1,
              minHeight: "56px",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                minWidth: "100px",
                color: "text.secondary",
                mr: 1,
              }}
            >
              Rating:
            </Typography>
            {editMode["starRating"] ? (
              <Rating
                name="starRating"
                value={Number(editableData.starRating) || 0}
                onChange={(event, newValue) => {
                  handleRatingChange(newValue);
                }}
                precision={1}
              />
            ) : (
              <Rating
                name="starRating-read"
                value={Number(editableData.starRating) || 0}
                readOnly
                precision={1}
              />
            )}
            <Button
              size="small"
              onClick={() => toggleEditMode("starRating")}
              sx={{ ml: "auto", minWidth: "auto" }}
              aria-label={
                editMode["starRating"] ? "Cancel rating edit" : "Edit rating"
              }
            >
              {editMode["starRating"] ? "✕" : "✎"}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Duration & Price</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Package Price"
            value={editableData.price ?? ""}
            fieldName="price"
            isEditing={!!editMode["price"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Nights"
            value={editableData.nights ?? ""}
            fieldName="nights"
            isEditing={!!editMode["nights"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Days"
            value={editableData.days ?? ""}
            fieldName="days"
            isEditing={!!editMode["days"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Start Date"
            value={editableData.from ? editableData.from.split("T")[0] : ""}
            fieldName="from"
            isEditing={!!editMode["from"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="End Date"
            value={editableData.to ? editableData.to.split("T")[0] : ""}
            fieldName="to"
            isEditing={!!editMode["to"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Overview</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Overview*"
            value={editableData.overview ?? ""}
            fieldName="overview"
            isEditing={!!editMode["overview"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            multiline
            InputComponent={TextareaAutosize}
            minRows={4}
            maxRows={10}
            helperText="Provide a summary of the tour package."
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Details</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Select
              multiple
              value={editableData.amenities || []}
              onChange={(event) => handleInputChange("amenities", event.target.value)}
              renderValue={(selected) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(selected || []).map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      style={{ marginRight: 4 }}
                      onDelete={() => {
                        const currentAmenities = editableData.amenities || [];
                        const updatedAmenities = currentAmenities.filter((item) => item !== value);
                        handleInputChange("amenities", updatedAmenities);
                      }}
                      deleteIcon={
                        <IconButton size="small">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      }
                    />
                  ))}
                </div>
              )}
            >
              {["WiFi", "Parking", "Pool", "Gym", "Restaurant"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select amenities from the list. Click the cross to remove.</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Inclusions*"
            value={
              Array.isArray(editableData.inclusion)
                ? editableData.inclusion.join("\n")
                : ""
            }
            fieldName="inclusion"
            isEditing={!!editMode["inclusion"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            multiline
            InputComponent={TextareaAutosize}
            minRows={4}
            maxRows={8}
            helperText="Enter each item on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Exclusions*"
            value={
              Array.isArray(editableData.exclusion)
                ? editableData.exclusion.join("\n")
                : ""
            }
            fieldName="exclusion"
            isEditing={!!editMode["exclusion"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            multiline
            InputComponent={TextareaAutosize}
            minRows={4}
            maxRows={8}
            helperText="Enter each item on a new line."
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Terms & Conditions</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Cancellation Policy"
            value={editableData.termsAndConditions?.cancellation ?? ""}
            fieldName="termsAndConditions-cancellation"
            isEditing={!!editMode["termsAndConditions-cancellation"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            multiline
            InputComponent={TextareaAutosize}
            minRows={3}
            maxRows={6}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Refund Policy"
            value={editableData.termsAndConditions?.refund ?? ""}
            fieldName="termsAndConditions-refund"
            isEditing={!!editMode["termsAndConditions-refund"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            multiline
            InputComponent={TextareaAutosize}
            minRows={3}
            maxRows={6}
          />
        </Grid>
        <Grid item xs={12}>
          <EditableField
            label="Booking Policy"
            value={editableData.termsAndConditions?.bookingPolicy ?? ""}
            fieldName="termsAndConditions-bookingPolicy"
            isEditing={!!editMode["termsAndConditions-bookingPolicy"]}
            onChange={handleInputChange}
            onToggleEdit={toggleEditMode}
            multiline
            InputComponent={TextareaAutosize}
            minRows={3}
            maxRows={6}
          />
        </Grid>

        {editableData.dayWise && editableData.dayWise.length > 0 && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ mb: 1, mt: 2 }}>
                <Typography variant="overline">Day-wise Itinerary</Typography>
              </Divider>
            </Grid>
            {editableData.dayWise.map((day, dayIndex) => {
              const fieldName = `dayWise-${dayIndex}-description`;
              return (
                <Grid item xs={12} key={day._id || `day-${dayIndex}`}>
                  <EditableField
                    label={`Day ${day.day} Description*`}
                    value={day.description ?? ""}
                    fieldName={fieldName}
                    isEditing={!!editMode[fieldName]}
                    onChange={handleInputChange}
                    onToggleEdit={toggleEditMode}
                    multiline
                    InputComponent={TextareaAutosize}
                    minRows={3}
                    maxRows={8}
                  />
                </Grid>
              );
            })}
          </>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSaveChanges}
          disabled={isSaving || !hasChanges}
          aria-label="Save changes to tour package"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Paper>
  );
}
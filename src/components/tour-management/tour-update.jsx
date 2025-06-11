import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useParams } from "react-router-dom";
import { tourById, tourUpdate } from "../redux/reducers/tour/tour";
import EditableField from "./EditableField"; // Still used for some fields
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
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Rating from "@mui/material/Rating";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

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
        tourObject.amenities = Array.isArray(tourObject.amenities)
          ? tourObject.amenities
          : [];
        tourObject.termsAndConditions = tourObject.termsAndConditions || {
          cancellation: "",
          refund: "",
          bookingPolicy: "",
        };
        tourObject.inclusion = Array.isArray(tourObject.inclusion)
          ? tourObject.inclusion
          : [];
        tourObject.exclusion = Array.isArray(tourObject.exclusion)
          ? tourObject.exclusion
          : [];
        tourObject.dayWise = Array.isArray(tourObject.dayWise)
          ? tourObject.dayWise
          : [];
        tourObject.themes = tourObject.themes || "";
        tourObject.starRating = tourObject.starRating ?? 0;
        tourObject.visitingPlaces =
          tourObject.visitingPlaces || tourObject.visitngPlaces || "";
        tourObject.overview = tourObject.overview || ""; // Ensure overview exists
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
      if (!newData) {
        console.error("Deep copy failed in handleInputChange");
        return prevData;
      }

      const termsParts = fieldName.match(/termsAndConditions-(\w+)/);
      const dayWiseParts = fieldName.match(/dayWise-(\d+)-description/);

      if (fieldName === "amenities") {
        const incomingValue = Array.isArray(value)
          ? value
          : value
            ? [value]
            : [];
        newData[fieldName] = incomingValue;
      } else if (fieldName === "inclusion" || fieldName === "exclusion") {
        newData[fieldName] =
          typeof value === "string"
            ? value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
      } else if (termsParts) {
        const [, termField] = termsParts;
        if (!newData.termsAndConditions) newData.termsAndConditions = {};
        newData.termsAndConditions[termField] = value;
      } else if (dayWiseParts) {
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
        // Ensure description is updated correctly
        newData.dayWise = newData.dayWise.map((day, index) =>
          index === dayIdx ? { ...day, description: value } : day,
        );
      } else {
        const numberFieldNames = ["price", "nights", "days", "starRating"];
        if (numberFieldNames.includes(fieldName)) {
          const numValue = value === "" || value === null ? "" : Number(value);
          if (value === "" || value === null || !isNaN(numValue)) {
            newData[fieldName] = numValue;
          } else {
            console.warn(`Invalid number input for ${fieldName}: ${value}`);
          }
        } else if (fieldName === "from" || fieldName === "to") {
          newData[fieldName] = value ? `${value}T00:00:00.000Z` : null;
        }
        // Handle overview and other simple fields
        else {
          newData[fieldName] = value;
        }
      }
      return newData;
    });
  }, []);

  const handleAmenityDelete = useCallback((amenityToDelete) => {
    setEditableData((prevData) => {
      if (!prevData || !Array.isArray(prevData.amenities)) {
        return prevData;
      }
      const currentAmenities = prevData.amenities;
      const updatedAmenities = currentAmenities.filter(
        (item) => item !== amenityToDelete,
      );
      const newData = deepCopy(prevData);
      if (!newData) {
        return prevData;
      }
      newData.amenities = updatedAmenities;
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
        let originalValue;
        const dayWiseParts = fieldName.match(/dayWise-(\d+)-description/);
        const termsParts = fieldName.match(/termsAndConditions-(\w+)/);

        if (dayWiseParts) {
          const [, dayIndexStr] = dayWiseParts;
          const dayIdx = parseInt(dayIndexStr, 10);
          // Ensure originalData.dayWise exists and has the index
          originalValue = originalData.dayWise?.[dayIdx]?.description;
        } else if (termsParts) {
          const [, termField] = termsParts;
          originalValue = originalData.termsAndConditions?.[termField];
        } else if (fieldName === "inclusion" || fieldName === "exclusion") {
          originalValue = Array.isArray(originalData[fieldName])
            ? originalData[fieldName].join("\n")
            : "";
        } else if (fieldName === "amenities") {
          originalValue = Array.isArray(originalData[fieldName])
            ? originalData[fieldName]
            : [];
        } else if (fieldName === "from" || fieldName === "to") {
          originalValue = originalData[fieldName]
            ? originalData[fieldName].split("T")[0]
            : "";
        } else {
          // Default including overview
          originalValue = originalData[fieldName];
        }
        handleInputChange(fieldName, originalValue ?? "");
      }
      setEditMode((prev) => ({ ...prev, [fieldName]: !currentlyEditing }));
    },
    [editMode, originalData, handleInputChange],
  );

  const handleSaveChanges = async () => {
    if (!editableData || !editableData._id) {
      setSaveError("Error: Cannot save. Tour data or ID is missing.");
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
      dataToSave.amenities = Array.isArray(dataToSave.amenities)
        ? dataToSave.amenities
        : [];
      dataToSave.inclusion = Array.isArray(dataToSave.inclusion)
        ? dataToSave.inclusion
        : [];
      dataToSave.exclusion = Array.isArray(dataToSave.exclusion)
        ? dataToSave.exclusion
        : [];
      dataToSave.termsAndConditions = dataToSave.termsAndConditions || {};
      dataToSave.termsAndConditions.cancellation =
        dataToSave.termsAndConditions.cancellation || "";
      dataToSave.termsAndConditions.refund =
        dataToSave.termsAndConditions.refund || "";
      dataToSave.termsAndConditions.bookingPolicy =
        dataToSave.termsAndConditions.bookingPolicy || "";
      dataToSave.overview = dataToSave.overview || "";
      // Ensure dayWise descriptions are saved correctly (already handled by state structure)
      dataToSave.dayWise = Array.isArray(dataToSave.dayWise)
        ? dataToSave.dayWise.map((d) => ({
            ...d,
            description: d.description || "",
          }))
        : [];
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
      setEditableData(deepCopy(dataToSave));
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
        {" "}
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Loading tour details...</Typography>{" "}
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {" "}
        Error loading tour details:{" "}
        {error.message || JSON.stringify(error)}{" "}
      </Alert>
    );
  }
  if (!editableData || !originalData) {
    return (
      <Alert severity="warning" sx={{ m: 4 }}>
        {" "}
        Tour data not found or is unavailable. Please check the ID or try again
        later.{" "}
      </Alert>
    );
  }

  const hasChanges =
    JSON.stringify(editableData) !== JSON.stringify(originalData);

  const renderDottedList = (items, listType) => {
    const list = Array.isArray(items) ? items : [];
    const filteredList = list.filter((item) => item && item.trim() !== "");
    if (filteredList.length === 0) {
      return (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontStyle: "italic" }}
        >
          No {listType} listed.
        </Typography>
      );
    }
    return filteredList.map((item, index) => (
      <Box
        key={`${listType}-${index}`}
        sx={{
          border: "1px dotted",
          borderColor: "grey.500",
          borderRadius: "4px",
          p: 1,
          mb: 0.5,
          width: "fit-content",
          minWidth: "100px",
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        <Typography variant="body2">{item}</Typography>
      </Box>
    ));
  };

  const renderPolicyDisplay = (text) => {
    if (!text || text.trim() === "") {
      return (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontStyle: "italic" }}
        >
          Not specified.
        </Typography>
      );
    }
    return (
      <Box
        sx={{
          border: "1px dotted",
          borderColor: "grey.500",
          borderRadius: "4px",
          p: 1.5,
          mb: 0.5,
          maxWidth: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {" "}
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          {text}
        </Typography>{" "}
      </Box>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, margin: "auto", mt: 4, mb: 4 }}
    >
      <Typography variant="h5" gutterBottom component="h2">
        {" "}
        Update Tour Package Details for ({editableData?.travelAgencyName}){" "}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom sx={{ mb: 2 }}>
        {" "}
        Click the edit icon (✎) next to a field to modify it. Click 'Save
        Changes' below to persist updates. Fields marked with * are
        multi-line.{" "}
      </Typography>
      {saveError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setSaveError(null)}
        >
          {" "}
          {saveError}{" "}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* --- Basic Info (Uses EditableField) --- */}
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
            <IconButton
              size="small"
              onClick={() => toggleEditMode("starRating")}
              sx={{ ml: "auto", minWidth: "auto" }}
              aria-label={
                editMode["starRating"] ? "Cancel rating edit" : "Edit rating"
              }
            >
              {editMode["starRating"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Grid>

        {/* --- Duration & Price (Uses EditableField) --- */}
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

        {/* --- Overview (New Display/Edit Logic) --- */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Overview</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              Overview*:
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleEditMode("overview")}
              sx={{ ml: 1 }}
              aria-label={
                editMode["overview"] ? "Cancel overview edit" : "Edit overview"
              }
            >
              {editMode["overview"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          {editMode["overview"] ? (
            <FormControl fullWidth>
              <TextareaAutosize
                aria-label="Overview edit"
                minRows={4}
                maxRows={10}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderColor: "#ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                value={editableData.overview ?? ""}
                onChange={(e) => handleInputChange("overview", e.target.value)}
              />
              <FormHelperText>
                Provide a summary of the tour package.
              </FormHelperText>
            </FormControl>
          ) : (
            renderPolicyDisplay(editableData.overview)
          )}
        </Grid>

        {/* --- Details Separator --- */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Details</Typography>
          </Divider>
        </Grid>

        {/* --- Amenities (Separate Display) --- */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              Add Amenities:
            </Typography>
            <Select
              multiple
              value={editableData.amenities || []}
              onChange={(event) =>
                handleInputChange("amenities", event.target.value)
              }
              displayEmpty
              inputProps={{ "aria-label": "Select amenities to add" }}
            >
              <MenuItem value="" disabled sx={{ display: "none" }}>
                Select amenities to add...
              </MenuItem>
              {["WiFi", "Parking", "Pool", "Gym", "Restaurant"].map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ),
              )}
            </Select>
            <FormHelperText>
              Use the dropdown above to add amenities.
            </FormHelperText>
          </FormControl>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mt: 2,
              p: 1,
              border: "1px dashed",
              borderColor: "grey.400",
              borderRadius: 1,
              minHeight: "40px",
            }}
          >
            {(editableData.amenities || []).length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontStyle: "italic" }}
              >
                No amenities selected.
              </Typography>
            ) : (
              (editableData.amenities || []).map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  onDelete={() => handleAmenityDelete(amenity)}
                  deleteIcon={<CloseIcon fontSize="small" />}
                />
              ))
            )}
          </Box>
          <FormHelperText>
            Click the cross (✕) on an amenity above to remove it.
          </FormHelperText>
        </Grid>

        {/* --- Inclusions --- */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              Inclusions:
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleEditMode("inclusion")}
              sx={{ ml: 1 }}
              aria-label={
                editMode["inclusion"]
                  ? "Cancel inclusions edit"
                  : "Edit inclusions"
              }
            >
              {editMode["inclusion"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          {editMode["inclusion"] ? (
            <FormControl fullWidth>
              <TextareaAutosize
                aria-label="Inclusions edit"
                minRows={4}
                maxRows={8}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderColor: "#ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                value={
                  Array.isArray(editableData.inclusion)
                    ? editableData.inclusion.join("\n")
                    : ""
                }
                onChange={(e) => handleInputChange("inclusion", e.target.value)}
              />
              <FormHelperText>Enter each item on a new line.</FormHelperText>
            </FormControl>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {" "}
              {renderDottedList(editableData.inclusion, "inclusions")}{" "}
            </Box>
          )}
        </Grid>

        {/* --- Exclusions --- */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              Exclusions:
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleEditMode("exclusion")}
              sx={{ ml: 1 }}
              aria-label={
                editMode["exclusion"]
                  ? "Cancel exclusions edit"
                  : "Edit exclusions"
              }
            >
              {editMode["exclusion"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          {editMode["exclusion"] ? (
            <FormControl fullWidth>
              <TextareaAutosize
                aria-label="Exclusions edit"
                minRows={4}
                maxRows={8}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderColor: "#ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                value={
                  Array.isArray(editableData.exclusion)
                    ? editableData.exclusion.join("\n")
                    : ""
                }
                onChange={(e) => handleInputChange("exclusion", e.target.value)}
              />
              <FormHelperText>Enter each item on a new line.</FormHelperText>
            </FormControl>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {" "}
              {renderDottedList(editableData.exclusion, "exclusions")}{" "}
            </Box>
          )}
        </Grid>

        {/* --- Terms & Conditions --- */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 1, mt: 2 }}>
            <Typography variant="overline">Terms & Conditions</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              Cancellation Policy:
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleEditMode("termsAndConditions-cancellation")}
              sx={{ ml: 1 }}
              aria-label={
                editMode["termsAndConditions-cancellation"]
                  ? "Cancel edit"
                  : "Edit Cancellation Policy"
              }
            >
              {" "}
              {editMode["termsAndConditions-cancellation"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}{" "}
            </IconButton>
          </Box>
          {editMode["termsAndConditions-cancellation"] ? (
            <FormControl fullWidth>
              {" "}
              <TextareaAutosize
                aria-label="Cancellation Policy edit"
                minRows={3}
                maxRows={6}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderColor: "#ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                value={editableData.termsAndConditions?.cancellation ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "termsAndConditions-cancellation",
                    e.target.value,
                  )
                }
              />{" "}
            </FormControl>
          ) : (
            renderPolicyDisplay(editableData.termsAndConditions?.cancellation)
          )}
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              Refund Policy:
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleEditMode("termsAndConditions-refund")}
              sx={{ ml: 1 }}
              aria-label={
                editMode["termsAndConditions-refund"]
                  ? "Cancel edit"
                  : "Edit Refund Policy"
              }
            >
              {" "}
              {editMode["termsAndConditions-refund"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}{" "}
            </IconButton>
          </Box>
          {editMode["termsAndConditions-refund"] ? (
            <FormControl fullWidth>
              {" "}
              <TextareaAutosize
                aria-label="Refund Policy edit"
                minRows={3}
                maxRows={6}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderColor: "#ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                value={editableData.termsAndConditions?.refund ?? ""}
                onChange={(e) =>
                  handleInputChange("termsAndConditions-refund", e.target.value)
                }
              />{" "}
            </FormControl>
          ) : (
            renderPolicyDisplay(editableData.termsAndConditions?.refund)
          )}
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              Booking Policy:
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleEditMode("termsAndConditions-bookingPolicy")}
              sx={{ ml: 1 }}
              aria-label={
                editMode["termsAndConditions-bookingPolicy"]
                  ? "Cancel edit"
                  : "Edit Booking Policy"
              }
            >
              {" "}
              {editMode["termsAndConditions-bookingPolicy"] ? (
                <CloseIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}{" "}
            </IconButton>
          </Box>
          {editMode["termsAndConditions-bookingPolicy"] ? (
            <FormControl fullWidth>
              {" "}
              <TextareaAutosize
                aria-label="Booking Policy edit"
                minRows={3}
                maxRows={6}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderColor: "#ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                value={editableData.termsAndConditions?.bookingPolicy ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "termsAndConditions-bookingPolicy",
                    e.target.value,
                  )
                }
              />{" "}
            </FormControl>
          ) : (
            renderPolicyDisplay(editableData.termsAndConditions?.bookingPolicy)
          )}
        </Grid>

        {/* --- DayWise Itinerary (New Display/Edit Logic) --- */}
        {editableData.dayWise && editableData.dayWise.length > 0 && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ mb: 1, mt: 2 }}>
                <Typography variant="overline">Day-wise Itinerary</Typography>
              </Divider>
            </Grid>
            {editableData.dayWise.map((day, dayIndex) => {
              const fieldName = `dayWise-${dayIndex}-description`;
              const isEditing = !!editMode[fieldName];
              return (
                <Grid item xs={12} key={day._id || `day-${dayIndex}`}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >{`Day ${day.day} Description*:`}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleEditMode(fieldName)}
                      sx={{ ml: 1 }}
                      aria-label={
                        isEditing
                          ? `Cancel Day ${day.day} edit`
                          : `Edit Day ${day.day} description`
                      }
                    >
                      {isEditing ? (
                        <CloseIcon fontSize="small" />
                      ) : (
                        <EditIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                  {isEditing ? (
                    <FormControl fullWidth>
                      <TextareaAutosize
                        aria-label={`Day ${day.day} description edit`}
                        minRows={3}
                        maxRows={8}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderColor: "#ccc",
                          borderRadius: "4px",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                        }}
                        value={day.description ?? ""} // Use day.description directly from map
                        onChange={(e) =>
                          handleInputChange(fieldName, e.target.value)
                        }
                      />
                    </FormControl>
                  ) : (
                    renderPolicyDisplay(day.description) // Reuse the same display function
                  )}
                </Grid>
              );
            })}
          </>
        )}
      </Grid>

      {/* --- Save Button --- */}
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Tooltip title="Mark as Accepted">
          <IconButton
            color="success"
            onClick={() => handleInputChange("isAccepted", true)}
            aria-label="Accept tour"
            sx={{
              border: "1px solid #4caf50",
              bgcolor: editableData.isAccepted ? "#e8f5e9" : "transparent",
            }}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Mark as Declined">
          <IconButton
            color="error"
            onClick={() => handleInputChange("isAccepted", false)}
            aria-label="Decline tour"
            sx={{
              border: "1px solid #f44336",
              bgcolor:
                editableData.isAccepted === false ? "#ffebee" : "transparent",
            }}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, color: editableData.isAccepted ? "green" : "red" }}>
  {editableData.isAccepted ? "Currently Accepted" : "Currently Not Accepted"}
</Typography>

    </Paper>
  );
}

import React from "react";
import { TextField, IconButton, Box, Typography, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";
  try {
    return new Date(isoDateString).toISOString().split("T")[0];
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};

function EditableField({
  label,
  value,
  fieldName,
  isEditing,
  onChange,
  onToggleEdit,
  type = "text",
  multiline = false,
  rows = 1,
}) {
  const displayValue = type === "date" ? formatDateForInput(value) : value;

  const handleInputChange = (e) => {
     const newValue = type === "date" ? new Date(e.target.value).toISOString() : e.target.value;
     onChange(fieldName, newValue);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2, width: '100%' }}>
      <Typography variant="body1" sx={{ minWidth: 150, mr: 2, fontWeight: 'medium' }}>
        {label}:
      </Typography>
      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            type={type === 'date' ? 'date' : (type === 'number' ? 'number' : 'text')}
            multiline={multiline}
            rows={multiline ? rows : 1}
            value={displayValue ?? ""}
            onChange={handleInputChange}
            InputLabelProps={type === 'date' ? { shrink: true } : {}}
          />
          <Tooltip title="Cancel Edit">
            <IconButton onClick={() => onToggleEdit(fieldName)} size="small" sx={{ ml: 1 }}>
              <CancelIcon color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, minHeight: '40px' }}>
           <Typography variant="body1" sx={{ flexGrow: 1, mr: 1, whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
            {type === 'date' ? (value ? new Date(value).toLocaleDateString() : 'N/A') : (value || 'N/A')}
          </Typography>
          <Tooltip title={`Edit ${label}`}>
            <IconButton onClick={() => onToggleEdit(fieldName)} size="small">
              <EditIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

export default EditableField;
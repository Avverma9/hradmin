import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

// Material-UI Imports
import {
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Paper,
  Skeleton,
  Input,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
} from "@mui/material";

// Material-UI Icons
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CategoryIcon from "@mui/icons-material/Category";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Local Imports
import { addFood, deleteFood, getHotelById } from "../redux/reducers/hotel";
import { useLoader } from "../../../utils/loader";

const EMPTY_FOODS = [];
const selectHotelFoods = (state) => state.hotel.byId?.foods ?? EMPTY_FOODS;

const AddFoodModal = ({ open, onClose, hotelId = null, onUpdated = () => {} }) => {
  const [foodName, setFoodName] = useState("");
  const [foodPrice, setFoodPrice] = useState("");
  const [foodType, setFoodType] = useState("");
  const [about, setAbout] = useState("");
  const [images, setImages] = useState([]);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. The new "refresh trigger" state ---
  const [refreshKey, setRefreshKey] = useState(0);

  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const foods = useSelector(selectHotelFoods);

  useEffect(() => {
    if (open && hotelId) {
      setIsLoading(true);
      dispatch(getHotelById(hotelId)).finally(() => setIsLoading(false));
    }
    // --- 2. The useEffect now depends on refreshKey ---
  }, [open, hotelId, dispatch, refreshKey]);

  const handleAccordionChange = (event, isExpanded) => {
    setIsAddingFood(isExpanded);
  };

  const handleAddFood = async () => {
    if (!foodName || !foodPrice || !foodType) {
      toast.error("Please fill all required fields.");
      return;
    }
    showLoader();
    const formData = new FormData();
    formData.append("hotelId", hotelId);
    formData.append("name", foodName);
    formData.append("price", foodPrice);
    formData.append("foodType", foodType);
    formData.append("about", about);
    images.forEach((file) => formData.append("images", file));

    try {
      await dispatch(addFood(formData)).unwrap();
      dispatch(getHotelById(hotelId));
      onUpdated();
      toast.success("Food item added successfully!");

      // --- 3. Trigger the refresh after adding ---
      setRefreshKey((oldKey) => oldKey + 1);

      resetForm();
      setIsAddingFood(false);
    } catch (error) {
      toast.error(error?.message || "Error adding food");
    } finally {
      hideLoader();
    }
  };

  const resetForm = () => {
    setFoodName("");
    setFoodPrice("");
    setFoodType("");
    setAbout("");
    setImages([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.slice(0, 5));
    if (files.length > 5) {
      toast.warn("You can only upload a maximum of 5 images.");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDeleteFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await dispatch(deleteFood({ hotelId, foodId })).unwrap();
        onUpdated();
        toast.success("Food item deleted.");

        // --- 3. Trigger the refresh after deleting ---
        setRefreshKey((oldKey) => oldKey + 1);
      } catch (error) {
        toast.error(error?.message || "Error deleting item.");
      }
    }
  };

  const handleClose = () => {
    resetForm();
    setIsAddingFood(false);
    onClose();
  };

  const renderAddFoodForm = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            size="small"
            label="Food Name"
            fullWidth
            required
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            size="small"
            label="Price"
            fullWidth
            required
            type="number"
            value={foodPrice}
            onChange={(e) => setFoodPrice(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl size="small" fullWidth required>
            <InputLabel>Food Type</InputLabel>
            <Select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              label="Food Type"
            >
              <MenuItem value="Appetizer">Appetizer</MenuItem>
              <MenuItem value="Main Course">Main Course</MenuItem>
              <MenuItem value="Dessert">Dessert</MenuItem>
              <MenuItem value="Beverage">Beverage</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            size="small"
            label="About Food"
            fullWidth
            multiline
            rows={2}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Paper
            component="label"
            htmlFor="upload-file"
            variant="outlined"
            sx={{
              p: 1.5,
              textAlign: "center",
              cursor: "pointer",
              borderStyle: "dashed",
            }}
          >
            <UploadFileIcon sx={{ mr: 1, fontSize: 18 }} />
            Click to Upload
            <Input
              type="file"
              inputProps={{ multiple: true, accept: "image/*" }}
              onChange={handleFileChange}
              sx={{ display: "none" }}
              id="upload-file"
            />
          </Paper>
          {images.length > 0 && (
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {images.map((file, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={URL.createObjectURL(file)}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "rgba(255,255,255,0.8)",
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        <Button onClick={resetForm} variant="outlined" size="small">
          Clear
        </Button>
        <Button onClick={handleAddFood} variant="contained" size="small">
          Save Item
        </Button>
      </Stack>
    </Stack>
  );

  const renderFoodList = () => (
    <Stack spacing={1.5}>
      {isLoading ? (
        Array.from(new Array(3)).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={80}
            sx={{ borderRadius: 1.5 }}
          />
        ))
      ) : foods && foods.length > 0 ? (
        foods.map((food) => (
          <Paper
            key={food.foodId}
            variant="outlined"
            sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box
              component="img"
              src={food?.images?.[0] || "/assets/placeholder.jpg"}
              alt={food?.name}
              sx={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 1.5,
              }}
            />
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {food?.name || "Unnamed"}
              </Typography>
              <Tooltip title={food?.about || ""} arrow>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {food?.about || "No description"}
                </Typography>
              </Tooltip>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip
                  icon={<CurrencyRupeeIcon />}
                  label={food?.price || "0"}
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<CategoryIcon />}
                  label={food?.foodType || "N/A"}
                  color="info"
                  size="small"
                />
              </Stack>
            </Stack>
            <IconButton
              size="small"
              onClick={() => handleDeleteFood(food.foodId)}
            >
              <DeleteOutlineIcon color="error" />
            </IconButton>
          </Paper>
        ))
      ) : (
        <Box sx={{ textAlign: "center", p: 3, bgcolor: "background.default" }}>
          <RestaurantMenuIcon sx={{ fontSize: 48, color: "grey.400" }} />
          <Typography sx={{ mt: 1, fontWeight: "medium" }}>
            No Menu Items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expand the section above to add a new item.
          </Typography>
        </Box>
      )}
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Manage Hotel Menu
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, bgcolor: "background.default" }}>
        <Accordion
          expanded={isAddingFood}
          onChange={handleAccordionChange}
          sx={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            "&.Mui-expanded": {
              margin: 0,
            },
            "&:before": {
              display: "none",
            },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">
              {isAddingFood ? "Adding New Item..." : "Add New Food Item"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{renderAddFoodForm()}</AccordionDetails>
        </Accordion>
        <Box mt={2}>{renderFoodList()}</Box>
      </DialogContent>
      <DialogActions
        sx={{ p: "16px 24px", borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddFoodModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string,
  onUpdated: PropTypes.func,
};

export default AddFoodModal;

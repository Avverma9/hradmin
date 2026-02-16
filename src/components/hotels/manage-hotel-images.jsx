/* eslint-disable no-restricted-syntax */
import axios from "axios";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  InsertPhoto as InsertPhotoIcon,
} from "@mui/icons-material";

import { localUrl } from "../../../utils/util";

const ImageUpload = ({ open, hotelId, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState([]); // Array<File>
  const [uploading, setUploading] = useState(false);
  const [id, setId] = useState("");

  const isMobile = useMediaQuery("(max-width:600px)");

  const previews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      // cleanup object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        const hotelData = response?.data?.data ?? response?.data ?? {};
        const imageList = Array.isArray(hotelData?.images)
          ? hotelData.images
          : Array.isArray(hotelData?.basicInfo?.images)
            ? hotelData.basicInfo.images
            : [];

        setImages(imageList);
        setId(hotelData._id || hotelData.hotelId || "");
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    if (open && hotelId) fetchImages();
  }, [open, hotelId]);

  const handleDelete = async (imageUrl) => {
    try {
      await axios.delete(
        `${localUrl}/hotels/${hotelId}/images/imageUrl?imageUrl=${imageUrl}`
      );
      toast.success("Image deleted successfully");
      setImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const addFiles = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setSelectedFiles((prev) => [...prev, ...arr]);
  };

  const handleFileChange = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    for (const file of selectedFiles) formData.append("images", file);

    setUploading(true);
    try {
      await axios.patch(`${localUrl}/update-hotels-image-by-hotel-id/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Images uploaded successfully");
      setSelectedFiles([]);

      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      const hotelData = response?.data?.data ?? response?.data ?? {};
      const imageList = Array.isArray(hotelData?.images)
        ? hotelData.images
        : Array.isArray(hotelData?.basicInfo?.images)
          ? hotelData.basicInfo.images
          : [];
      setImages(imageList);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const cols = isMobile ? 2 : 3;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: isMobile ? "100vw" : 520,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
        }}
      >
        {/* Header (sticky) */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              Hotel Images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Drag & drop, preview, then upload
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, py: 2, overflow: "auto", flex: 1 }}>
          {/* Dropzone */}
          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
              textAlign: "center",
              bgcolor: "background.default",
            }}
          >
            <CloudUploadIcon color="action" />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Drop images here
            </Typography>
            <Typography variant="caption" color="text.secondary">
              or choose files from your device
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }}>
              <Button component="label" variant="outlined" startIcon={<AddIcon />}>
                Browse
                <input hidden type="file" multiple accept="image/*" onChange={handleFileChange} />
              </Button>

              <Button
                variant="contained"
                onClick={handleUploadImages}
                disabled={uploading || selectedFiles.length === 0}
                startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              >
                {uploading ? "Uploading..." : `Upload (${selectedFiles.length || 0})`}
              </Button>
            </Stack>
          </Box>

          {/* Selected queue */}
          {selectedFiles.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected files
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {selectedFiles.map((f, idx) => (
                  <Chip
                    key={`${f.name}-${idx}`}
                    icon={<InsertPhotoIcon />}
                    label={f.name}
                    onDelete={() =>
                      setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    variant="outlined"
                  />
                ))}
              </Stack>

              {/* Preview strip */}
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, overflowX: "auto", pb: 1 }}>
                {previews.map((p) => (
                  <Box
                    key={p.url}
                    component="img"
                    src={p.url}
                    alt={p.name}
                    sx={{
                      width: 84,
                      height: 84,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "1px solid",
                      borderColor: "divider",
                      flex: "0 0 auto",
                    }}
                  />
                ))}
              </Stack>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Existing images */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Uploaded images ({images.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : images.length === 0 ? (
            <Typography color="text.secondary">No images found.</Typography>
          ) : (
            <ImageList cols={cols} gap={10} sx={{ m: 0 }}>
              {images.map((src, index) => (
                <ImageListItem key={`${src}-${index}`}>
                  <img
                    src={src}
                    alt={`Hotel ${index}`}
                    loading="lazy"
                    style={{ borderRadius: 12 }}
                  />
                  <ImageListItemBar
                    title={`#${index + 1}`}
                    subtitle={new URL(src).hostname}
                    actionIcon={
                      <IconButton
                        sx={{ color: "white" }}
                        onClick={() => handleDelete(src)}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Box>

        {/* Footer (sticky) */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1.5,
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

ImageUpload.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};

export default ImageUpload;

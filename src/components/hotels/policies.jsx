import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import {
  HiOutlineDocumentText
} from "react-icons/hi";
import {
  FaBed,
  FaReply,
  FaUtensils,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPencilAlt,
} from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { useDispatch } from "react-redux";
import { updateHotelPolicy } from "../redux/reducers/hotel";

export default function Policies({ hotel }) {
  const dispatch = useDispatch();
  const hotelId = hotel?.hotelId;
  const [editedPolicies, setEditedPolicies] = useState(hotel?.policies || []);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedPolicies(hotel?.policies || []);
  }, [hotel]);

  const handlePolicyChange = (policyIdx, key, value) => {
    const updated = editedPolicies.map((policy, idx) =>
      idx === policyIdx ? { ...policy, [key]: value } : policy
    );
    setEditedPolicies(updated);
  };

  const handleSave = () => {
    dispatch(
      updateHotelPolicy({
        hotelId,
        policies: editedPolicies,
      })
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPolicies(hotel?.policies || []);
    setIsEditing(false);
  };

  const yesNoPolicies = [
    "petsAllowed",
    "bachelorAllowed",
    "smokingAllowed",
    "alcoholAllowed",
    "unmarriedCouplesAllowed",
    "internationalGuestAllowed",
  ];

  const multiLinePolicies = [
    "hotelsPolicy",
    "returnPolicy",
    "checkInPolicy",
    "checkOutPolicy",
  ];

  const labelMap = {
    hotelsPolicy: "Hotels Policy",
    checkInPolicy: "Check-In Policy",
    checkOutPolicy: "Check-Out Policy",
    outsideFoodPolicy: "Outside Food Policy",
    cancellationPolicy: "Cancellation Policy",
    paymentMode: "Payment Mode",
    returnPolicy: "Return Policy",
    onDoubleSharing: "On Season Double Sharing",
    onQuadSharing: "On Season Quad Sharing",
    onTrippleSharing: "On Season Triple Sharing",
    onBulkBooking: "On Season Bulk Booking",
    onMoreThanFour: "On Season More Than Four",
    offDoubleSharing: "Off Season Double Sharing",
    offQuadSharing: "Off Season Quad Sharing",
    offTrippleSharing: "Off Season Triple Sharing",
    offBulkBooking: "Off Season Bulk Booking",
    offMoreThanFour: "Off Season More Than Four",
    petsAllowed: "Pets Allowed",
    bachelorAllowed: "Bachelor Allowed",
    smokingAllowed: "Smoking Allowed",
    alcoholAllowed: "Alcohol Allowed",
    unmarriedCouplesAllowed: "Unmarried Couples Allowed",
    internationalGuestAllowed: "International Guest Allowed",
  };

  const getIcon = (key, value) => {
    if (yesNoPolicies.includes(key)) {
      return value === "Yes" ? (
        <MdCheckCircle style={{ color: "#10b981" }} />
      ) : (
        <MdCancel style={{ color: "#ef4444" }} />
      );
    }
    if (key.toLowerCase().includes("calendar") || key.includes("check"))
      return <FaCalendarAlt />;
    if (key.toLowerCase().includes("bed")) return <FaBed />;
    if (key.toLowerCase().includes("food")) return <FaUtensils />;
    if (key.toLowerCase().includes("payment")) return <FaMoneyBillWave />;
    if (key.toLowerCase().includes("cancel") || key.toLowerCase().includes("return"))
      return <FaReply />;
    return <HiOutlineDocumentText />;
  };

  const handleBulletInput = (e, policyIdx, key) => {
    let value = e.target.value;
    if (e.key === "Enter") {
      e.preventDefault();
      const cursorPos = e.target.selectionStart;
      const newValue =
        value.substring(0, cursorPos) + "\n• " + value.substring(cursorPos);
      handlePolicyChange(policyIdx, key, newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPos + 3;
      }, 0);
    } else {
      handlePolicyChange(policyIdx, key, value);
    }
  };

  const renderPolicyValue = (policyIdx, key, value) => {
    if (!value || key === "_id") return null;

    if (isEditing) {
      if (yesNoPolicies.includes(key)) {
        return (
          <Select
            size="small"
            value={value}
            onChange={(e) => handlePolicyChange(policyIdx, key, e.target.value)}
            sx={{ minWidth: 120, bgcolor: "background.paper" }}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        );
      }
      if (multiLinePolicies.includes(key)) {
        return (
          <TextField
            size="small"
            fullWidth
            multiline
            rows={3}
            value={value}
            onChange={(e) => handlePolicyChange(policyIdx, key, e.target.value)}
            onKeyDown={(e) => handleBulletInput(e, policyIdx, key)}
            placeholder="• Start writing policy points here..."
          />
        );
      }
      return (
        <TextField
          size="small"
          fullWidth
          value={value}
          onChange={(e) => handlePolicyChange(policyIdx, key, e.target.value)}
        />
      );
    } else {
      if (multiLinePolicies.includes(key)) {
        const lines = value.split('\n').filter(line => line.trim() !== '');
        return (
          <Box component="ul" sx={{ paddingLeft: 2, margin: 0 }}>
            {lines.map((line, index) => (
              <Typography
                component="li"
                key={index}
                variant="body2"
                sx={{
                  color: "text.secondary",
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                  ml: 1,
                  my: 0.5,
                }}
              >
                {line.replace(/^•\s*/, '')}
              </Typography>
            ))}
          </Box>
        );
      }
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: "primary.main" }}
        >
          Hotel Policies
        </Typography>
        {!isEditing && (
          <Button
            variant="contained"
            startIcon={<FaPencilAlt />}
            onClick={() => setIsEditing(true)}
            sx={{ textTransform: 'none' }}
          >
            Edit Policies
          </Button>
        )}
      </Box>
      {editedPolicies?.length > 0 ? (
        editedPolicies.map((policy, pIdx) => (
          <Card
            key={policy._id || pIdx}
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    <HiOutlineDocumentText /> General Policies
                  </Typography>
                  <Grid container spacing={2}>
                    {multiLinePolicies.map((key) =>
                      policy[key] ? (
                        <Grid item xs={12} md={6} key={key}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {labelMap[key]}
                            </Typography>
                            {renderPolicyValue(pIdx, key, policy[key])}
                          </Box>
                        </Grid>
                      ) : null
                    )}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    <MdCheckCircle /> Guest Rules
                  </Typography>
                  <Grid container spacing={2}>
                    {yesNoPolicies.map((key) =>
                      policy[key] ? (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ fontSize: 22, color: "text.secondary" }}>
                              {getIcon(key, policy[key])}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {labelMap[key]}
                              </Typography>
                              {renderPolicyValue(pIdx, key, policy[key])}
                            </Box>
                          </Box>
                        </Grid>
                      ) : null
                    )}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    <FaUtensils /> Other Policies
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(policy).map(([key, value]) =>
                      !value ||
                      key === "_id" ||
                      multiLinePolicies.includes(key) ||
                      yesNoPolicies.includes(key)
                        ? null
                        : (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box sx={{ fontSize: 22, color: "text.secondary" }}>
                                  {getIcon(key, value)}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {labelMap[key] || key}
                                  </Typography>
                                  {renderPolicyValue(pIdx, key, value)}
                                </Box>
                              </Box>
                            </Grid>
                          )
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography align="center" color="text.secondary">
          No policies available.
        </Typography>
      )}
      {isEditing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            size="large"
            sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: "bold", textTransform: "none" }}
          >
            Save Policies
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            size="large"
            sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: "bold", textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
}
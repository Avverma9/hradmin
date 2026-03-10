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
  Divider,
  Stack,
  Chip,
  CardHeader,
  useTheme,
  alpha
} from "@mui/material";
import { HiOutlineDocumentText } from "react-icons/hi";
import {
  FaBed,
  FaReply,
  FaUtensils,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPencilAlt,
} from "react-icons/fa";
import { MdCancel, MdCheckCircle, MdPolicy } from "react-icons/md";
import { useDispatch } from "react-redux";
import { createHotelPolicy, patchHotelPolicyFields } from "../redux/reducers/hotel";

const EMPTY_POLICY = {
  hotelsPolicy: "",
  checkInPolicy: "",
  checkOutPolicy: "",
  outsideFoodPolicy: "",
  cancellationPolicy: "",
  paymentMode: "",
  petsAllowed: "No",
  bachelorAllowed: "No",
  smokingAllowed: "No",
  alcoholAllowed: "No",
  unmarriedCouplesAllowed: "No",
  internationalGuestAllowed: "No",
  refundPolicy: "",
  returnPolicy: "",
  onDoubleSharing: "",
  onQuadSharing: "",
  onBulkBooking: "",
  onTrippleSharing: "",
  onMoreThanFour: "",
  offDoubleSharing: "",
  offQuadSharing: "",
  offBulkBooking: "",
  offTrippleSharing: "",
  offMoreThanFour: "",
  onDoubleSharingAp: "",
  onQuadSharingAp: "",
  onBulkBookingAp: "",
  onTrippleSharingAp: "",
  onMoreThanFourAp: "",
  offDoubleSharingAp: "",
  offQuadSharingAp: "",
  offBulkBookingAp: "",
  offTrippleSharingAp: "",
  offMoreThanFourAp: "",
  onDoubleSharingMAp: "",
  onQuadSharingMAp: "",
  onBulkBookingMAp: "",
  onTrippleSharingMAp: "",
  onMoreThanFourMAp: "",
  offDoubleSharingMAp: "",
  offQuadSharingMAp: "",
  offBulkBookingMAp: "",
  offTrippleSharingMAp: "",
  offMoreThanFourMAp: "",
};

const POLICY_KEYS = Object.keys(EMPTY_POLICY);

const humanizePolicyKey = (key = "") =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Tripple/g, "Triple")
    .replace(/\bMAp\b/g, "MAP")
    .replace(/\bAp\b/g, "AP");

const normalizePolicyRecord = (policy = {}) => ({
  ...EMPTY_POLICY,
  ...policy,
  refundPolicy: policy?.refundPolicy ?? "",
  returnPolicy: policy?.returnPolicy ?? "",
});

const isRenderableScalar = (value) =>
  value === null ||
  value === undefined ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

const toDisplayValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => (isRenderableScalar(item) ? String(item) : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
};

export default function Policies({ hotel, onUpdated = () => {} }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [editedPolicies, setEditedPolicies] = useState(
    hotel?.policies?.length ? hotel.policies.map(normalizePolicyRecord) : [{ ...EMPTY_POLICY }]
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedPolicies(
      hotel?.policies?.length ? hotel.policies.map(normalizePolicyRecord) : [{ ...EMPTY_POLICY }]
    );
  }, [hotel]);

  const handlePolicyChange = (policyIdx, key, value) => {
    const updated = editedPolicies.map((policy, idx) =>
      idx === policyIdx ? { ...policy, [key]: value } : policy
    );
    setEditedPolicies(updated);
  };

  const buildPolicyPayload = (policy = {}) => {
    const payload = { hotelId: hotel?.hotelId };
    POLICY_KEYS.forEach((key) => {
      if (policy[key] !== undefined) {
        payload[key] = policy[key];
      }
    });
    return payload;
  };

  const handleSave = () => {
    const currentPolicy = editedPolicies?.[0] || { ...EMPTY_POLICY };
    const payload = buildPolicyPayload(currentPolicy);
    const action = Array.isArray(hotel?.policies) && hotel.policies.length > 0
      ? patchHotelPolicyFields(payload)
      : createHotelPolicy(payload);

    dispatch(action)
      .unwrap()
      .then(() => {
        onUpdated();
        setIsEditing(false);
      });
  };

  const handleCancel = () => {
    setEditedPolicies(
      hotel?.policies?.length ? hotel.policies.map(normalizePolicyRecord) : [{ ...EMPTY_POLICY }]
    );
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
    "refundPolicy",
    "returnPolicy",
    "checkInPolicy",
    "checkOutPolicy",
    "cancellationPolicy",
  ];

  const labelMap = {
    hotelsPolicy: "Hotels Policy",
    checkInPolicy: "Check-In Policy",
    checkOutPolicy: "Check-Out Policy",
    outsideFoodPolicy: "Outside Food Policy",
    cancellationPolicy: "Cancellation Policy",
    paymentMode: "Payment Mode",
    refundPolicy: "Refund Policy",
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
    onDoubleSharingAp: "On Season Double Sharing AP",
    onQuadSharingAp: "On Season Quad Sharing AP",
    onBulkBookingAp: "On Season Bulk Booking AP",
    onTrippleSharingAp: "On Season Triple Sharing AP",
    onMoreThanFourAp: "On Season More Than Four AP",
    offDoubleSharingAp: "Off Season Double Sharing AP",
    offQuadSharingAp: "Off Season Quad Sharing AP",
    offBulkBookingAp: "Off Season Bulk Booking AP",
    offTrippleSharingAp: "Off Season Triple Sharing AP",
    offMoreThanFourAp: "Off Season More Than Four AP",
    onDoubleSharingMAp: "On Season Double Sharing MAP",
    onQuadSharingMAp: "On Season Quad Sharing MAP",
    onBulkBookingMAp: "On Season Bulk Booking MAP",
    onTrippleSharingMAp: "On Season Triple Sharing MAP",
    onMoreThanFourMAp: "On Season More Than Four MAP",
    offDoubleSharingMAp: "Off Season Double Sharing MAP",
    offQuadSharingMAp: "Off Season Quad Sharing MAP",
    offBulkBookingMAp: "Off Season Bulk Booking MAP",
    offTrippleSharingMAp: "Off Season Triple Sharing MAP",
    offMoreThanFourMAp: "Off Season More Than Four MAP",
    petsAllowed: "Pets Allowed",
    bachelorAllowed: "Bachelor Allowed",
    smokingAllowed: "Smoking Allowed",
    alcoholAllowed: "Alcohol Allowed",
    unmarriedCouplesAllowed: "Unmarried Couples Allowed",
    internationalGuestAllowed: "International Guest Allowed",
  };

  const getFieldLabel = (key) => labelMap[key] || humanizePolicyKey(key);

  const basePricingPolicies = [
    "onDoubleSharing", "onTrippleSharing", "onQuadSharing", "onMoreThanFour", "onBulkBooking",
    "offDoubleSharing", "offTrippleSharing", "offQuadSharing", "offMoreThanFour", "offBulkBooking"
  ];

  const apPricingPolicies = [
    "onDoubleSharingAp", "onTrippleSharingAp", "onQuadSharingAp", "onMoreThanFourAp", "onBulkBookingAp",
    "offDoubleSharingAp", "offTrippleSharingAp", "offQuadSharingAp", "offMoreThanFourAp", "offBulkBookingAp"
  ];

  const mapPricingPolicies = [
    "onDoubleSharingMAp", "onTrippleSharingMAp", "onQuadSharingMAp", "onMoreThanFourMAp", "onBulkBookingMAp",
    "offDoubleSharingMAp", "offTrippleSharingMAp", "offQuadSharingMAp", "offMoreThanFourMAp", "offBulkBookingMAp"
  ];

  const allPricingPolicies = [...basePricingPolicies, ...apPricingPolicies, ...mapPricingPolicies];

  const getIcon = (key, value) => {
    if (yesNoPolicies.includes(key)) {
      return value === "Yes" ? (
        <MdCheckCircle style={{ color: theme.palette.success.main, fontSize: 18 }} />
      ) : (
        <MdCancel style={{ color: theme.palette.error.main, fontSize: 18 }} />
      );
    }
    if (key.toLowerCase().includes("calendar") || key.includes("check")) return <FaCalendarAlt style={{ fontSize: 16 }} />;
    if (key.toLowerCase().includes("bed")) return <FaBed style={{ fontSize: 16 }} />;
    if (key.toLowerCase().includes("food")) return <FaUtensils style={{ fontSize: 16 }} />;
    if (key.toLowerCase().includes("payment")) return <FaMoneyBillWave style={{ fontSize: 16 }} />;
    if (key.toLowerCase().includes("cancel") || key.toLowerCase().includes("return")) return <FaReply style={{ fontSize: 16 }} />;
    return <HiOutlineDocumentText style={{ fontSize: 18 }} />;
  };

  const handleBulletInput = (e, policyIdx, key) => {
    let value = e.target.value;
    if (e.key === "Enter") {
      e.preventDefault();
      const cursorPos = e.target.selectionStart;
      const newValue = value.substring(0, cursorPos) + "\n• " + value.substring(cursorPos);
      handlePolicyChange(policyIdx, key, newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPos + 3;
      }, 0);
    }
  };

  const renderPolicyValue = (policyIdx, key, value, hidePlaceholder = false) => {
    const displayValue = toDisplayValue(value);
    if ((!isEditing && !displayValue) || key === "_id") return null;
    
    if (isEditing) {
      if (yesNoPolicies.includes(key)) {
        return (
          <Select
            size="small"
            value={displayValue || "No"}
            onChange={(e) => handlePolicyChange(policyIdx, key, e.target.value)}
            sx={{ width: '100%', bgcolor: "background.paper", typography: 'body2' }}
          >
            <MenuItem value="Yes" sx={{ typography: 'body2' }}>Yes</MenuItem>
            <MenuItem value="No" sx={{ typography: 'body2' }}>No</MenuItem>
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
            value={displayValue || ""}
            onChange={(e) => handlePolicyChange(policyIdx, key, e.target.value)}
            onKeyDown={(e) => handleBulletInput(e, policyIdx, key)}
            placeholder={hidePlaceholder ? "" : "• Start writing..."}
            InputProps={{ sx: { typography: 'body2', p: 1.5 } }}
          />
        );
      }
      return (
        <TextField
          size="small"
          fullWidth
          value={displayValue || ""}
          onChange={(e) => handlePolicyChange(policyIdx, key, e.target.value)}
          placeholder={hidePlaceholder ? "" : getFieldLabel(key)}
          InputProps={{ sx: { typography: 'body2' } }}
        />
      );
    } else {
      if (yesNoPolicies.includes(key)) {
        return (
          <Chip 
            label={displayValue} 
            size="small" 
            variant="outlined"
            color={displayValue === "Yes" ? "success" : "error"}
            sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, px: 0.5, bgcolor: 'background.paper' }}
          />
        );
      }
      if (multiLinePolicies.includes(key)) {
        const lines = displayValue.split('\n').filter(line => line.trim() !== '');
        return (
          <Box component="ul" sx={{ pl: 2.5, m: 0, mt: 0.5 }}>
            {lines.map((line, index) => (
              <Typography
                component="li"
                key={index}
                variant="body2"
                color="text.secondary"
                sx={{
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                  mb: 0.5,
                  lineHeight: 1.6
                }}
              >
                {line.replace(/^•\s*/, '')}
              </Typography>
            ))}
          </Box>
        );
      }
      return (
        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
          {displayValue}
        </Typography>
      );
    }
  };

  const renderPricingGrid = (pIdx, policy, keysArray, title) => {
    const hasData = isEditing || keysArray.some(k => toDisplayValue(policy[k]));
    if (!hasData) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
          {title}
        </Typography>
        <Grid container spacing={2} columns={{ xs: 10, sm: 10, md: 10 }}>
          {keysArray.map((key) =>
            (isEditing || toDisplayValue(policy[key])) ? (
              <Grid item xs={10} sm={5} md={2} key={key}>
                <Box>
                  <Typography variant="caption" fontWeight={600} mb={0.5} display="block" color="text.primary">
                    {getFieldLabel(key).replace('On Season ', 'On: ').replace('Off Season ', 'Off: ')}
                  </Typography>
                  {renderPolicyValue(pIdx, key, policy[key], true)}
                </Box>
              </Grid>
            ) : null
          )}
        </Grid>
      </Box>
    );
  };

  const firstColumnPolicies = ["hotelsPolicy", "cancellationPolicy", "outsideFoodPolicy"];
  const secondColumnPolicies = ["refundPolicy", "returnPolicy", "checkInPolicy", "checkOutPolicy", "paymentMode"];

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          title="Property Policies & Rules"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          action={
            !isEditing && (
              <Button
                variant="contained"
                startIcon={<FaPencilAlt size={12} />}
                onClick={() => setIsEditing(true)}
                size="small"
                disableElevation
                sx={{ borderRadius: 1.5 }}
              >
                Edit Policies
              </Button>
            )
          }
          sx={{ p: 2.5, pb: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}
        />
        <Divider />
        
        <CardContent sx={{ p: { xs: 2, md: 4 }, '&:last-child': { pb: { xs: 2, md: 4 } } }}>
          {editedPolicies?.length > 0 ? (
            editedPolicies.map((policy, pIdx) => (
              <Stack spacing={4} key={policy._id || pIdx}>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight="700" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <HiOutlineDocumentText size={20} /> General Policies
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        {firstColumnPolicies.map((key) =>
                          (isEditing || policy[key]) ? (
                            <Box key={key} sx={{ width: '100%' }}>
                              <Typography variant="body2" fontWeight={600} mb={0.5}>
                                {getFieldLabel(key)}
                              </Typography>
                              {renderPolicyValue(pIdx, key, policy[key])}
                            </Box>
                          ) : null
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        {secondColumnPolicies.map((key) =>
                          (isEditing || policy[key]) ? (
                            <Box key={key} sx={{ width: '100%' }}>
                              <Typography variant="body2" fontWeight={600} mb={0.5}>
                                {getFieldLabel(key)}
                              </Typography>
                              {renderPolicyValue(pIdx, key, policy[key])}
                            </Box>
                          ) : null
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" fontWeight="700" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <FaMoneyBillWave size={18} /> Sharing & Pricing Rules
                  </Typography>
                  <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: alpha(theme.palette.grey[100], 0.6), borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    {renderPricingGrid(pIdx, policy, basePricingPolicies, "Base Plan Pricing")}
                    {(isEditing || apPricingPolicies.some(k => toDisplayValue(policy[k]))) && <Divider sx={{ my: 2 }} />}
                    {renderPricingGrid(pIdx, policy, apPricingPolicies, "AP Plan Pricing")}
                    {(isEditing || mapPricingPolicies.some(k => toDisplayValue(policy[k]))) && <Divider sx={{ my: 2 }} />}
                    {renderPricingGrid(pIdx, policy, mapPricingPolicies, "MAP Plan Pricing")}
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" fontWeight="700" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <MdCheckCircle size={20} /> Guest Rules & Permissions
                  </Typography>
                  <Grid container spacing={2}>
                    {yesNoPolicies.map((key) =>
                      (isEditing || policy[key]) ? (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={key}>
                          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.8), border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                              {getFieldLabel(key)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                              {getIcon(key, policy[key])}
                              <Box sx={{ flex: 1, width: '100%' }}>
                                {renderPolicyValue(pIdx, key, policy[key])}
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ) : null
                    )}
                  </Grid>
                </Box>

                {Object.entries(policy).some(([key, value]) => 
                  !["_id", "hotelId", ...firstColumnPolicies, ...secondColumnPolicies, ...allPricingPolicies, ...yesNoPolicies].includes(key) && 
                  (isEditing || toDisplayValue(value)) && 
                  (isRenderableScalar(value) || Array.isArray(value))
                ) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="700" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                        <MdPolicy size={20} /> Other Policies
                      </Typography>
                      <Grid container spacing={4}>
                        {Object.entries(policy).map(([key, value]) =>
                          (!isEditing && !toDisplayValue(value)) ||
                          key === "_id" ||
                          key === "hotelId" ||
                          firstColumnPolicies.includes(key) ||
                          secondColumnPolicies.includes(key) ||
                          allPricingPolicies.includes(key) ||
                          yesNoPolicies.includes(key) ||
                          (!isRenderableScalar(value) && !Array.isArray(value))
                            ? null : (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                                <Box sx={{ color: "text.secondary", mt: 0.25 }}>
                                  {getIcon(key, value)}
                                </Box>
                                <Box sx={{ flex: 1, width: '100%' }}>
                                  <Typography variant="body2" fontWeight={600} mb={0.5}>
                                    {labelMap[key] || humanizePolicyKey(key)}
                                  </Typography>
                                  {renderPolicyValue(pIdx, key, value)}
                                </Box>
                              </Stack>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  </>
                )}
              </Stack>
            ))
          ) : (
            <Stack alignItems="center" justifyContent="center" py={8} spacing={1.5}>
              <HiOutlineDocumentText size={48} color={theme.palette.text.disabled} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                No Policies Configured
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This property currently does not have any policies set up.
              </Typography>
            </Stack>
          )}

          {isEditing && (
            <Box sx={{ mt: 5, pt: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                sx={{ borderRadius: 1.5, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disableElevation
                sx={{ borderRadius: 1.5, px: 4 }}
              >
                Save Policies
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
import React from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import {
  FaBed,
  FaReply,
  FaUtensils,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import "./policies.css";
export default function Policies({ hotel }) {
  const yesNoPolicies = [
    "petsAllowed",
    "bachelorAllowed",
    "smokingAllowed",
    "alcoholAllowed",
    "unmarriedCouplesAllowed",
    "internationalGuestAllowed",
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
    onDoubleSharingAp: "On Season Double Sharing AP",
    onQuadSharingAp: "On Season Quad Sharing AP",
    onTrippleSharingAp: "On Season Triple Sharing AP",
    onBulkBookingAp: "On Season Bulk Booking AP",
    onMoreThanFourAp: "On Season More Than Four AP",
    offDoubleSharingAp: "Off Season Double Sharing AP",
    offQuadSharingAp: "Off Season Quad Sharing AP",
    offTrippleSharingAp: "Off Season Triple Sharing AP",
    offBulkBookingAp: "Off Season Bulk Booking AP",
    offMoreThanFourAp: "Off Season More Than Four AP",
    onDoubleSharingMAp: "On Season Double Sharing M.A.P",
    onQuadSharingMAp: "On Season Quad Sharing M.A.P",
    onTrippleSharingMAp: "On Season Triple Sharing M.A.P",
    onBulkBookingMAp: "On Season Bulk Booking M.A.P",
    onMoreThanFourMAp: "On Season More Than Four M.A.P",
    offDoubleSharingMAp: "Off Season Double Sharing M.A.P",
    offQuadSharingMAp: "Off Season Quad Sharing M.A.P",
    offTrippleSharingMAp: "Off Season Triple Sharing M.A.P",
    offBulkBookingMAp: "Off Season Bulk Booking M.A.P",
    offMoreThanFourMAp: "Off Season More Than Four M.A.P",
    petsAllowed: "Pets Allowed",
    bachelorAllowed: "Bachelor Allowed",
    smokingAllowed: "Smoking Allowed",
    alcoholAllowed: "Alcohol Allowed",
    unmarriedCouplesAllowed: "Unmarried Couples Allowed",
    internationalGuestAllowed: "International Guest Allowed",
  };

  const getIcon = (key, value) => {
    if (yesNoPolicies.includes(key)) {
      return value === "Yes" ? <MdCheckCircle /> : <MdCancel />;
    }

    if (key.toLowerCase().includes("calendar") || key.includes("check"))
      return <FaCalendarAlt />;
    if (key.toLowerCase().includes("bed")) return <FaBed />;
    if (key.toLowerCase().includes("food")) return <FaUtensils />;
    if (key.toLowerCase().includes("payment")) return <FaMoneyBillWave />;
    if (
      key.toLowerCase().includes("cancel") ||
      key.toLowerCase().includes("return")
    )
      return <FaReply />;

    return <HiOutlineDocumentText />;
  };

  return (
    <div className="policy-page">
      <h4 className="policy-heading">Policies</h4>
      {hotel?.policies?.length > 0 ? (
        hotel.policies.map((policy) => (
          <div key={policy._id}>
            {Object.entries(policy).map(([key, value]) => {
              if (!value || key === "_id") return null;
              return (
                <div className="policy-line" key={key}>
                  <span className="icon">{getIcon(key, value)}</span>
                  <span className="label">{labelMap[key] || key}:</span>
                  <span className="value">
                    {key === "returnPolicy"
                      ? value
                          .split("•")
                          .filter((line) => line.trim() !== "")
                          .map((line, idx) => (
                            <React.Fragment key={idx}>
                              • {line.trim()}
                              <br />
                            </React.Fragment>
                          ))
                      : value}
                  </span>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <p>No policies available.</p>
      )}
    </div>
  );
}

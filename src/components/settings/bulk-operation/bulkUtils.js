// src/utils/executeAction.js

import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { applyCoupon, removeBulkCoupon } from "src/components/redux/reducers/coupon";
import { act } from "react";


export const executeBulkAction = async ({
    action,
    selectedHotels,
    data,
    couponCode,
    selectedRoomType,
    dispatch,
}) => {
    const ids = Array.from(selectedHotels);
    if (ids.length === 0) return toast.warning("No hotels selected.");

    if (action === "export") {
        exportToExcel(ids, data);
        return;
    }

    if (action === "applyCoupon") {
        if (!couponCode) return toast.warning("Please enter a coupon code.");
        if (!selectedRoomType) return toast.warning("Please select a room type.");

        try {
            const selectedData = data.filter((hotel) =>
                ids.includes(hotel.hotelId)
            );
            const roomIds = [];
            selectedData.forEach((hotel) => {
                hotel.rooms?.forEach((room) => {
                    if (room.type === selectedRoomType) {
                        roomIds.push(room.roomId);
                    }
                });
            });

            if (roomIds.length === 0) {
                toast.warning("No rooms found for selected room type.");
                return;
            }

            const payload = {
                couponCode,
                hotelIds: ids,
                roomIds,
            };

            await dispatch(applyCoupon(payload)).unwrap();
            toast.success("Coupon applied successfully!");
        } catch (error) {
            toast.error(error?.message || error?.error || "Failed to apply coupon");
        } finally {
        }
    }

    if(action === "removeCoupon") {
        try {
            await dispatch(removeBulkCoupon({ hotelIds: ids })).unwrap();
            toast.success("Coupons removed successfully!");
        } catch (error) {
            toast.error(error?.message || error?.error || "Failed to remove coupons.");
        } finally {
        }
    }

};

const exportToExcel = (selectedHotels, data) => {
    const selectedData = data.filter((hotel) =>
        selectedHotels.includes(hotel.hotelId)
    );
    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Hotels");
    XLSX.writeFile(wb, "Selected_Hotels.xlsx");
    toast.success("Exported selected hotels to Excel.");
};
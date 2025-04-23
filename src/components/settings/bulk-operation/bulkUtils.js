// src/utils/executeAction.js

import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { applyCoupon, removeBulkCoupon } from "src/components/redux/reducers/coupon";
import { changeHotelStatus } from "src/components/redux/reducers/bulk";
export const executeBulkAction = async ({
  action,
  selectedHotels,
  data,
  showLoader,
  hideLoader,
  couponCode,
  selectedRoomType,
  dispatch,
}) => {
  const ids = Array.from(selectedHotels);
  if (ids.length === 0) {
    toast.warning("No hotels selected.");
    return;
  }

  if (action === "remove") {
    const payload = {
      hotelIds: ids,
      isAccepted: false,
    };
    try {
      showLoader()
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels removed successfully!");
    } catch (error) {
      toast.error("Failed to remove hotels.");
    }finally{
      hideLoader()
    }
  }

  if (action === "accept") {
    const payload = {
      hotelIds: ids,
      isAccepted: true,
    };
    try {
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept hotels.");
    }
  }

  if (action === "moveFront") {
    const payload = {
      hotelIds: ids,
      onFront: true,
    };
    try {
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels moved to front successfully!");
    } catch (error) {
      toast.error("Failed to move hotels to front.");
    }
  }

  if (action === "removeFront") {
    const payload = {
      hotelIds: ids,
      onFront: false,
    };
    try {
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels removed from front successfully!");
    } catch (error) {
      toast.error("Failed to remove hotels from front.");
    }
  }

  if (action === "export") {
    exportToExcel(ids, data);
    return;
  }

  if (action === "applyCoupon") {
    if (!couponCode) {
      toast.warning("Please enter a coupon code.");
      return;
    }

    if (!selectedRoomType) {
      toast.warning("Please select a room type.");
      return;
    }

    try {
      const selectedData = data.filter(hotel => ids.includes(hotel.hotelId));
      const roomIds = [];

      selectedData.forEach(hotel => {
        hotel.rooms?.forEach(room => {
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
      toast.error("Failed to apply coupon.");
    }
  }

  if (action === "removeCoupon") {
    const payload = {
      hotelIds: ids,
    };
    try {
      await dispatch(removeBulkCoupon(payload)).unwrap();
      toast.success("Coupons removed successfully!");
    } catch (error) {
      toast.error("Failed to remove coupons.");
    }
  }
};

// Export helper
const exportToExcel = (selectedHotels, data) => {
  const selectedData = data.filter(hotel => selectedHotels.includes(hotel.hotelId));
  const ws = XLSX.utils.json_to_sheet(selectedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Selected Hotels");
  XLSX.writeFile(wb, "Selected_Hotels.xlsx");
  toast.success("Exported selected hotels to Excel.");
};

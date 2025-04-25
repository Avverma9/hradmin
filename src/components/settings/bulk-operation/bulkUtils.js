// src/utils/executeAction.js

import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  applyCoupon,
  removeBulkCoupon,
} from "src/components/redux/reducers/coupon";
import {
  bulkDelete,
  changeHotelStatus,
} from "src/components/redux/reducers/bulk";
import { reloadPage } from "../../../../utils/util";

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
      showLoader();
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels removed successfully!");
    } catch (error) {
      toast.error("Failed to remove hotels.");
    } finally {
      hideLoader();
      reloadPage()
    }
  }

  if (action === "accept") {
    const payload = {
      hotelIds: ids,
      isAccepted: true,
    };
    try {
      showLoader();
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept hotels.");
    } finally {
      hideLoader();
      reloadPage()
    }
  }

  if (action === "moveFront") {
    const payload = {
      hotelIds: ids,
      onFront: true,
    };
    try {
      showLoader();
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels moved to front successfully!");
    } catch (error) {
      toast.error("Failed to move hotels to front.");
    } finally {
      hideLoader();
      reloadPage()
    }
  }

  if (action === "removeFront") {
    const payload = {
      hotelIds: ids,
      onFront: false,
    };
    try {
      showLoader();
      await dispatch(changeHotelStatus(payload)).unwrap();
      toast.success("Hotels removed from front successfully!");
    } catch (error) {
      toast.error("Failed to remove hotels from front.");
    } finally {
      hideLoader();
      reloadPage()
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
    try {
      const selectedData = data.filter((hotel) => ids.includes(hotel.hotelId));
      const roomIds = [];
      selectedData.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          if (room.type === selectedRoomType) {
            roomIds.push(room.roomId);
          }
        });
      });

      const payload = {
        couponCode,
        hotelIds: ids,
        roomIds,
      };

      showLoader();
      await dispatch(applyCoupon(payload)).unwrap();
    } catch (error) {
      toast.error("Failed to apply coupon.");
    } finally {
      hideLoader();
      reloadPage()
    }
  }

  if (action === "removeCoupon") {
    const payload = {
      hotelIds: ids,
    };
    try {
      showLoader();
      await dispatch(removeBulkCoupon(payload)).unwrap();
      toast.success("Coupons removed successfully!");
    } catch (error) {
      toast.error("Failed to remove coupons.");
    } finally {
      hideLoader();
      reloadPage()
    }
  }

  if (action === "delete") {
    const payload = {
      hotelIds: ids,
    };
    try {
      showLoader();
      await dispatch(bulkDelete(payload)).unwrap();
      toast.success("Hotels deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete hotels.");
    } finally {
      hideLoader();
      reloadPage()
    }
  }

  const getAppliedCouponHotels = async () => {
    try {
      await dispatch(getCouponAppliedHotels());
    } catch (error) {
      toast.error("Failed to fetch hotels with applied coupons.");
    }
  };

  useEffect(() => {
    if (action === "applyCoupon" && selectedHotels.size > 0) {
      const selectedData = data.filter((hotel) =>
        selectedHotels.has(hotel.hotelId),
      );

      const roomTypes = new Set();

      selectedData.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          if (room.type) {
            roomTypes.add(room.type);
          }
        });
      });

      setAvailableRoomTypes(Array.from(roomTypes));
    }

    if (action === "removeCoupon") {
      getAppliedCouponHotels();
    }
  }, [action, selectedHotels, data]);
};

// Export helper
const exportToExcel = (selectedHotels, data) => {
  const selectedData = data.filter((hotel) =>
    selectedHotels.includes(hotel.hotelId),
  );
  const ws = XLSX.utils.json_to_sheet(selectedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Selected Hotels");
  XLSX.writeFile(wb, "Selected_Hotels.xlsx");
  toast.success("Exported selected hotels to Excel.");
};

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAmenities } from "src/components/redux/reducers/additional";

export const useHotelAmenities = () => {
  const dispatch = useDispatch();
  const hotelAmenities = useSelector((state) => state.additional.hotelAmenities);

  useEffect(() => {
    dispatch(getAmenities());
  }, [dispatch]);

  return hotelAmenities;
};

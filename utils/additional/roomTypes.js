import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  getRoomTypes } from "src/components/redux/reducers/additional-fields/additional";

export const useRoomTypes = () => {
  const dispatch = useDispatch();
  const roomTypes = useSelector((state) => state.additional.roomTypes);

  useEffect(() => {
    dispatch(getRoomTypes());
  }, [dispatch]);

  return roomTypes;
};

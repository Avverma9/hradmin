import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBedTypes } from "src/components/redux/reducers/additional-fields/additional";

export const useBedTypes = () => {
  const dispatch = useDispatch();
  const bedTypes = useSelector((state) => state.additional.bedTypes);

  useEffect(() => {
    dispatch(getBedTypes());
  }, [dispatch]);

  return bedTypes;
};

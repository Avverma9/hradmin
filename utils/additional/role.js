import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRole } from "src/components/redux/reducers/additional-fields/additional";

export const useRole = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.additional.role);

  useEffect(() => {
    dispatch(getRole());
  }, [dispatch]);

  return role;
};

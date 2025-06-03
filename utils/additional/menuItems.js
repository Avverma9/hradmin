import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMenuItems } from "src/components/redux/reducers/additional";

export const useMenuItems = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.additional.menuItems);

  useEffect(() => {
    dispatch(getMenuItems());
  }, [dispatch]);

  return menuItems;
};

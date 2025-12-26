import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMenuItems } from "src/components/redux/reducers/additional-fields/additional";

export const useMenuItems = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.additional.menuItems);

  useEffect(() => {
    dispatch(getMenuItems());
  }, [dispatch]);

  // Ensure we always return a safe array (filter out falsy entries)
  return Array.isArray(menuItems) ? menuItems.filter(Boolean) : [];
};

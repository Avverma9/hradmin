import { useDispatch } from "react-redux";
import { role } from "./util";
import { useEffect } from "react";
import { getTravelAmenities } from "src/components/redux/reducers/additional";

// Custom Hook to fetch and export travelAmenities
export const TravelAmenties = () => {
  const dispatch = useDispatch();

  // Getting the travelAmenities data from the Redux store
  const { travelAmenities } = useSelector((state) => state.additional);

  useEffect(() => {
    // Dispatching action to get travel amenities
    dispatch(getTravelAmenities());
  }, [dispatch]);

  // Returning travelAmenities to be used anywhere else
  return travelAmenities;
};


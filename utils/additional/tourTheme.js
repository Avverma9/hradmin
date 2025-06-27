import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTourThemes } from "src/components/redux/reducers/additional-fields/additional";

export const useTourTheme = () => {
    const dispatch = useDispatch();
    const tourTheme = useSelector((state) => state.additional.tourThemes);

    useEffect(() => {
        dispatch(getTourThemes());
    }, [dispatch]);

    return tourTheme;
}
import { Box, Container } from "@mui/material";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { userId as currentUserId } from "../../../../utils/util";
import { bookNow, tourById } from "../../redux/reducers/tour/tour";
import TourBookingForm from "../../tour-management/tour-booking";

export default function TourBookingPage() {
  const { tourId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tour = useSelector((state) => state.tour?.editData?.[0]);

  useEffect(() => {
    if (tourId) dispatch(tourById(tourId));
  }, [tourId, dispatch]);

  const handleBookingSubmit = async (payload) => {
    try {
      const res = await dispatch(bookNow(payload)).unwrap();
      toast.success("Booking successful");
      // If backend returns booking id or detail, navigate to bookings page
      navigate("/travel-bookings");
    } catch (err) {
      toast.error(err || "Booking failed");
    }
  };

  return (
    <>
      <Helmet>
        <title> Book Tour | Roomsstay </title>
      </Helmet>
      <Box sx={{ py: 6 }}>
        <Container maxWidth="md">
          <TourBookingForm
            tour={tour}
            gstData={{}}
            userId={currentUserId}
            onBookingSubmit={handleBookingSubmit}
          />
        </Container>
      </Box>
    </>
  );
}

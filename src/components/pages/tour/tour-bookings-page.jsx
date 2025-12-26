import { Helmet } from "react-helmet-async";
import TourBookings from "../../tour-management/my-tour-bookings";

export default function TourBookingsPage() {
  return (
    <>
      <Helmet>
        <title> My Bookings | Roomsstay </title>
      </Helmet>
      <TourBookings />
    </>
  );
}

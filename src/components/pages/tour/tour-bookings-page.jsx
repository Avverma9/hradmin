import { Helmet } from "react-helmet-async";
// Tour bookings component (Tailwind-based)
import TourBookings from "../../tour-management/my-tour-bookings";

export default function TourBookingsPage() {
  return (
    <>
      <Helmet>
        <title> My Tour Bookings | Roomsstay </title>
      </Helmet>
      <TourBookings />
    </>
  );
}

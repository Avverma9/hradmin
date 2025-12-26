import { Helmet } from "react-helmet-async";
import MyCabBooking from "../../tour-management/my-cab-booking";

export default function TravelBookingsPage() {
  return (
    <>
      <Helmet>
        <title> My Travel Bookings | Roomsstay </title>
      </Helmet>
      <MyCabBooking />
    </>
  );
}

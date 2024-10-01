/* eslint-disable perfectionist/sort-imports */
import { Helmet } from 'react-helmet-async';
import BookingDetail from 'src/sections/bookings/bookingDetails';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Booking details | Roomsstay </title>
      </Helmet>

      <BookingDetail />
    </>
  );
}

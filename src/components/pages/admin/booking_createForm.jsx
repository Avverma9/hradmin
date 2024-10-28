import { Helmet } from 'react-helmet-async';

import BookingCreate from '../../settings/booking/create_booking';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Bookings | Roomsstay </title>
      </Helmet>

      <BookingCreate />
    </>
  );
}

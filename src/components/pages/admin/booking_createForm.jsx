import { Helmet } from 'react-helmet-async';

import BookingCreate from '../../settings/booking/userSelection';

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

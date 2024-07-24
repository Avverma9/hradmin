import { Helmet } from 'react-helmet-async';

import BookingsView from 'src/sections/bookings/Bookings';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Bookings | Roomsstay </title>
      </Helmet>

      <BookingsView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import BookingsView from '../../bookings/admin/Bookings';

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

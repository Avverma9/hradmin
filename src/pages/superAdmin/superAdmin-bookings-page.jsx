import { Helmet } from 'react-helmet-async';

import SuperAdminBookingsView from 'src/sections/bookings/superAdmin/YourBookings';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Bookings | Roomsstay </title>
      </Helmet>

      <SuperAdminBookingsView />
    </>
  );
}

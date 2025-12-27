import { Helmet } from 'react-helmet-async';

import AdminTourBook from '../../settings/tour/tour-bookings';

// ----------------------------------------------------------------------

export default function AdminTourBooking() {
  return (
    <>
      <Helmet>
        <title> Tour Booking | Roomsstay </title>
      </Helmet>

      <AdminTourBook />
    </>
  );
}

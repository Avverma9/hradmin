import { Helmet } from 'react-helmet-async';

import BookingPage from '../../settings/booking/book-now'; // Capitalize the component name

// ----------------------------------------------------------------------

export default function BookNowPage() {
  return (
    <>
      <Helmet>
        <title>Book Now | Roomsstay</title>
      </Helmet>
      <BookingPage /> {/* Use the component as a JSX element */}
    </>
  );
}

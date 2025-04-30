import { Helmet } from 'react-helmet-async';

import TravelBookingsPage from '../../settings/travelBookings';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Travel Bookings | Roomsstay </title>
            </Helmet>

            <TravelBookingsPage />
        </>
    );
}

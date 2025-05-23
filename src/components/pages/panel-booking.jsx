import { Helmet } from 'react-helmet-async';

import PanelBookings from '../settings/booking/bookings';

// ----------------------------------------------------------------------

export default function UserPage() {
    return (
        <>
            <Helmet>
                <title> Panel Bookings | Hotel Roomsstay </title>
            </Helmet>

            <PanelBookings />
        </>
    );
}

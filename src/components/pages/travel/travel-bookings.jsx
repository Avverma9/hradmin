import { Helmet } from 'react-helmet-async';

import TravelTMS from '../../travel-managment/my-booking';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Travel bookings | Roomsstay </title>
            </Helmet>

            <TravelTMS />
        </>
    );
}

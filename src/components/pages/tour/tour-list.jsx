import { Helmet } from 'react-helmet-async';

import TourData from '../../tour-management/tour-list';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Tour Data | Roomsstay </title>
            </Helmet>

            <TourData />
        </>
    );
}

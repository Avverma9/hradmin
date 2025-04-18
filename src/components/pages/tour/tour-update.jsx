import { Helmet } from 'react-helmet-async';

import TourUpdatePage from '../../tour-management/tour-update';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Update Tour | Roomsstay </title>
            </Helmet>

            <TourUpdatePage />
        </>
    );
}

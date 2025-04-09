import { Helmet } from 'react-helmet-async';

import TourForm from '../../tour-management/tour-form';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Add Tour Data | Roomsstay </title>
            </Helmet>

            <TourForm />
        </>
    );
}

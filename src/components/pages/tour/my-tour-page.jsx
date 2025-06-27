import { Helmet } from 'react-helmet-async';

import MyTour from '../../tour-management/my-tour';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> My Tour  | Roomsstay </title>
            </Helmet>

            <MyTour />
        </>
    );
}

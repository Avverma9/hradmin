import { Helmet } from 'react-helmet-async';

import CarsPage from '../../travel-managment/cars';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Cars | Roomsstay </title>
            </Helmet>

            <CarsPage />
        </>
    );
}

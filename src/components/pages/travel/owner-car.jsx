import { Helmet } from 'react-helmet-async';

import OwnerCar from '../../travel-managment/my-car';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Owner Car | Roomsstay </title>
            </Helmet>

            <OwnerCar />
        </>
    );
}

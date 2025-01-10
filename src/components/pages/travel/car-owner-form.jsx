import { Helmet } from 'react-helmet-async';

import CarOwnerForm from '../../travel/car-owner-form';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Add Car Owner | Roomsstay </title>
            </Helmet>

            <CarOwnerForm />
        </>
    );
}

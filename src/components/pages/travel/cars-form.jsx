import { Helmet } from 'react-helmet-async';

import CarForm from '../../travel-managment/car-form';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Add Cars | Roomsstay </title>
            </Helmet>

            <CarForm />
        </>
    );
}

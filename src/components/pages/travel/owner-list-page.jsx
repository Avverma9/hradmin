import { Helmet } from 'react-helmet-async';

import OwnerList from '../../travel-managment/owner-list';

// ----------------------------------------------------------------------

export default function AllUserPages() {
    return (
        <>
            <Helmet>
                <title> Owners List | Roomsstay </title>
            </Helmet>

            <OwnerList />
        </>
    );
}

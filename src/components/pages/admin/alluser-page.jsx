import { Helmet } from 'react-helmet-async';

import AllUserPage from '../../settings/AllUsers';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Users | Roomsstay </title>
      </Helmet>

      <AllUserPage />
    </>
  );
}

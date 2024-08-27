import { Helmet } from 'react-helmet-async';

import AllUserPage from 'src/sections/settings/users';

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

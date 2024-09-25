import { Helmet } from 'react-helmet-async';

import Availability from 'src/sections/settings/availability';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Users | Roomsstay </title>
      </Helmet>

      <Availability />
    </>
  );
}

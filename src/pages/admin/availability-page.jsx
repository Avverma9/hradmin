import { Helmet } from 'react-helmet-async';

import Availability from 'src/sections/settings/availability';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Availability | Roomsstay </title>
      </Helmet>

      <Availability />
    </>
  );
}

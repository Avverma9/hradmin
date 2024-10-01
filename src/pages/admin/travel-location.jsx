import { Helmet } from 'react-helmet-async';

import { ListTravel } from 'src/sections/settings/travel';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Travel | Hotel Roomsstay </title>
      </Helmet>

      <ListTravel />
    </>
  );
}

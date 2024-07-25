import { Helmet } from 'react-helmet-async';

import { SiteBanner } from 'src/sections/settings/banner';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Site Banner Change | Hotel Roomsstay </title>
      </Helmet>

      <SiteBanner />
    </>
  );
}

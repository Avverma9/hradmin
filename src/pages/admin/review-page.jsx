import { Helmet } from 'react-helmet-async';

import ReviewPage from 'src/sections/settings/reviews';

// ----------------------------------------------------------------------

export default function AllReviewPage() {
  return (
    <>
      <Helmet>
        <title> Reviews | Roomsstay </title>
      </Helmet>

      <ReviewPage />
    </>
  );
}

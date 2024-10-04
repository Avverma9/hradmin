import { Helmet } from 'react-helmet-async';

import ReviewPage from '../../settings/reviews/Reviews';

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

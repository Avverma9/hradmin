import { Helmet } from 'react-helmet-async';

import TourRequest from '../../settings/tour/tour-requests';

// ----------------------------------------------------------------------

export default function AllReviewPage() {
  return (
    <>
      <Helmet>
        <title> Tour Request | Roomsstay </title>
      </Helmet>

      <TourRequest />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import NotificationPage from '../../settings/notification';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Send notification | Roomsstay </title>
      </Helmet>

      <NotificationPage />
    </>
  );
}

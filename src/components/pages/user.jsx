import { Helmet } from 'react-helmet-async';

import { UserView } from '../user/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Partners | Hotel Roomsstay </title>
      </Helmet>

      <UserView />
    </>
  );
}

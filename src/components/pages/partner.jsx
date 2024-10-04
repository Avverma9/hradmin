import { Helmet } from 'react-helmet-async';

import UserView from '../partners/view/index';

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

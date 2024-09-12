import { Helmet } from 'react-helmet-async';

import ComplaintPage from 'src/sections/settings/complaints';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Complaint | Roomsstay </title>
      </Helmet>

      <ComplaintPage />
    </>
  );
}

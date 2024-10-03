import { Helmet } from 'react-helmet-async';

import ComplaintPage from '../../settings/complaints/Complaint';

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

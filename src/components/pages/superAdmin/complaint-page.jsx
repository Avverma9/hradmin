import { Helmet } from 'react-helmet-async';

import PmsComplaints from '../../pms-complaints/pms-complaints'; // Capitalize the component name

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title>Complaints | Roomsstay</title>
      </Helmet>
      <PmsComplaints /> {/* Use the component as a JSX element */}
    </>
  );
}

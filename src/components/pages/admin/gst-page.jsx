import { Helmet } from 'react-helmet-async';

import GST from '../../settings/gst';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> GST | Roomsstay </title>
      </Helmet>

      <GST />
    </>
  );
}


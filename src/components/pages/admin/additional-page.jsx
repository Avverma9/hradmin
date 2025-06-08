import { Helmet } from 'react-helmet-async';

import AdditionalInputs from '../../settings/additional-fields';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Additional Fields | Roomsstay </title>
      </Helmet>

          <AdditionalInputs />
    </>
  );
}

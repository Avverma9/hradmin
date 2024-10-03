import { Helmet } from 'react-helmet-async';

import { YourHotelsView } from '../../hotels/view';

// ----------------------------------------------------------------------

export default function YourHotelsPage() {
  return (
    <>
      <Helmet>
        <title> Your Hotels | Roomsstay </title>
      </Helmet>

      <YourHotelsView />
    </>
  );
}

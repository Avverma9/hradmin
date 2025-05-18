import { Helmet } from 'react-helmet-async';

import PMSMonth from '../../settings/monthly/monthly-price';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> PMS Month setup | Roomsstay </title>
      </Helmet>

      <PMSMonth />
    </>
  );
}

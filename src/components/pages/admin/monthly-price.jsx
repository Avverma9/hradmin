import { Helmet } from 'react-helmet-async';

import MonthPrice from '../../settings/monthly/monthly-price';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Month setup | Roomsstay </title>
      </Helmet>

      <MonthPrice />
    </>
  );
}

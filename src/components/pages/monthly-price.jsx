import { Helmet } from 'react-helmet-async';

import MonthlyPrice from '../settings/monthly/monthly-price';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Month setup | Roomsstay </title>
      </Helmet>

      <MonthlyPrice />
    </>
  );
}

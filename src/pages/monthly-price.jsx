import { Helmet } from 'react-helmet-async';

import MonthlyPrice from 'src/sections/products/monthly-price';

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

import { Helmet } from 'react-helmet-async';

import CouponPage from 'src/sections/settings/coupon';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Users | Roomsstay </title>
      </Helmet>

      <CouponPage />
    </>
  );
}

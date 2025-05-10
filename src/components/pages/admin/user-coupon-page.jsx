import { Helmet } from 'react-helmet-async';

import UserCouponPage from '../../settings/coupon/user-coupon';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Coupon | Roomsstay </title>
      </Helmet>

      <UserCouponPage />
    </>
  );
}

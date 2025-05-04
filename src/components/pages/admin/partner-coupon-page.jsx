import { Helmet } from 'react-helmet-async';

import PartnerCouponPage from '../../settings/coupon/partner-coupon';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Coupon | Roomsstay </title>
      </Helmet>

      <PartnerCouponPage />
    </>
  );
}

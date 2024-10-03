import { Helmet } from 'react-helmet-async';

import PmsCouponPage from '../../hotels/view/superAdmin/coupon';

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Coupon | Roomsstay </title>
      </Helmet>

      <PmsCouponPage />
    </>
  );
}

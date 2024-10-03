import { Helmet } from 'react-helmet-async';

import { ProductsView } from '../../hotels/view/index';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Hotels | Roomsstay </title>
      </Helmet>

      <ProductsView />
    </>
  );
}

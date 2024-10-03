import { Helmet } from 'react-helmet-async';

import { BulkOperation } from '../../settings/bulk-operation';

// ----------------------------------------------------------------------

export default function BulkPage() {
  return (
    <>
      <Helmet>
        <title> Bulk Operation | Hotel Roomsstay </title>
      </Helmet>

      <BulkOperation />
    </>
  );
}

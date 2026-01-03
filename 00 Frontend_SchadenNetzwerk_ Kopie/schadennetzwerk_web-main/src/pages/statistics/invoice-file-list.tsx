import { Helmet } from 'react-helmet-async';

import { InvoiceUploadList } from 'src/sections/main-app/statistics';

// ----------------------------------------------------------------------

export default function InvoiceListPage() {
  return (
    <>
      <Helmet>
        <title>Uploaded files</title>
      </Helmet>

      <InvoiceUploadList />
    </>
  );
}

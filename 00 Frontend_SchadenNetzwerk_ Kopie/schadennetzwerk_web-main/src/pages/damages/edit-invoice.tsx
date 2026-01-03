import { Helmet } from 'react-helmet-async';

import { EditInvoiceView } from 'src/sections/main-app/damage';


// ----------------------------------------------------------------------

export default function EditInvoicePage() {
  return (
    <>
      <Helmet>
        <title> Edit Invoice </title>
      </Helmet>

      <EditInvoiceView />
    </>
  );
}

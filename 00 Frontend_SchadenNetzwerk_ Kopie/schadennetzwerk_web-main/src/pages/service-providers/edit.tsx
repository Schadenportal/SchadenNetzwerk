import { Helmet } from 'react-helmet-async';

import { ServiceProviderEditView } from 'src/sections/main-app/service-provider';


// ----------------------------------------------------------------------

export default function ServiceProviderEditPage() {
  return (
    <>
      <Helmet>
        <title> Edit a service provider </title>
      </Helmet>

      <ServiceProviderEditView />
    </>
  );
}

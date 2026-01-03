import { Helmet } from 'react-helmet-async';

import { ServiceProviderAssignListView } from 'src/sections/main-app/service-provider';
// ----------------------------------------------------------------------

export default function ServiceProviderAssignListPage() {
  return (
    <>
      <Helmet>
        <title>Assign Service Providers</title>
      </Helmet>

      <ServiceProviderAssignListView />
    </>
  );
}

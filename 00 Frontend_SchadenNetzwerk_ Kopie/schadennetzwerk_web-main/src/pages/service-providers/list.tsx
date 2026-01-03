import { Helmet } from 'react-helmet-async';

import { ServiceProviderListView } from 'src/sections/main-app/service-provider';
// ----------------------------------------------------------------------

export default function ServiceProviderListPage() {
  return (
    <>
      <Helmet>
        <title>Service Providers</title>
      </Helmet>

      <ServiceProviderListView />
    </>
  );
}

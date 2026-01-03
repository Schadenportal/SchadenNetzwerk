import { Helmet } from 'react-helmet-async';

import { ServiceAdviserListView } from 'src/sections/main-app/service-adviser';
// ----------------------------------------------------------------------

export default function ServiceAdviserListPage() {
  return (
    <>
      <Helmet>
        <title>Service Adviser</title>
      </Helmet>

      <ServiceAdviserListView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { UsedCarListView } from 'src/sections/main-app/used-car';

// ----------------------------------------------------------------------

export default function UsedCarListPage() {
  return (
    <>
      <Helmet>
        <title> Used Car List </title>
      </Helmet>

      <UsedCarListView />
    </>
  );
}

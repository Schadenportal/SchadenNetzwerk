import { Helmet } from 'react-helmet-async';

import { SalesmanListView } from 'src/sections/main-app/salesman';
// ----------------------------------------------------------------------

export default function SalesmanListPage() {
  return (
    <>
      <Helmet>
        <title>Salesman</title>
      </Helmet>

      <SalesmanListView />
    </>
  );
}

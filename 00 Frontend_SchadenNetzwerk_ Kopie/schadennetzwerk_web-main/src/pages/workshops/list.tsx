import { Helmet } from 'react-helmet-async';

import { WorkshopListView } from 'src/sections/main-app/workshop';

// ----------------------------------------------------------------------

export default function WorkshopListPage() {
  return (
    <>
      <Helmet>
        <title> Workshops </title>
      </Helmet>

      <WorkshopListView />
    </>
  );
}

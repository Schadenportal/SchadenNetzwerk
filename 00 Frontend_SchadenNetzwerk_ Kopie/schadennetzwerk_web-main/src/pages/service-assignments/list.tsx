import { Helmet } from 'react-helmet-async';

import { ServiceAssignmentListView } from 'src/sections/main-app/service-assignment';

// ----------------------------------------------------------------------

export default function ServiceAssignmentListPage() {
  return (
    <>
      <Helmet>
        <title>Assignments</title>
      </Helmet>

      <ServiceAssignmentListView />
    </>
  );
}

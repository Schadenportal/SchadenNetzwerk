import { Helmet } from 'react-helmet-async';

import { EditRepairPlanView } from 'src/sections/main-app/damage';

// ----------------------------------------------------------------------

export default function EditRepairPlanPage() {

  return (
    <>
      <Helmet>
        <title> Edit Repair Plan </title>
      </Helmet>

      <EditRepairPlanView />
    </>
  );
}

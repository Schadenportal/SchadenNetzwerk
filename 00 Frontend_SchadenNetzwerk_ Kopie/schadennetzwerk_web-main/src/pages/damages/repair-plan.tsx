import { Helmet } from 'react-helmet-async';

import { RepairPlanView } from 'src/sections/main-app/damage';

// ----------------------------------------------------------------------

export default function RepairPlanPage() {

  return (
    <>
      <Helmet>
        <title> Repair Plan </title>
      </Helmet>

      <RepairPlanView />
    </>
  );
}

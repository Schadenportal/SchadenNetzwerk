import { Helmet } from 'react-helmet-async';

import { RepairConfirmationView } from 'src/sections/main-app/damage';
// ----------------------------------------------------------------------

export default function RepairConfirmationPage() {

  return (
    <>
      <Helmet>
        <title> Repair Confirmation </title>
      </Helmet>

      <RepairConfirmationView />
    </>
  );
}

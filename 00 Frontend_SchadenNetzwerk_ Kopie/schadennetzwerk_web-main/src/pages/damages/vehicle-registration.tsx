import { Helmet } from 'react-helmet-async';

import { VehicleRegistrationView } from 'src/sections/main-app/damage';

// ----------------------------------------------------------------------

export default function VehicleRegistrationPage() {
  return (
    <>
      <Helmet>
        <title> Vehicle registration </title>
      </Helmet>

      <VehicleRegistrationView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { DamageListView } from 'src/sections/main-app/damage';

// ----------------------------------------------------------------------

export default function DamagePage() {
  return (
    <>
      <Helmet>
        <title> Damages </title>
      </Helmet>

      <DamageListView isMainPage />
    </>
  );
}

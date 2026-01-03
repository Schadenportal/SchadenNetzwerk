import { Helmet } from 'react-helmet-async';

import { DamageEditView } from 'src/sections/main-app/damage';


// ----------------------------------------------------------------------

export default function DamageEditPage() {
  return (
    <>
      <Helmet>
        <title> Edit Damage </title>
      </Helmet>

      <DamageEditView />
    </>
  );
}

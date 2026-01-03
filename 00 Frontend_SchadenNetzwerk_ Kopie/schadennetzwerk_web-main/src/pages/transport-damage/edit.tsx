import { Helmet } from 'react-helmet-async';

import { TransportDamageEditView } from 'src/sections/main-app/transport-damage';

// ----------------------------------------------------------------------

export default function TransportDamageEditPage() {
  return (
    <>
      <Helmet>
        <title> Edit Transport Damage </title>
      </Helmet>

      <TransportDamageEditView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { TransportDamageListView } from 'src/sections/main-app/transport-damage';

// ----------------------------------------------------------------------

export default function TransportDamagePage() {
  return (
    <>
      <Helmet>
        <title> Transport Damages </title>
      </Helmet>

      <TransportDamageListView />
    </>
  );
}

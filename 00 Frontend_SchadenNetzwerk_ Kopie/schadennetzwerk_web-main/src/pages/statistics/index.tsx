import { Helmet } from 'react-helmet-async';

import { StatisticView } from 'src/sections/main-app/statistics';

// ----------------------------------------------------------------------

export default function ShopPage() {
  return (
    <>
      <Helmet>
        <title>Damage Statistics</title>
      </Helmet>

      <StatisticView />
    </>
  );
}

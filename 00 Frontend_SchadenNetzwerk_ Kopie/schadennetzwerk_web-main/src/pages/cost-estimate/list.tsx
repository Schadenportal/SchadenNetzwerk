import { Helmet } from 'react-helmet-async';

import { CostEstimationList } from 'src/sections/main-app/cost-estimate';

// ----------------------------------------------------------------------

export default function CostEstimationListPage() {
  return (
    <>
      <Helmet>
        <title> Cost Estimation List </title>
      </Helmet>

      <CostEstimationList />
    </>
  );
}

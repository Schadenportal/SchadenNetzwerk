import { Helmet } from 'react-helmet-async';

import { CostEstimateEditView } from 'src/sections/main-app/cost-estimate';

// ----------------------------------------------------------------------

export default function CostEstimateCreatePage() {
  return (
    <>
      <Helmet>
        <title> Create cost estimation </title>
      </Helmet>

      <CostEstimateEditView />
    </>
  );
}

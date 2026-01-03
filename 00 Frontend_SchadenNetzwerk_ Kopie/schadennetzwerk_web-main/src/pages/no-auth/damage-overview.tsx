import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { DamageOverviewSection } from 'src/sections/non-auth';

// ----------------------------------------------------------------------

export default function DamageOverview() {
  const params = useParams();

  const { damageId } = params;

  return (
    <>
      <Helmet>
        <title> Damage Overview </title>
      </Helmet>

      <DamageOverviewSection id={`${damageId}`} />
    </>
  );
}

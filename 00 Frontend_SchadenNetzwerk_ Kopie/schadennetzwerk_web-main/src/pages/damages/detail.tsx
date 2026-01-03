import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import DamageDetailView from 'src/sections/main-app/damage/damage-detail-view';

// ----------------------------------------------------------------------

export default function DamageDetailPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Damage Detail </title>
      </Helmet>

      <DamageDetailView id={`${id}`} />
    </>
  );
}

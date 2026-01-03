import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import TransportDamageModel from 'src/models/TransportDamageModel';
import { COLLECTION_TRANSPORT_DAMAGE } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import TransportDamageEditForm from './view-components/edit-form';

export default function TransportDamageEditView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [transportDamageData, setTransportDamageData] = useState<TransportDamageModel>();

  const getData = useCallback(async () => {
    if (id) {
      const res = await getDocument(COLLECTION_TRANSPORT_DAMAGE, id, TransportDamageModel);
      if (res) {
        setTransportDamageData(res);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('transport_damage')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('transport_damage'), href: paths.dashboard.cost_estimate.new },
          { name: t('create') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <TransportDamageEditForm currentTransportDamage={transportDamageData} /> : <TransportDamageEditForm />}
    </Container>
  )
}

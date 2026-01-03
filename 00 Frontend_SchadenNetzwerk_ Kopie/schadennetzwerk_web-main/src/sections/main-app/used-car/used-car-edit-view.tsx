
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import UsedCarModel from 'src/models/UsedCarModel';
import { COLLECTION_USED_CAR } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UsedCarEditForm from './used-car-edit-form';

export default function UsedCarEditView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [usedCarData, setUsedCarData] = useState<UsedCarModel>();

  const getData = useCallback(async () => {
    if (id) {
      const res = await getDocument(COLLECTION_USED_CAR, id, UsedCarModel);
      if (res) {
        setUsedCarData(res);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('used_car')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('used_car'), href: paths.dashboard.cost_estimate.new },
          { name: t('create') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <UsedCarEditForm currentUsedCarData={usedCarData} /> : <UsedCarEditForm />}
    </Container>
  )
}

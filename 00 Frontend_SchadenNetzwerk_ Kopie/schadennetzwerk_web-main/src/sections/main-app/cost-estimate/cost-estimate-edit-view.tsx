
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import CostEstimateModel from 'src/models/CostEstimateModel';
import { COLLECTION_COST_ESTIMATES } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import CostEstimateEditForm from './cost-estimate-edit-form';

export default function CostEstimateEditView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [costEstimateData, setCostEstimateData] = useState<CostEstimateModel>();

  const getData = useCallback(async () => {
    if (id) {
      const res = await getDocument(COLLECTION_COST_ESTIMATES, id, CostEstimateModel);
      if (res) {
        setCostEstimateData(res);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('menu_cost_estimate')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('cost_estimate'), href: paths.dashboard.cost_estimate.new },
          { name: t('create') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <CostEstimateEditForm currentCostEstimate={costEstimateData} /> : <CostEstimateEditForm />}
    </Container>
  )
}

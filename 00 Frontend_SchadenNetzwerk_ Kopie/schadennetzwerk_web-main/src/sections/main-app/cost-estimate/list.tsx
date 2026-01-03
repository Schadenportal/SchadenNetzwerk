import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { GENERAL_ROLES } from 'src/constants/viewConstants';
import CostEstimateModel from 'src/models/CostEstimateModel';
import { getCostEstimationList } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content/empty-content';

import CostEstimationListComp from './view-components/list-component';

export default function CostEstimationList() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const [list, setList] = useState<CostEstimateModel[]>([]);
  const router = useRouter();

  const handleDeletedData = useCallback((id: string) => {
    const newData = list.filter((item) => item.costEstimationId !== id);
    setList(newData);
  }, [list]);

  const handleEdit = useCallback((id: string) => {
    router.push(paths.dashboard.cost_estimate.edit(id));
  }, [router]);

  const getData = useCallback(async () => {
    if (!user) {
      return;
    }
    // Only allow to see the Appraiser and Car dealer
    if (GENERAL_ROLES.includes(user.role)) {
      const { workshopIds } = user;
      const res = await getCostEstimationList(workshopIds);
      if (res) {
        setList(res);
      }
    }
  }, [user]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('cost_estimation_list')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('cost_estimation_list'), href: paths.dashboard.cost_estimate.root },
          { name: t('list') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Box
        marginTop={2}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(3, 1fr)',
        }}
      >
        {list.length ? list.map(item => (
          <CostEstimationListComp key={item.costEstimationId} item={item} onDeleted={handleDeletedData} onEditing={handleEdit} />
        )) : ("")}
      </Box>
      {!list.length && (
        <EmptyContent title={t('no_result')} sx={{ mt: '10%' }} />
      )}
    </Container>
  )
}

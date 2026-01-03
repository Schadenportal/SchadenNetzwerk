import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import UsedCarModel from 'src/models/UsedCarModel';
import { GENERAL_ROLES } from 'src/constants/viewConstants';
import { getUsedCarList } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content/empty-content';

import UsedCarListComp from './view-components/list-component';

export default function UsedCarList() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const [list, setList] = useState<UsedCarModel[]>([]);
  const router = useRouter();

  const handleDeletedData = useCallback((id: string) => {
    const newData = list.filter((item) => item.usedCarId !== id);
    setList(newData);
  }, [list]);

  const handleEdit = useCallback((id: string) => {
    router.push(paths.dashboard.used_car.edit(id));
  }, [router]);

  const getData = useCallback(async () => {
    if (!user) {
      return;
    }
    // Only allow to see the Appraiser and Car dealer
    if (GENERAL_ROLES.includes(user.role)) {
      const { workshopIds } = user;
      const res = await getUsedCarList(workshopIds);
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
        heading={t('used_car_list')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('used_car_list'), href: paths.dashboard.used_car.root },
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
          <UsedCarListComp key={item.usedCarId} item={item} onDeleted={handleDeletedData} onEditing={handleEdit} />
        )) : ("")}
      </Box>
      {!list.length && (
        <EmptyContent title={t('no_result')} sx={{ mt: '10%' }} />
      )}
    </Container>
  )
}

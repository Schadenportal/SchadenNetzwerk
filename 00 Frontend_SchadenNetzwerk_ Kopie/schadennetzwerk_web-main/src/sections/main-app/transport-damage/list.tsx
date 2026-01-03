import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import TransportDamageModel from 'src/models/TransportDamageModel';
import { getTransportDamageList } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content/empty-content';

import TransportDamageItem from './view-components/transport-damage-item';

export default function TransportDamageList() {
  const { user } = useAuthContext();
  const { t } = useTranslate();

  const [list, setList] = useState<TransportDamageModel[] | null>(null);

  const router = useRouter();

  const handleDeletedData = useCallback((id: string) => {
    if (list) {
      const newData = list.filter((item) => item.transportDamageId !== id);
      setList(newData);
    }
  }, [list]);

  const handleEdit = useCallback((id: string) => {
    router.push(paths.dashboard.transport_damage.edit(id));
  }, [router]);

  const getData = useCallback(async () => {
    if (!user) {
      return;
    }
    const { workshopIds } = user;
    const res = await getTransportDamageList(workshopIds);
    if (res) setList(res);
  }, [user]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('transport_damage')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('transport_damage'), href: paths.dashboard.transport_damage.root },
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
        {list && list.map(item => (
          <TransportDamageItem key={item.transportDamageId} item={item} onDeleted={handleDeletedData} onEditing={handleEdit} />
        ))}
      </Box>
      {!list && (
        <EmptyContent title={t('no_result')} sx={{ mt: '10%' }} />
      )}
    </Container>
  )
}

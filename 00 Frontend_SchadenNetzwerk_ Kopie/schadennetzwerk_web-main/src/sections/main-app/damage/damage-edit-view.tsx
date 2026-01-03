import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { COLLECTION_DAMAGE } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import DamageEditForm from './view-components/damage-edit-form';

export default function DamageEditView() {
  const router = useRouter();
  const { t } = useTranslate();
  const { id } = useParams();
  const [damageData, setDamageData] = useState<DamageModel>();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const getData = useCallback(async () => {
    if (id) {
      const damage = await getDocument(COLLECTION_DAMAGE, id, DamageModel);
      if (damage) {
        setDamageData(damage);
      }
    }
  }, [id]);

  useEffect(() => {
    if (user && user.isDisabled) {
      enqueueSnackbar(t('your_account_is_disabled'), { variant: 'error' });
      setTimeout(() => {
        router.push(paths.dashboard.damages.root)
      }, 2000);
      return;
    }
    getData();
  }, [enqueueSnackbar, getData, router, t, user]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('damage')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('damage'), href: paths.dashboard.damages.root },
          { name: id !== undefined ? t('edit') : t('create') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <DamageEditForm currentDamage={damageData} /> : <DamageEditForm />}
    </Container>
  )
}

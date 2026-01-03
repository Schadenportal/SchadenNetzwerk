import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import WorkshopModel from 'src/models/WorkshopModel';
import ServiceProviderModel from 'src/models/ServiceProviderModel';
import { getDocument } from 'src/services/firebase/firebaseFirestore';
import { COLLECTION_DAMAGE, COLLECTION_WORKSHOPS, COLLECTION_SERVICE_PROVIDERS } from 'src/constants/firebase';

import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EditPaintShopForm from './view-components/edit-paintshop-form';

export default function EditPaintShopOrderView() {
  const router = useRouter();
  const { t } = useTranslate();
  const { damageId } = useParams();
  const [damageData, setDamageData] = useState<DamageModel>();
  const [workshopData, setWorkshopData] = useState<WorkshopModel>();
  const [paintProvider, setPaintProvider] = useState<ServiceProviderModel>();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const getData = useCallback(async () => {
    if (damageId) {
      const damage = await getDocument(COLLECTION_DAMAGE, damageId, DamageModel);
      if (damage) {
        setDamageData(damage);
        // Get workshop and provider info
        if (damage.workshopId) {
          const workshop = await getDocument(COLLECTION_WORKSHOPS, damage.workshopId, WorkshopModel);
          if (workshop) {
            setWorkshopData(workshop);
          }
        }
        if (damage.paintShopId) {
          const provider = await getDocument(COLLECTION_SERVICE_PROVIDERS, damage.paintShopId, ServiceProviderModel);
          if (provider) {
            setPaintProvider(provider);
          }
        }
      }
    }
  }, [damageId]);

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
          { name: t('edit_paint_shop_order') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {damageId && damageData ? <EditPaintShopForm damageInfo={damageData} workshopInfo={workshopData} paintProvider={paintProvider} /> :
        <EmptyContent title="No Data"
          sx={{
            py: 10,
            height: '100%', // Take full height of the cell
            minHeight: 280, // Ensure minimum height for visibility
          }} />}
    </Container>
  )
}

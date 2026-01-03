import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import { exportToCSV } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { useMainData } from 'src/providers/data-provider';
import ServiceProviderModel from 'src/models/ServiceProviderModel';
import RepairConfirmationModel from 'src/models/RepairConfirmModel';
import { getDocument, getSigningDoc, getServiceTasksByDamageId } from 'src/services/firebase/firebaseFirestore';
import { COLLECTION_DAMAGE, COLLECTION_SERVICE_PROVIDERS, COLLECTION_REPAIR_CONFIRMATION } from 'src/constants/firebase';

import Iconify from 'src/components/iconify';

import { UserRole } from 'src/types/enums';

import DetailInfo from './detail-view-components/info-part';
import FileManager from './detail-view-components/file-manager';
import DetailService from './detail-view-components/services-part';
import DamageDetailsToolbar from './detail-view-components/toolbar';
import RepairConfirmation from './detail-view-components/repair-confirmation';
// import CostSummary from './detail-view-components/cost-summary';

type Props = {
  id: string;
  isFromServiceTask?: boolean;
};

export default function DamageDetailView({ id, isFromServiceTask }: Props) {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { serviceProvider } = useMainData();

  const [damageInfo, setDamageInfo] = useState<DamageModel>();
  const [serviceList, setServiceList] = useState<Record<string, any>[]>([]);
  const [repairConfirmation, setRepairConfirmation] = useState<RepairConfirmationModel | null>(null);

  const createServiceTaskData = useCallback(async (damage: DamageModel) => {
    const providerId = user?.role === UserRole.Lawyer ? "" : serviceProvider?.serviceProviderId || "";
    const serviceTasks = await getServiceTasksByDamageId(damage.damageId, providerId);
    const services: Record<string, any>[] = [];
    if (serviceTasks) {
      await Promise.all(serviceTasks.map(async (item) => {
        const provider = await getDocument(COLLECTION_SERVICE_PROVIDERS, item.serviceProviderId, ServiceProviderModel);
        let docs = await getSigningDoc(damage.damageId, item.taskType);
        if (!docs) {
          docs = [];
        }
        if (provider) {
          services.push({ taskInfo: item, providerInfo: provider, signingDoc: docs });
        }
      }));
    }
    if (services) {
      setServiceList(services);
    }
  }, [serviceProvider?.serviceProviderId, user?.role]);

  const getRepairConfirmation = useCallback(async (repairConfirmId: string) => {
    if (!repairConfirmId) { return }

    const data = await getDocument(COLLECTION_REPAIR_CONFIRMATION, repairConfirmId, RepairConfirmationModel);
    if (data) {
      setRepairConfirmation(data);
    }
  }, []);

  const getDamage = useCallback(async () => {
    if (id) {
      const damage = await getDocument(COLLECTION_DAMAGE, id, DamageModel);
      if (damage) {
        setDamageInfo(damage);
        await getRepairConfirmation(damage?.repairConfirmId || "");
        await createServiceTaskData(damage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleExportCSV = useCallback(() => {
    // Set the CSV data with the required fields
    const csvData = {
      FirstName: repairConfirmation?.firstName,
      LastName: repairConfirmation?.lastName,
      Street: repairConfirmation?.address?.street,
      City: repairConfirmation?.address?.city,
      ZipCode: repairConfirmation?.address?.postalCode,
      CaptureDate: repairConfirmation?.captureDate,
      LicensePlate: repairConfirmation?.licensePlate,
      VIN: repairConfirmation?.vin,
      CreatedAt: repairConfirmation?.createdAt.toDate().toLocaleDateString(),
    }
    exportToCSV([csvData], "repair-confirmation.csv");
  }, [repairConfirmation]);

  useEffect(() => {
    getDamage();
  }, [getDamage]);

  return (
    <Container maxWidth={false}>
      <DamageDetailsToolbar
        backLink={isFromServiceTask ? paths.serviceAssignment.root : paths.dashboard.damages.root}
        editLink={(!isFromServiceTask && damageInfo?.userId === user?.userId) ? paths.dashboard.damages.edit(id) : ''}
      />
      <Typography variant="h4" sx={{ color: 'success.main', mb: 2 }}>{t('overview')}</Typography>
      <Stack direction="column">
        {!isFromServiceTask && (
          <Card sx={{ p: 3, my: 2 }}>
            <CardHeader
              title={t('info')}
              action=""
              sx={{ py: 2, px: 0, color: 'info.main' }}
            />
            <DetailInfo damage={damageInfo} />
          </Card>
        )}

        <Card sx={{ p: 3, my: 2 }}>
          <CardHeader
            title={t('services')}
            action=""
            sx={{ py: 2, px: 0, color: 'info.main' }}
          />
          <DetailService services={serviceList} />
        </Card>

        {/* {!isFromServiceTask && (
          <Card sx={{ p: 3, my: 2 }}>
            <CardHeader
              title={t('files')}
              action=""
              sx={{ py: 2, px: 0, color: 'info.main' }}
            />
            <DetailFiles damage={damageInfo} services={serviceList} />
          </Card>
        )} */}
        {repairConfirmation && (
          <Card sx={{ p: 3, my: 2 }}>
            <CardHeader
              title={
                <Stack direction="row" sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">{t('repair_confirmation')}</Typography>
                  <Tooltip title={t('export_csv')}>
                    <LoadingButton
                      variant="outlined"
                      loading={false}
                      onClick={handleExportCSV}>
                      <Iconify icon="foundation:page-export-csv" width={20} sx={{ verticalAlign: "middle" }} />
                    </LoadingButton>
                  </Tooltip>
                </Stack>}
              action=""
              sx={{ py: 2, px: 0, color: 'info.main' }}
            />
            <RepairConfirmation data={repairConfirmation} />
          </Card>
        )}

        <Card sx={{ p: 3, my: 2, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <CardHeader
            title={t('files')}
            action=""
            sx={{ py: 2, px: 0, color: 'info.main' }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <FileManager damage={damageInfo} services={serviceList} />
          </Box>
        </Card>
      </Stack>
      {/* <Typography variant="h4" sx={{ color: 'success.main', mb: 2, mt: 4 }}>{t('update_costs')}</Typography>
      <CostSummary /> */}
    </Container>
  )
}

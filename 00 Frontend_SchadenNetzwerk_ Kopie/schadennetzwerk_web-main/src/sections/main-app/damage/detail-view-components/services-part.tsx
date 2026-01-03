import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getServiceName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { updateServiceTaskStatus } from 'src/services/firebase/functions';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content/empty-content';

import { UserRole, ServiceTaskStatusTypes } from 'src/types/enums';

type Props = {
  services: Record<string, any>[];
};

export default function DetailService({ services }: Props) {
  const { t } = useTranslate();
  const router = useRouter();
  const { user } = useAuthContext();
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  const handleConfirm = async (serviceTaskId: string) => {
    try {
      setIsApiLoading(true);
      const data = {
        serviceTaskId,
        status: ServiceTaskStatusTypes.FINISHED
      }
      await updateServiceTaskStatus(data);
      setIsApiLoading(false);
      enqueueSnackbar(t('task_confirmed_successfully'), {
        variant: 'success',
      });
      router.push(paths.serviceAssignment.root);
    } catch (error) {
      setIsApiLoading(false);
      enqueueSnackbar(t('error_occurred_while_processing_task'), {
        variant: 'error',
      });
    }
  }

  return (
    <Grid container spacing={3}>
      {services.length ? services.map((item, index) => (
        <Grid xs={12} md={6} key={index}>
          <Card sx={{
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <CardHeader
              title={getServiceName(item.taskInfo.taskType)}
              action=""
            />
            <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
            <Stack direction="row" sx={{ p: 3 }}>
              <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2', width: '100%' }}>
                <Box>
                  <Iconify icon="mdi:user-outline" width={20} sx={{ verticalAlign: "middle" }} />
                  <Box component="span" sx={{ color: 'text.secondary', ml: 0.5, verticalAlign: "middle" }}>
                    {item.providerInfo.name}
                  </Box>
                </Box>
                <Box>
                  <Iconify icon="ic:outline-email" width={20} sx={{ verticalAlign: "middle" }} />
                  <Box component="span" sx={{ color: 'text.secondary', ml: 0.5, verticalAlign: "middle" }}>
                    {item.providerInfo.email}
                  </Box>
                </Box>
                <Box>
                  <Iconify icon="ic:baseline-phone" width={20} sx={{ verticalAlign: "middle" }} />
                  <Box component="span" sx={{ color: 'text.secondary', ml: 0.5, verticalAlign: "middle" }}>
                    {item.providerInfo.phone}
                  </Box>
                </Box>
                {item.taskInfo.notes && (
                  <Box>
                    {t('note')}:
                    <Box component="span" sx={{ color: 'text.secondary', ml: 0.5, verticalAlign: "middle" }}>
                      {item.taskInfo.notes}
                    </Box>
                  </Box>
                )}
                <Box sx={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
                  <Box>
                    {t('status')}:
                    <Label variant="soft" sx={{ ml: 0.5, verticalAlign: "middle" }}>
                      {t(`${item.taskInfo.status}`)}
                    </Label>
                  </Box>
                  {item.taskInfo.status === ServiceTaskStatusTypes.ACCEPTED && user?.role === UserRole.Lawyer && (
                    <Tooltip title={t('mark_as_done')}>
                      <LoadingButton sx={{ bgcolor: "secondary.main" }} size='small' loading={isApiLoading} onClick={() => handleConfirm(item.taskInfo.serviceTaskId)}>
                        <Iconify icon="healthicons:i-documents-accepted" />
                      </LoadingButton>
                    </Tooltip>
                  )}
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      )) : (
        <EmptyContent title={t('no_match')} />
      )}
    </Grid>
  )
}

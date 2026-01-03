import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';

import { getServiceName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import DamageModel from 'src/models/DamageModel';

import Iconify from 'src/components/iconify';

type Props = {
  damage?: DamageModel;
  services: Record<string, any>[];
}

export default function DetailFiles({ damage, services }: Props) {
  const { t } = useTranslate();

  return (
    <Grid container spacing={3}>
      {damage && (damage.assignmentDoc || damage.repairScheduleDoc) && (
        <Grid xs={12} md={4}>
          <Card>
            <CardHeader
              title={t('repair_shop')}
              action=""
            />
            <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
            {damage && damage.assignmentDoc && (
              <Stack direction="row" sx={{ px: 3, py: 1 }}>
                <Stack spacing={0.5} direction="row" alignItems="center" sx={{ typography: 'body2', justifyContent: "space-between", width: "100%" }}>
                  <Box>
                    RKÜ
                  </Box>
                  <Button sx={{ bgcolor: 'info.main' }} size="small" href={damage.assignmentDoc} target='blank'>
                    <Iconify icon="fa6-regular:file-pdf" width={20} />
                  </Button>
                </Stack>
              </Stack>
            )}
            {damage && damage.repairScheduleDoc && (
              <Stack direction="row" sx={{ px: 3, py: 1 }}>
                <Stack spacing={0.5} direction="row" alignItems="center" sx={{ typography: 'body2', justifyContent: "space-between", width: "100%" }}>
                  <Box>
                    {t('repair_schedule')}
                  </Box>
                  <Button sx={{ bgcolor: 'info.main' }} size="small" href={damage.repairScheduleDoc} target='blank'>
                    <Iconify icon="fa6-regular:file-pdf" width={20} />
                  </Button>
                </Stack>
              </Stack>
            )}
          </Card>
        </Grid>
      )}
      {services.map((item, index) => {
        if (item.signingDoc.length) {
          return (
            <Grid xs={12} md={4} key={index}>
              <Card>
                <CardHeader
                  title={getServiceName(item.taskInfo.taskType)}
                  action=""
                />
                <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
                {item.signingDoc.map((doc: any, ind: number) => (
                  <Stack direction="row" sx={{ px: 3, py: 1 }} key={ind}>
                    <Stack spacing={0.5} direction="row" alignItems="center" sx={{ typography: 'body2', justifyContent: "space-between", width: "100%" }}>
                      <Box>
                        {`${doc.isContract ? "Mietvertrag" : "Vollmacht"} ${getServiceName(item.taskInfo.taskType)}`}
                      </Box>
                      <Button sx={{ bgcolor: 'info.main' }} size="small" href={doc.fileURL} target='blank'>
                        <Iconify icon="fa6-regular:file-pdf" width={20} />
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Card>
            </Grid>
          )
        }
        return ""
      })}

    </Grid>
  )
}

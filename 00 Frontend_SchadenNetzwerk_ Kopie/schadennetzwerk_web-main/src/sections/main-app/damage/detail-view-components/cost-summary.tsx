import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useTranslate } from 'src/locales';
import CostModel from 'src/models/CostModel';

// import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from "src/components/hook-form";

export default function CostSummary() {
  const { t } = useTranslate();
  // const { enqueueSnackbar } = useSnackbar();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentCost, setCurrentCost] = useState<CostModel>();

  const NewCostSchema = Yup.object().shape({
    total: Yup.number()
      .test(
        'Is positive?',
        `${t('number_must_be_greater_than_0')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    workshopHourlyRate: Yup.number()
      .test(
        'Is positive?',
        `${t('number_must_be_greater_than_0')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    workshopHourlyBilledRate: Yup.number()
      .test(
        'Is positive?',
        `${t('number_must_be_greater_than_0')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    paintShopRate: Yup.number()
      .test(
        'Is positive?',
        `${t('number_must_be_greater_than_0')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    paintShopBilledRate: Yup.number()
      .test(
        'Is positive?',
        `${t('number_must_be_greater_than_0')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
  });

  const defaultValues = useMemo(
    () => ({
      total: currentCost?.total || 0,
      workshopHourlyRate: currentCost?.workshopHourlyRate || 0,
      workshopHourlyBilledRate: currentCost?.workshopHourlyBilledRate || 0,
      paintShopRate: currentCost?.paintShopRate || 0,
      paintShopBilledRate: currentCost?.paintShopBilledRate || 0,
    }),
    [currentCost]
  );

  const methods = useForm({
    resolver: yupResolver(NewCostSchema),
    defaultValues,
  });

  const {
    // reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log("==Data==", data);
    } catch (error) {
      console.log(error);
    }
  })

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "info.main" }}>
              {t('enter_your_cost')}
            </Typography>
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField type='number' name="total" label={t('total')} />
            </Box>
            <Typography variant="h6" sx={{ flexGrow: 1, mt: 3, color: "info.main" }}>
              {t('workshop')}
            </Typography>
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField type='number' name="workshopHourlyRate" label={t('hourly_rate')} />
              <RHFTextField type='number' name="workshopHourlyBilledRate" label={t('hourly_billed_rate')} />
            </Box>
            <Typography variant="h6" sx={{ flexGrow: 1, mt: 3, color: "info.main" }}>
              Lack & Karosserie
            </Typography>
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField type='number' name="paintShopRate" label={t('default')} />
              <RHFTextField type='number' name="paintShopBilledRate" label={t('billed')} />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" sx={{ bgcolor: 'info.main' }} loading={isSubmitting}>
                {t('update_costs')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  )
}

import "yup-phone-lite";
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from "@mui/system/Stack";
import Divider from "@mui/material/Divider";
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslate } from 'src/locales';
import SalesmanModel from "src/models/SalesmanModel";
import { DRIVER_TYPES, INSURANCE_TYPES } from "src/constants/viewConstants";

import {
  RHFSwitch,
  RHFTextField,
  RHFRadioGroup,
} from "src/components/hook-form";


// ----------------------------------------------------------------------

type Props = {
  currentSalesman?: SalesmanModel;
};

export default function DamageEditDamageForm({ currentSalesman }: Props) {
  const { t } = useTranslate();
  const { control } = useFormContext();

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" mb={2}>
        {t('damage')}
      </Typography>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('information_about_damage')}
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
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('insurance_type')}</Typography>
                <RHFRadioGroup row spacing={4} name="insuranceType" options={INSURANCE_TYPES} />
              </Stack>
              <Stack spacing={1}>
                <RHFSwitch name="controlled" label={t('controlled_insurance_loss')} />
                <RHFSwitch name="quotation" label={t('cost_estimate')} />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t('when_did_the_damage_occur')}</Typography>
                <Controller
                  name="damageDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
              </Stack>
              <Typography variant="subtitle2">{t('where_did_the_damage_occur')}</Typography>
              <Box
                rowGap={3}
                marginTop={-1}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="damageCity" label={t('location')} />
                <RHFTextField name="damageCountry" label={t('country')} />
              </Box>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t('where_is_the_vehicle_located')}</Typography>
                <RHFTextField name="damagedVehicleLocation" label={t('location')} />
              </Stack>
              <RHFTextField name="damageNumber" label={t('damage_number')} />
            </Box>
          </Card>
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('accident')} (Optional)
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
              <Stack spacing={1}>
                <RHFSwitch name="accidentWithInjuries" label={t('with_injuries')} />
                <RHFSwitch name="accidentWithWitnesses" label={t('with_witnesses')} />
                <RHFSwitch name="accidentPoliceRecorded" label={t('recorded_by_police')} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('who_was_driving')}</Typography>
                <RHFRadioGroup row spacing={4} name="driverAtAccident" options={DRIVER_TYPES} />
              </Stack>

              <Divider />
              <RHFTextField name="accidentDescription" label={t('description')} multiline rows={7} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
}

import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslate } from 'src/locales';
import { YES_OR_NO_TYPES } from 'src/constants/viewConstants';

import { RHFSelect, RHFCheckbox, RHFTextField } from 'src/components/hook-form';

type Props = {
  watch: any,
  setValue: any,
}

export default function AboutVehicle({ watch, setValue }: Props) {
  const { t } = useTranslate();
  const { control } = useFormContext();

  const historyWatch = watch('aboutVehicle.isHistoryMaintained');
  const importWatch = watch('aboutVehicle.isImported');
  const accidentDocWatch = watch('aboutVehicle.isDocAvailable');
  const tuvWatch = watch('aboutVehicle.isTUVDue');

  useEffect(() => {
    if (!historyWatch) {
      setValue('aboutVehicle.lastServiceDate', null);
    }
    if (!importWatch) {
      setValue('aboutVehicle.importCountry', '');
    }
    if (accidentDocWatch) {
      setValue('aboutVehicle.damageCost', 0);
    }
    if (tuvWatch) {
      setValue('aboutVehicle.tuvDueDate', null);
    }
  }, [accidentDocWatch, historyWatch, importWatch, setValue, tuvWatch]);

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('about_vehicle')}
      </Typography>
      <Box
        marginTop={3}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        <RHFTextField type='number' name="aboutVehicle.numberOfOwners" label={t('number_of_owners')} />
        <RHFSelect name="aboutVehicle.vehicleKeyCount" label={t('vehicle_keys')}>
          {[1, 2, 3, 4].map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </RHFSelect>
        <Stack>
          <RHFCheckbox name="aboutVehicle.isHistoryMaintained" label={t("service_booklet_maintained")} />
          {historyWatch && (
            <Stack spacing={1.5} mt={2}>
              <Typography variant="subtitle2">{t('if_yes_last_service')}</Typography>
              <Controller
                name="aboutVehicle.lastServiceDate"
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
          )}
        </Stack>
        <Stack>
          <RHFCheckbox name="aboutVehicle.isTUVDue" label={t("tuv_due")} />
          {!tuvWatch && (
            <Stack spacing={1.5} mt={2}>
              <Typography variant="subtitle2">{t('If_no_last_tuv')}</Typography>
              <Controller
                name="aboutVehicle.tuvDueDate"
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
          )}
        </Stack>

        <RHFSelect name="aboutVehicle.vehicleFactor" label={t('valuation_factor')}>
          {[70, 80, 90, 100, 110].map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </RHFSelect>
        <RHFTextField name="aboutVehicle.mileage" label={t('mileage')} />
        <Stack>
          <RHFCheckbox name="aboutVehicle.isImported" label={t("import_vehicle")} />
          {importWatch && (
            <RHFTextField sx={{ mt: 3 }} name="aboutVehicle.importCountry" label={t('if_yes_which_country')} />
          )}
        </Stack>

        <Stack>
          <RHFCheckbox name="aboutVehicle.isDocAvailable" label={t("if_had_accident_documents_available")} />
          {!accidentDocWatch && (
            <RHFTextField type='number' sx={{ mt: 3 }} name="aboutVehicle.damageCost" label={t('if_no_documents_damage_cost')} />
          )}
        </Stack>

        <RHFSelect name="aboutVehicle.isAccidentFree" label={t('accident_free')}>
          {YES_OR_NO_TYPES.map((item) => (
            <MenuItem key={item.label} value={item.value}>
              {t(item.label)}
            </MenuItem>
          ))}
        </RHFSelect>
      </Box>
    </Card>
  )
}

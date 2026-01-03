import { Controller, useFormContext } from 'react-hook-form';

import Stack from "@mui/system/Stack";
import Typography from "@mui/material/Typography";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

export default function DateForm() {
  const { t } = useTranslate();
  const { control } = useFormContext();

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{t('first_registration')}</Typography>
      <Controller
        name="customerVehicleFirstRegistration"
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
  );
}

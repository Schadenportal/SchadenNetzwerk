import { Controller, useFormContext } from 'react-hook-form';

import Stack from "@mui/material/Stack";
import { DateTimePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

type Props = {
  label: string;
  name: string;
  format?: string;
};

export default function RHFDateTimeForm({ format, label, name }: Props) {
  const { control } = useFormContext();

  return (
    <Stack spacing={1.5}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DateTimePicker
            {...field}
            format={format || "dd.MM.yyyy HH:mm"}
            sx={{ bgcolor: 'white' }}
            onChange={(date) => {
              field.onChange(date);
            }}
            slotProps={{
              textField: {
                sx: {
                },
                label,
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

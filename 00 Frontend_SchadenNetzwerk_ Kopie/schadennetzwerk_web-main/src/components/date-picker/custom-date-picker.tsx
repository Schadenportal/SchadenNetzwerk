import { Controller, useFormContext } from 'react-hook-form';

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

type Props = {
  fieldName: string,
  title: string,
}

export default function CustomDatePicker({ fieldName, title }: Props) {

  const { control } = useFormContext();

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{title}</Typography>
      <Controller
        name={fieldName}
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

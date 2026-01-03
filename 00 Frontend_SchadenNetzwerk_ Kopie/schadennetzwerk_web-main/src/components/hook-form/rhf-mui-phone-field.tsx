import { MuiTelInput, matchIsValidTel } from 'mui-tel-input';
import { Controller, useFormContext } from 'react-hook-form';

import { TextFieldProps } from '@mui/material/TextField';
import { Typography, InputAdornment } from '@mui/material';

import Iconify from '../iconify';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  isWhatsapp?: boolean;
};

export default function RHFMuiPhoneField({ name, helperText, type, isWhatsapp, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      rules={{
        validate: (value) => matchIsValidTel(value),
      }}
      render={({ field, fieldState: { error } }) => (
        <MuiTelInput
          {...field}
          {...other}
          InputProps={{
            endAdornment: isWhatsapp && (
              <InputAdornment position="start">
                <Iconify icon="logos:whatsapp-icon" width={24} height={24} color="#25D366" />
              </InputAdornment>
            ),
          }}
          defaultCountry="DE"
          continents={['EU']}
          sx={{ input: { color: 'common.main' } }}
          onChange={(value) => field.onChange(value)}
          error={!!error}
          helperText={error ? error?.message : <Typography variant='caption' sx={{ color: "error.main" }}>{helperText}</Typography>}
        />
      )}
      name={name}
    />
  );
}

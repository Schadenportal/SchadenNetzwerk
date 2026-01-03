import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

import TextField, { TextFieldProps } from '@mui/material/TextField';


// ----------------------------------------------------------------------

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
  (props, ref) => {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator='.'
        decimalSeparator=','
        valueIsNumericString
        decimalScale={2}
        prefix="€"
      />
    );
  },
);

type Props = TextFieldProps & {
  name: string;
};

export default function RHFFormattedNumberField({ name, helperText, type, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          InputProps={{
            inputComponent: NumericFormatCustom as any,
          }}
          {...other}
        />
      )}
    />
  );
}

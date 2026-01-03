import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IMaskInput } from 'react-imask';

import InputAdornment from '@mui/material/InputAdornment';

import { useTranslate } from 'src/locales';

import Iconify from '../iconify';
import { RHFTextField } from '../hook-form';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const mask = [{ mask: '+00 (000) 0000000' }, { mask: '+00 (000) 00000000' }];

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  (props, ref) => {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={mask}
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  },
);

type Props = {
  name: string;
};

export default function WhatsappMask({ name }: Props) {

  const { t } = useTranslate();

  return (
    <RHFTextField name={name} label={t('whatsapp')} helperText="Ex: +49 (761) 12345678" InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Iconify icon="logos:whatsapp-icon" width={24} height={24} color="#25D366" />
        </InputAdornment>
      ),
      inputComponent: TextMaskCustom as any,
    }} />
  );
}

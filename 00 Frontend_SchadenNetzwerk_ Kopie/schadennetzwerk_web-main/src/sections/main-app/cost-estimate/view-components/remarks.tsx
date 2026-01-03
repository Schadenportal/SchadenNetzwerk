import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { RHFTextField } from "src/components/hook-form";

type Props = {
  title?: string,
}

export default function Remarks({ title }: Props) {
  const { t } = useTranslate();

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('remarks')}
      </Typography>
      <Typography variant='subtitle2' my={3}>
        {title ? t(title) : t('remarks_desc')}
      </Typography>
      <RHFTextField name="remarks" label={t('description')} multiline rows={7} />
    </Card>
  )
}

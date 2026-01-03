import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { RHFTextField } from "src/components/hook-form";

type Props = {
  title?: string,
}

export default function RepairInstructions({ title }: Props) {
  const { t } = useTranslate();

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('repair_instructions')}
      </Typography>
      <Typography variant='subtitle2' mt={3} mb={1}>
        {title ? t(title) : t('repair_instructions_desc')}
      </Typography>
      <Typography variant='subtitle2' mb={3}>
        {t('repair_instructions_desc_ex')}
      </Typography>
      <RHFTextField name="repairInstructions" label={t('description')} multiline rows={7} />
    </Card>
  )
}

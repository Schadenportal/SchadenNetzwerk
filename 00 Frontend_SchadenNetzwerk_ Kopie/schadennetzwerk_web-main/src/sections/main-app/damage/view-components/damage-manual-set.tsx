import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from "@mui/material/Typography";

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { MAIN_MANAGER_ROLES } from 'src/constants/viewConstants';

import Label from 'src/components/label';
import { RHFCheckbox } from 'src/components/hook-form';

export default function DamageManualSet() {
  const { t } = useTranslate();
  const { user } = useAuthContext();

  if (user && MAIN_MANAGER_ROLES.includes(user.role)) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" color="primary" mb={2}>
          {t('create_damage_manually')}
        </Typography>
        <Label variant='soft' color='warning' my={2} sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: { xs: 4, sm: 3, lg: 2 } }}>
          {t('damage_manual_creating_desc')}
        </Label>
        <Box
          sx={{ pt: 0 }}
          rowGap={0}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
          }}>
          <RHFCheckbox name="isManualCreating" label={t("i_will_create_manually")} />
          <RHFCheckbox name="willSendDelayedReminder" label={t("i_will_send_notification")} />
        </Box>
      </Card>
    );
  }

  return null;
}

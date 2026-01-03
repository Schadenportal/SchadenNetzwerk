import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { EmailInboxIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function FirebaseVerifyView() {
  const searchParams = useSearchParams();
  const { t } = useTranslate();

  const email = searchParams.get('email');

  const renderHead = (
    <>
      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" sx={{ mb: 1 }}>
        {t('please_check_your_email')}
      </Typography>

      <Stack spacing={1} sx={{ color: 'text.secondary', typography: 'body2', mb: 5 }}>
        <Box component="span">{t('we_have_sent_a_confirmation_link_to_')}</Box>
        <Box component="strong" sx={{ color: 'text.primary' }}>
          {email}
        </Box>
        <Box component="div">{t('please_check_your_inbox_spam')}</Box>
      </Stack>
    </>
  );

  return (
    <>
      {renderHead}

      <Button
        component={RouterLink}
        href={paths.auth.firebase.login}
        size="large"
        color="inherit"
        variant="contained"
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        sx={{ alignSelf: 'center' }}
      >
        {t('return_to_sign_in')}
      </Button>
    </>
  );
}

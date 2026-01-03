import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { PasswordIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function FirebaseForgotPasswordView() {
  const { forgotPassword } = useAuthContext();
  const { t } = useTranslate();

  const router = useRouter();

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required(t('email_is_required')).email(t('email_must_be_valid')),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await forgotPassword?.(data.email);

      const searchParams = new URLSearchParams({
        email: data.email,
      }).toString();

      const href = `${paths.auth.firebase.verify}?${searchParams}`;
      router.push(href);
    } catch (error) {
      console.error(error);
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label={t('email')}
        sx={{
          '& .MuiInputLabel-root': {
            color: (theme) => theme.palette.text.tableText,
            '&.Mui-focused': {
              color: (theme) => theme.palette.text.tableText,
            },
            '&.Mui-active': {
              color: (theme) => theme.palette.text.tableText,
            },
          },
          '& .MuiOutlinedInput-input': {
            color: (theme) => theme.palette.text.tableText,
            '&::selection': {
              backgroundColor: (theme) => theme.palette.text.tableText,
              color: (theme) => theme.palette.background.paper,
            },
            '&::-moz-selection': {
              backgroundColor: (theme) => theme.palette.text.tableText,
              color: (theme) => theme.palette.background.paper,
            },
          },
          '& .MuiOutlinedInput-root': {
            color: (theme) => theme.palette.text.tableText,
            '& fieldset': {
              borderColor: (theme) => theme.palette.text.tableText,
            },
            '&:hover fieldset': {
              borderColor: (theme) => theme.palette.text.tableText,
            },
            '&.Mui-focused': {
              color: (theme) => theme.palette.text.tableText,
              '& fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
                borderWidth: '2px',
              },
            },
            '&.Mui-active': {
              color: (theme) => theme.palette.text.tableText,
            },
          },
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {t('send_request')}
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.firebase.login}
        color="text.tableText"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          color: (theme) => theme.palette.text.tableText
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        {t('return_to_sign_in')}
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3" color="text.tableText">{t('forgot_password')}</Typography>

        <Typography variant="body2" sx={{ color: 'text.tableText' }}>
          {t('please_enter_email_associated_')}
        </Typography>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}

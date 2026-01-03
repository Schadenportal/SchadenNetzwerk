import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function FirebaseLoginView() {
  const { t } = useTranslate();
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password)
        .then((res) => {
          router.push(returnTo || PATH_AFTER_LOGIN);
        })
        .catch((err) => {
          setErrorMsg(t('invalid_email_or_password'));
        });
    } catch (error) {
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4" color="text.tableText">Sign in</Typography>

      {/* <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">{t('new_user')}</Typography>

        <Link component={RouterLink} href={paths.auth.firebase.register} variant="subtitle2">
          {t('create_an_account')}
        </Link>
      </Stack> */}
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5} sx={{ color: (theme) => theme.palette.text.tableText }}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField
        name="email"
        label={t('email')}
        sx={{
          '& .MuiInputLabel-root': {
            color: (theme) => theme.palette.text.tableText,
            '&.Mui-focused': {
              color: (theme) => theme.palette.text.tableText,
            },
            '&.Mui-active': {
              color: (theme) => theme.palette.text.tableText,
            },
            '&.MuiInputLabel-shrink': {
              color: (theme) => theme.palette.text.tableText,
              '&.Mui-focused': {
                color: (theme) => theme.palette.text.tableText,
              },
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

      <RHFTextField
        name="password"
        label={t('password')}
        type={password.value ? 'text' : 'password'}
        sx={{
          '& .MuiInputLabel-root': {
            color: (theme) => theme.palette.text.tableText,
            '&.Mui-focused': {
              color: (theme) => theme.palette.text.tableText,
            },
            '&.Mui-active': {
              color: (theme) => theme.palette.text.tableText,
            },
            '&.MuiInputLabel-shrink': {
              color: (theme) => theme.palette.text.tableText,
              '&.Mui-focused': {
                color: (theme) => theme.palette.text.tableText,
              },
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
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={password.onToggle}
                edge="end"
                sx={{ color: (theme) => theme.palette.text.tableText }}
              >
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link
        component={RouterLink}
        href={paths.auth.firebase.forgotPassword}
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        {t('forgot_password')}
      </Link>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ bgcolor: (theme) => theme.palette.primary.main, color: (theme) => theme.palette.primary.contrastText }}
      // sx={{
      //   bgcolor: (theme) => theme.palette.background.paper,
      //   '&:hover': {
      //     bgcolor: (theme) => theme.palette.text.tableText,
      //   },
      //   '&.MuiLoadingButton-root': {
      //     color: "white",
      //   },
      // }}
      >
        {t('login')}
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}

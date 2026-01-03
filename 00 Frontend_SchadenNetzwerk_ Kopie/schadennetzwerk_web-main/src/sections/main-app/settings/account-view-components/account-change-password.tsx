import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { changeAuthUser } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { QueryResultType } from 'src/types/enums';
// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const { logout } = useAuthContext();

  const password = useBoolean();

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required(t('old_password_is_required')),
    newPassword: Yup.string()
      .required(t('new_password_is_required'))
      .min(6, t('password_must_be_at_least_6_characters'))
      .test(
        t('no_match'),
        t('new_password_must_be_different_than_old_password'),
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], t('password_must_match')),
  });

  const defaultValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await changeAuthUser({ password: data.newPassword })
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          reset();
          enqueueSnackbar(t('updated_successfully'));
          logout();
        })
        .catch(err => {
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        });
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <RHFTextField
          name="oldPassword"
          type={password.value ? 'text' : 'password'}
          label={t('old_password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="newPassword"
          label={t('new_password')}
          type={password.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={
            <Stack component="span" direction="row" alignItems="center">
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> Password must be minimum
              6+
            </Stack>
          }
        />

        <RHFTextField
          name="confirmPassword"
          type={password.value ? 'text' : 'password'}
          label={t('confirm_password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          {t('save_changes')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

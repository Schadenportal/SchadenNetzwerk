import "yup-phone-lite";
import * as Yup from 'yup';
import format from "date-fns/format";
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';
import { modifyFileName, trimPhoneNumber, checkAndTrimWhatsAppNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { uploadFile } from "src/services/firebase/firebaseStorage";
import { updateUserFunc, changeAuthUser } from "src/services/firebase/functions";

import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from "src/components/custom-dialog";
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFMuiPhoneField,
} from 'src/components/hook-form';

import { QueryResultType } from "src/types/enums";
// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const { user, updateUserInfo, logout } = useAuthContext();

  const { t } = useTranslate();

  const confirm = useBoolean();

  const [isDeleting, setIsDeleting] = useState(false);

  const UpdateUserSchema = Yup.object().shape({
    firstName: Yup.string().required(t('firstName_is_required')),
    lastName: Yup.string().required(t('lastName_is_required')),
    email: Yup.string().required(t('email_is_required')).email(t('email_must_be_valid')),
    whatsapp: Yup.string(),
    phone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    photoURL: Yup.mixed<any>().nullable(),
    street: Yup.string(),
    country: Yup.string(),
    city: Yup.string(),
    postalCode: Yup.string(),
    about: Yup.string(),
    isPublic: Yup.boolean(),
  });

  const defaultValues: any = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    phone: user?.phone || '',
    photoURL: user?.photoURL || null,
    country: user?.country || '',
    city: user?.city || '',
    street: user?.street || '',
    postalCode: user?.postalCode || '',
    about: user?.about || '',
    isPublic: user?.isPublic || false,
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const file = data.photoURL;
      let userData: Record<string, any> = {};
      if (file && file instanceof File) {
        const filePath = `users/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
        const downloadURL = await uploadFile(file as File, filePath);
        if (downloadURL) {
          userData = {
            ...data,
            photoURL: downloadURL,
          };
        }
      } else {
        // delete data.photoURL;
        userData = data;
      }
      userData.phone = trimPhoneNumber(data.phone);
      userData.whatsapp = checkAndTrimWhatsAppNumber(data.whatsapp);
      await updateUserFunc(userData)
        .then(async (res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          await updateUserInfo(userData);
          enqueueSnackbar(t('updated_successfully'));
        })
        .catch((err) => {
          console.error(err);
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  const handleDeleteUser = useCallback(async () => {
    setIsDeleting(true);
    try {
      await changeAuthUser({ isDisable: true })
        .then((res: any) => {
          setIsDeleting(false);
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          enqueueSnackbar(t('updated_successfully'));
          logout();
        })
        .catch(err => {
          setIsDeleting(false);
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        });
    } catch (error) {
      setIsDeleting(false);
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, logout, t]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
              <RHFUploadAvatar
                name="photoURL"
                maxSize={10485760}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(10485760)}
                  </Typography>
                }
              />

              <RHFSwitch
                name="isPublic"
                labelPlacement="start"
                label={t('public_profile')}
                sx={{ mt: 5 }}
              />

              <Button variant="soft" color="error" sx={{ mt: 3 }} onClick={() => { confirm.onTrue(); }}>
                {t('delete_account')}
              </Button>
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="firstName" label={t('first_name')} />
                <RHFTextField name="lastName" label={t('last_name')} />
                <RHFTextField name="email" label={t('email')} disabled />
                <RHFMuiPhoneField name="whatsapp" label={t('whatsapp')} isWhatsapp />
                <RHFMuiPhoneField name="phone" label={t('phone')} />
                <RHFTextField name="street" label={t('street')} />
                <RHFTextField name="postalCode" label={t('postal_code')} />
                <RHFTextField name="city" label={t('city')} />
                <RHFTextField name="country" label={t('country')} />
              </Box>

              <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
                <RHFTextField name="about" multiline rows={4} label="About" />

                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {t('save_changes')}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={t('confirm_delete')}
        action={
          <LoadingButton variant="contained" color="error" onClick={handleDeleteUser} loading={isDeleting}>
            {t('delete')}
          </LoadingButton>
        }
      />
    </>
  );
}

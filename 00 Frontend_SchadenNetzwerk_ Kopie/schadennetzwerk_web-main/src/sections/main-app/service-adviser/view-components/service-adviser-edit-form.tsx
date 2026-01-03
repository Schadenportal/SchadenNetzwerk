import "yup-phone-lite";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { trimPhoneNumber, checkAndTrimWhatsAppNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { useAuthContext } from "src/auth/hooks";
import ServiceAdviserModel from "src/models/ServiceAdviserModel";
import { setServiceAdviser } from "src/services/firebase/functions";

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFMuiPhoneField,
} from "src/components/hook-form";

import { UserRole, QueryResultType } from "src/types/enums";

// ----------------------------------------------------------------------

type Props = {
  currentAdviser?: ServiceAdviserModel;
};

export default function ServiceAdviserEditForm({ currentAdviser }: Props) {
  const router = useRouter();
  const { t } = useTranslate();
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewCustomerSchema = Yup.object().shape({
    adviserId: Yup.string().optional(),
    workshopId: Yup.string().optional(),
    firstName: Yup.string().required(t('firstName_is_required')),
    lastName: Yup.string().required(t('lastName_is_required')),
    email: Yup.string().required(t('email_is_required')),
    phone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    whatsapp: Yup.string(),
    street: Yup.string().required(t('street_is_required')),
    country: Yup.string().required(t('country_is_required')),
    city: Yup.string().required(t('city_is_required')),
    postalCode: Yup.string().required(t('postal_code_is_required')),
  });

  const defaultValues = useMemo(
    () => ({
      adviserId: currentAdviser?.adviserId || '',
      workshopId: currentAdviser?.workshopId || '',
      firstName: currentAdviser?.firstName || '',
      lastName: currentAdviser?.lastName || '',
      email: currentAdviser?.email || '',
      phone: currentAdviser?.phone || '',
      whatsapp: currentAdviser?.whatsapp || '',
      street: currentAdviser?.street || '',
      country: currentAdviser?.country || 'Deutschland',
      city: currentAdviser?.city || '',
      postalCode: currentAdviser?.postalCode || '',
    }),
    [currentAdviser]
  );

  const methods = useForm({
    resolver: yupResolver(NewCustomerSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentAdviser) {
      reset(defaultValues);
    }
  }, [currentAdviser, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data
      }
      if (user && user.workshopIds && user.workshopIds.length > 0 && user.role === UserRole.Owner) {
        formData.workshopId = user.workshopIds[0];
      } else {
        enqueueSnackbar(t('alert_you_can_not_create_service_adviser'), {
          variant: 'error',
        });
        return;
      }
      if (currentAdviser) {
        formData.adviserId = currentAdviser.adviserId;
      }
      formData.phone = trimPhoneNumber(formData.phone);
      formData.whatsapp = checkAndTrimWhatsAppNumber(formData.whatsapp);
      await setServiceAdviser(formData)
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          reset();
          enqueueSnackbar(currentAdviser ? t('updated_successfully') : t('created_successfully'));
          router.push(paths.dashboard.service_adviser.root);
        })
        .catch((err) => {
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        })
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              marginTop={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstName" label={t('first_name')} />
              <RHFTextField name="lastName" label={t('last_name')} />
              <RHFTextField name="email" label={t('email')} />
              <RHFMuiPhoneField name="phone" label={t('phone')} />
              <RHFMuiPhoneField name="whatsapp" label={t('whatsapp')} isWhatsapp />
            </Box>
            <Divider sx={{ borderStyle: 'dashed', my: 5 }} />
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="street" label={t('street')} />
              <RHFTextField name="postalCode" label={t('postal_code')} />
              <RHFTextField name="city" label={t('city')} />
              <RHFTextField name="country" label={t('country')} />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentAdviser ? t('create_service_adviser') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

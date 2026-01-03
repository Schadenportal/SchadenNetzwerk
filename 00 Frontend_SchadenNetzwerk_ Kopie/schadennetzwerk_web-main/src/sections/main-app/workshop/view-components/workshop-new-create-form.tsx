import "yup-phone-lite";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from "@mui/material/Divider";
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { trimPhoneNumber, checkAndTrimWhatsAppNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { useAuthContext } from "src/auth/hooks";
import WorkshopModel from "src/models/WorkshopModel";
import { setWorkshopFunc } from "src/services/firebase/functions";

import Label from "src/components/label";
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFMuiPhoneField,
} from 'src/components/hook-form';

import { UserRole, QueryResultType } from "src/types/enums";


// ----------------------------------------------------------------------

type Props = {
  currentWorkshop?: WorkshopModel;
};

export default function WorkshopNewEditForm({ currentWorkshop }: Props) {
  const router = useRouter();
  const { t } = useTranslate();
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewWorkshopSchema = Yup.object().shape({
    name: Yup.string().required(t('name_is_required')),
    email: Yup.string().required(t('email_is_required')).email(t('email_must_be_valid')),
    phone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    whatsapp: Yup.string(),
    street: Yup.string().required(t('street_is_required')),
    country: Yup.string().required(t('country_is_required')),
    city: Yup.string().required(t('city_is_required')),
    postalCode: Yup.string().required(t('postal_code_is_required')),
    otherEmails: Yup.object().shape({
      transportEmail: Yup.string(),
      ceoEmail: Yup.string().required(t('email_is_required')).email(t('email_must_be_valid')),
      otherEmail: Yup.string(),
    }),
    commission: Yup.number(),
    setupFee: Yup.number(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentWorkshop?.name || '',
      email: currentWorkshop?.email || '',
      phone: currentWorkshop?.phone || '',
      whatsapp: currentWorkshop?.whatsapp || '',
      street: currentWorkshop?.street || '',
      country: currentWorkshop?.country || 'Deutschland',
      city: currentWorkshop?.city || '',
      postalCode: currentWorkshop?.postalCode || '',
      otherEmails: {
        transportEmail: currentWorkshop?.otherEmails?.transportEmail || '',
        ceoEmail: currentWorkshop?.otherEmails?.ceoEmail || '',
        otherEmail: currentWorkshop?.otherEmails?.otherEmail || '',
      },
      commission: currentWorkshop?.commission || 0,
      setupFee: currentWorkshop?.setupFee || 0,
    }),
    [currentWorkshop]
  );

  const methods = useForm({
    resolver: yupResolver(NewWorkshopSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentWorkshop) {
      reset(defaultValues);
    }
  }, [currentWorkshop, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data
      }
      if (currentWorkshop) {
        formData.workshopId = currentWorkshop.workshopId
      }
      formData.phone = trimPhoneNumber(formData.phone);
      formData.whatsapp = checkAndTrimWhatsAppNumber(formData.whatsapp);
      await setWorkshopFunc(formData)
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          reset();
          enqueueSnackbar(currentWorkshop ? t('updated_successfully') : t('created_successfully'));
          if (user && user.role === UserRole.Admin) {
            router.push(paths.admin.workshops.root);
            return;
          }
          router.push(paths.dashboard.workshops.root);
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
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label={t('workshop_name')} />
              <RHFTextField name="email" label={`${t('email')} (${t('damage_email')})`} disabled={!!currentWorkshop} />
              <RHFTextField name="otherEmails.transportEmail" label={t('transport_email')} />
              <RHFTextField name="otherEmails.ceoEmail" label={t('ceo_email')} />
              <RHFTextField name="otherEmails.otherEmail" label={t('other_email')} />
            </Box>
            <Divider sx={{ borderStyle: 'dashed', mt: 3 }} />
            <Label variant='soft' color='info' mt={2} sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: { xs: 4, sm: 2 } }}>
              {t('do_you_want_to_receive_notification')}
            </Label>
            <Box
              rowGap={3}
              mt={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFMuiPhoneField name="whatsapp" label={t('whatsapp')} isWhatsapp />
              <RHFMuiPhoneField name="phone" label={t('phone')} />
            </Box>
            <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField type="number" name="commission" label={t('commission')} />
              <RHFTextField type="number" name="setupFee" label={t('setup_fee')} />
            </Box>
            <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
            <Box
              rowGap={3}
              mt={3}
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
                {!currentWorkshop ? t('create_workshop') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

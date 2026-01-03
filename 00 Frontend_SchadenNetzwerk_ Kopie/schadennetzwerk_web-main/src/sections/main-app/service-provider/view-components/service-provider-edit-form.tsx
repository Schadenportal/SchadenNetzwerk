import "yup-phone-lite";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { trimPhoneNumber, checkAndTrimWhatsAppNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { useAuthContext } from "src/auth/hooks";
import ServiceProviderModel from "src/models/ServiceProviderModel";
import { setServiceProviderFunc } from "src/services/firebase/functions";

import { useSnackbar } from 'src/components/snackbar';
import Label, { LabelColor } from "src/components/label";
import FormProvider, {
  RHFSwitch,
  RHFCheckbox,
  RHFTextField,
  RHFRadioGroup,
  RHFMuiPhoneField,
} from "src/components/hook-form";

import { UserRole, QueryResultType, ServiceProviderType } from "src/types/enums";

// ----------------------------------------------------------------------

type Props = {
  currentServiceProvider?: ServiceProviderModel;
};

type ServiceOptionType = {
  value: string,
  label: string,
  color: LabelColor,
  abbreviation: string,
}

export const SERVICE_PROVIDER_OPTIONS: ServiceOptionType[] = [
  { value: ServiceProviderType.ATTORNEY, label: 'Rechtsanwalt RA', color: 'primary', abbreviation: 'RA' },
  { value: ServiceProviderType.APPRAISER, label: 'Gutachter GA', color: 'success', abbreviation: 'GA' },
  { value: ServiceProviderType.CAR_RENTAL, label: 'Unfallersatz UE', color: 'error', abbreviation: 'UE' },
  { value: ServiceProviderType.PAINT_SHOP, label: 'Lack & Karosserie LK', color: 'warning', abbreviation: 'LK' },
  { value: ServiceProviderType.TOWING_SERVICE, label: 'Abschleppdienst AD', color: 'info', abbreviation: 'AD' },
];

export const USER_TYPE_OPTIONS = [
  { value: UserRole.Admin, label: 'admin' },
  { value: UserRole.Owner, label: 'workshop' },
  { value: UserRole.Lawyer, label: 'attorney' },
  { value: UserRole.Appraiser, label: 'appraiser' },
  { value: UserRole.CarRenter, label: 'car_rental' },
  { value: UserRole.TowingService, label: 'towing_service' },
  { value: UserRole.PaintShop, label: 'paint_shop' },
  { value: UserRole.Salesman, label: 'salesman' },
  { value: UserRole.SalesAppraiser, label: 'sales_appraiser' },
  { value: UserRole.Agent, label: 'agent' },
];

export default function ServiceProviderEditForm({ currentServiceProvider }: Props) {
  const router = useRouter();
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const [isShowCommission, setIsShowCommission] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    serviceType: Yup.string().required(t('service_type_is_required')),
    // workshopIds: Yup.array().min(1, t('choose_at_least_one_workshop')),
    name: Yup.string().required(t('name_is_required')),
    email: Yup.string().required(t('email_is_required')).email(t('email_must_be_valid')),
    phone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    telephone: Yup.string(),
    whatsapp: Yup.string(),
    commission: Yup.number(),
    setupFee: Yup.number(),
    needSendContract: Yup.boolean(),
    street: Yup.string().required(t('street_is_required')),
    country: Yup.string().required(t('country_is_required')),
    city: Yup.string().required(t('city_is_required')),
    postalCode: Yup.string().required(t('postal_code_is_required')),
    isSalesmanToo: Yup.boolean(),
    salesmanNumber: Yup.string().when('isSalesmanToo', {
      is: true,
      then: (schema) => schema.required(t('salesman_number_is_required')),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      serviceType: currentServiceProvider?.serviceType || (user && user.role !== UserRole.Admin ? ServiceProviderType.APPRAISER : ''),
      // workshopIds: currentServiceProvider?.workshopIds || [],
      name: currentServiceProvider?.name || '',
      email: currentServiceProvider?.email || '',
      phone: currentServiceProvider?.phone || '+49',
      telephone: currentServiceProvider?.telephone || '',
      whatsapp: currentServiceProvider?.whatsapp || '+49',
      commission: currentServiceProvider?.commission || 0,
      setupFee: currentServiceProvider?.setupFee || 0,
      needSendContract: currentServiceProvider?.needSendContract || false,
      street: currentServiceProvider?.street || '',
      country: currentServiceProvider?.country || 'Deutschland',
      city: currentServiceProvider?.city || '',
      postalCode: currentServiceProvider?.postalCode || '',
      isSalesmanToo: false,
      salesmanNumber: '',
    }),
    [currentServiceProvider, user]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentServiceProvider) {
      reset(defaultValues);
    }
  }, [currentServiceProvider, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data
      }
      if (currentServiceProvider) {
        formData.serviceProviderId = currentServiceProvider.serviceProviderId;
      }
      formData.phone = trimPhoneNumber(formData.phone);
      formData.whatsapp = checkAndTrimWhatsAppNumber(formData.whatsapp);
      formData.isDisabled = currentServiceProvider ? currentServiceProvider.isDisabled || false : false;
      formData.telephone = formData.telephone ? trimPhoneNumber(formData.telephone) : '';
      await setServiceProviderFunc(formData)
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          reset();
          enqueueSnackbar(currentServiceProvider ? t('updated_successfully') : t('created_successfully'));
          router.push(paths.dashboard.service_providers.root);
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

  const serviceTypeChange = watch('serviceType');

  useEffect(() => {
    if (serviceTypeChange === ServiceProviderType.APPRAISER) {
      setIsShowCommission(true);
    } else if (serviceTypeChange === ServiceProviderType.ATTORNEY) {
      setIsShowCommission(true);
      setValue('isSalesmanToo', false);
      setValue('salesmanNumber', '');
    } else {
      setIsShowCommission(false);
      setValue('commission', 0);
      setValue('setupFee', 0);
      setValue('isSalesmanToo', false);
      setValue('salesmanNumber', '');
    }
  }, [serviceTypeChange, setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('provider_type')}</Typography>
              <RHFRadioGroup row spacing={4} name="serviceType" options={SERVICE_PROVIDER_OPTIONS} disabled={user!.role !== UserRole.Admin || !!currentServiceProvider} />
            </Stack>
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
              <RHFTextField name="name" label={t('name')} />
              <RHFTextField name="email" label={t('email')} disabled={!!currentServiceProvider} />
            </Box>
            <Label variant='soft' color='info' mt={2} sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: { xs: 4, sm: 2 } }}>
              {t('do_you_want_to_receive_notification')}
            </Label>
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
              <RHFMuiPhoneField name="whatsapp" label={t('whatsapp')} isWhatsapp />
              <RHFMuiPhoneField name="phone" label={t('mobile')} />
              <RHFTextField name="telephone" label={t('telephone')} />
            </Box>
            {isShowCommission && (
              <>
                <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
                {serviceTypeChange === ServiceProviderType.APPRAISER && (
                  <Label variant='soft' color='warning' sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: { xs: 3, sm: 1 } }}>
                    {t('update_this_to_create_salesman')}
                  </Label>
                )}
                <Stack spacing={1}>
                  <RHFSwitch name="needSendContract" label={t('need_to_send_contract')} disabled={!!currentServiceProvider} />
                </Stack>
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
                  {user && user.role === UserRole.Admin && serviceTypeChange === ServiceProviderType.APPRAISER && (
                    <>
                      <RHFCheckbox name="isSalesmanToo" label={t("do_you_want_to_create_salesman")} disabled={!!currentServiceProvider} />
                      <RHFTextField name="salesmanNumber" label={t('salesman_number')} disabled={!!currentServiceProvider} />
                    </>
                  )}
                </Box>
              </>
            )}
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
              <RHFTextField name="street" label={t('street')} />
              <RHFTextField name="postalCode" label={t('postal_code')} />
              <RHFTextField name="city" label={t('city')} />
              <RHFTextField name="country" label={t('country')} />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentServiceProvider ? t('create_service') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

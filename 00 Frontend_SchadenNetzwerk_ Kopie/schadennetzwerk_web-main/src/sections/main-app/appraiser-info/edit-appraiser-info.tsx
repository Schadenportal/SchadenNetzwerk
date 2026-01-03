import "yup-phone-lite";
import * as Yup from 'yup';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Divider } from "@mui/material";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import { trimPhoneNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { useAuthContext } from "src/auth/hooks";
import { useMainData } from "src/providers/data-provider";
import AppraiserInfoModel from "src/models/AppraiserInfoModel";
import { MAIN_MANAGER_ROLES } from "src/constants/viewConstants";
import { setAppraiserInfo } from "src/services/firebase/functions";
import { getAppraiserInfoByProviderId } from "src/services/firebase/firebaseFirestore";

import Label from "src/components/label/label";
import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFMuiPhoneField } from 'src/components/hook-form';

import { QueryResultType } from "src/types/enums";

export default function AppraiserInfoSectionView() {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const { serviceProvider } = useMainData();
  const { user } = useAuthContext();
  const { id } = useParams();
  const [originAppraiserInfo, setOriginAppraiserInfo] = useState<AppraiserInfoModel | null>(null);

  const DataSchema = Yup.object().shape({
    name: Yup.string().required(t('this_field_is_required')),
    companyName: Yup.string(),
    email: Yup.string().required(t('this_field_is_required')).email(t('email_must_be_valid')),
    phone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    address: Yup.object().shape({
      street: Yup.string().required(t('street_is_required')),
      country: Yup.string().required(t('country_is_required')),
      city: Yup.string().required(t('city_is_required')),
      postalCode: Yup.string().required(t('postal_code_is_required')),
    }),
  });

  const defaultValues = useMemo(() => ({
    name: originAppraiserInfo?.name || "",
    companyName: originAppraiserInfo?.companyName || "",
    email: originAppraiserInfo?.email || "",
    phone: originAppraiserInfo?.phone || "",
    address: originAppraiserInfo?.address || {
      street: "",
      country: "",
      city: "",
      postalCode: "",
    },
  }), [originAppraiserInfo]);

  const methods = useForm({
    resolver: yupResolver(DataSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = methods;


  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user) {
        return
      }
      if (!MAIN_MANAGER_ROLES.includes(user.role) && !serviceProvider) {
        return
      }
      let serviceProviderId = "";
      if (serviceProvider) {
        // eslint-disable-next-line prefer-destructuring
        serviceProviderId = serviceProvider.serviceProviderId;
      } else if (id) {
        serviceProviderId = id;
      } else {
        return
      }
      const formData: Record<string, any> = {
        ...data,
        appraiserId: serviceProviderId,
      };
      if (originAppraiserInfo) {
        formData.appraiserInfoId = originAppraiserInfo.appraiserInfoId;
      }
      formData.phone = trimPhoneNumber(formData.phone);
      const res: any = await setAppraiserInfo(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('created_successfully'), {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  const getOriginAppraiserInfo = useCallback(async () => {
    if (!user) return;

    if (!MAIN_MANAGER_ROLES.includes(user.role) && !serviceProvider) {
      return
    }

    let serviceProviderId = "";
    if (serviceProvider) {
      // eslint-disable-next-line prefer-destructuring
      serviceProviderId = serviceProvider.serviceProviderId;
    } else if (id) {
      serviceProviderId = id;
    } else {
      return
    }

    const appraiserInfo = await getAppraiserInfoByProviderId(serviceProviderId);
    if (appraiserInfo) {
      setOriginAppraiserInfo(appraiserInfo);
    }
  }, [id, serviceProvider, user]);

  useEffect(() => {
    if (errors && Object.keys(errors).length !== 0) {
      enqueueSnackbar(t('please_fill_all_required_fields'), {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, errors, t]);

  useEffect(() => {
    getOriginAppraiserInfo();
  }, [getOriginAppraiserInfo]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('appraiser_info')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('appraiser_info'), href: paths.dashboard.appraiser_info },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" color="warning.main" mb={2} textAlign="center" my={5} sx={{ width: "90%", marginLeft: "auto", marginRight: "auto", whiteSpace: 'pre-line' }}>
            {t('appraiser_info_not_completed_desc')}
          </Typography>
          <Label variant='soft' color='info' mt={2}
            sx={{
              whiteSpace: 'normal',
              textTransform: 'initial', lineHeight: 'inherit', py: { xs: 4, sm: 2 },
              bgcolor: 'warning.lighter',
            }}>
            {t('appraiser_info_desc')}
          </Label>
          <Box
            rowGap={3}
            columnGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ mx: "auto", mt: "1rem" }}
          >
            <RHFTextField name="name" label={t('name')} />
            <RHFTextField name="companyName" label={t('company_name')} />
            <RHFTextField name="email" label={t('email')} />
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
            <RHFTextField name="address.street" label={t('street')} />
            <RHFTextField name="address.postalCode" label={t('postal_code')} />
            <RHFTextField name="address.city" label={t('city')} />
            <RHFTextField name="address.country" label={t('country')} />
          </Box>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ bgcolor: "success.main" }}>
              {t('submit')}
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Container>
  )
}

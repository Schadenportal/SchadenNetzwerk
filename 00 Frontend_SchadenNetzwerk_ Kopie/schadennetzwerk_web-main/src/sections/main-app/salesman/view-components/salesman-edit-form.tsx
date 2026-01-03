import "yup-phone-lite";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from "@mui/material/Chip";
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { trimPhoneNumber, checkAndTrimWhatsAppNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import SalesmanModel from "src/models/SalesmanModel";
import WorkshopModel from "src/models/WorkshopModel";
import { setSalesman } from "src/services/firebase/functions";
import { searchWorkshop } from "src/services/firebase/firebaseFirestore";

import Label from "src/components/label";
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFCheckbox,
  RHFTextField,
  RHFAutocomplete,
  RHFMuiPhoneField
} from "src/components/hook-form";

import { QueryResultType } from "src/types/enums";


// ----------------------------------------------------------------------

type Props = {
  currentSalesman?: SalesmanModel;
};

export default function SalesmanEditForm({ currentSalesman }: Props) {
  const router = useRouter();
  const { t } = useTranslate();

  const [workshops, setWorkshops] = useState<WorkshopModel[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    workshopIds: Yup.array(),
    name: Yup.string().required(t('name_is_required')),
    email: Yup.string().required(t('email_is_required')).email(t('email_must_be_valid')),
    phone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    whatsapp: Yup.string(),
    commission: Yup.number().when('isAppraiserToo', (val, schema) => {
      if (val[0]) {
        return schema.required(t('this_field_is_required'));
      }
      return schema.nullable();
    }),
    salesmanNumber: Yup.string().required(t('salesman_number_is_required')),
    street: Yup.string().required(t('street_is_required')),
    country: Yup.string().required(t('country_is_required')),
    city: Yup.string().required(t('city_is_required')),
    postalCode: Yup.string().required(t('postal_code_is_required')),
    needSendContract: Yup.boolean(),
    isAppraiserToo: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      workshopIds: currentSalesman?.workshopIds || [],
      name: currentSalesman?.name || '',
      email: currentSalesman?.email || '',
      phone: currentSalesman?.phone || '',
      whatsapp: currentSalesman?.whatsapp || '',
      commission: currentSalesman?.commission || 0,
      salesmanNumber: currentSalesman?.salesmanNumber || '',
      street: currentSalesman?.street || '',
      country: currentSalesman?.country || 'Deutschland',
      city: currentSalesman?.city || '',
      postalCode: currentSalesman?.postalCode || '',
      isAppraiserToo: currentSalesman?.isAppraiserToo || false,
      needSendContract: currentSalesman?.needSendContract || false,
    }),
    [currentSalesman]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const getWorkshops = useCallback(async () => {
    await searchWorkshop({
      name: "",
      email: "",
      city: ""
    }).then((res) => {
      setWorkshops(res);
    })
      .catch(err => {
        console.log(err);
      })
  }, []);

  useEffect(() => {
    if (currentSalesman) {
      reset(defaultValues);
    }
  }, [currentSalesman, defaultValues, reset]);

  useEffect(() => {
    getWorkshops();
  }, [getWorkshops]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data
      }
      if (currentSalesman) {
        formData.salesmanId = currentSalesman.salesmanId;
      }
      formData.phone = trimPhoneNumber(formData.phone);
      formData.whatsapp = checkAndTrimWhatsAppNumber(formData.whatsapp);
      await setSalesman(formData)
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          reset();
          enqueueSnackbar(currentSalesman ? t('updated_successfully') : t('created_successfully'));
          router.push(paths.admin.salesman.root);
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

  const checkboxWatch = watch('isAppraiserToo');

  useEffect(() => {
    if (!checkboxWatch) {
      methods.setValue('commission', 0);
      methods.setValue('needSendContract', false);
    }
  }, [checkboxWatch, methods]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <RHFAutocomplete
              name="workshopIds"
              placeholder={`+ ${t('select_workshop')}`}
              multiple
              disableCloseOnSelect
              options={workshops.map((workshop) => workshop.workshopId)}
              getOptionLabel={(option) => workshops.filter((workshop) => workshop.workshopId === option)[0].name}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {workshops.filter((workshop) => workshop.workshopId === option)[0].name}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={workshops.filter((workshop) => workshop.workshopId === option)[0].name}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            />
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
              <RHFTextField name="email" label={t('email')} disabled={!!currentSalesman} />

            </Box>
            <Label variant='soft' color='info' mt={2} sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: { xs: 3, sm: 1 } }}>
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
              <RHFMuiPhoneField name="phone" label={t('phone')} />
              <RHFTextField name="salesmanNumber" label={t('salesman_number')} />
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
              <RHFTextField name="street" label={t('street')} />
              <RHFTextField name="postalCode" label={t('postal_code')} />
              <RHFTextField name="city" label={t('city')} />
              <RHFTextField name="country" label={t('country')} />
            </Box>
            <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
            <Box mt={2} pl={1} rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}>
              <RHFCheckbox name="isAppraiserToo" label={t("do_you_want_to_create_appraiser")} disabled={!!currentSalesman} />
            </Box>
            <Box mt={2} pl={1} rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}>
              {checkboxWatch && (
                <>
                  <Stack spacing={1}>
                    <RHFSwitch name="needSendContract" label={t('need_to_send_contract')} disabled={!!currentSalesman} />
                  </Stack>
                  <RHFTextField type="number" name="commission" label={t('commission')} disabled={!checkboxWatch} />
                </>
              )}
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentSalesman ? t('create_salesman') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

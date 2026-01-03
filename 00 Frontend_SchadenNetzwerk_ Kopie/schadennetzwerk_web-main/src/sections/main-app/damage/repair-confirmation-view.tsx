import * as Yup from 'yup';
import { useMemo } from 'react';
import format from "date-fns/format";
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/system/Box';
import Card from '@mui/material/Card'; import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { modifyFileName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { setRepairConfirmation } from 'src/services/firebase/functions';

import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFDateTimeFiled } from 'src/components/hook-form';

import { QueryResultType } from 'src/types/enums';

import RepairConfirmationFilesSection from './repair-confirmation-components/image-uploading-view';

export const repairFileKeys = [
  'frontImages',
  'rearImages',
  'distanceImages',
  'closeImages',
  'vehicleDocumentImages',
  'otherImages',
];

export default function RepairConfirmationView() {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id } = useParams();

  const newSchema = Yup.object().shape({
    firstName: Yup.string(),
    lastName: Yup.string(),
    captureDate: Yup.mixed<any>().nullable(),
    address: Yup.object().shape({
      street: Yup.string(),
      city: Yup.string(),
      postalCode: Yup.string(),
    }),
    licensePlate: Yup.string(),
    vin: Yup.string(),
    images: Yup.object().shape({
      frontImages: Yup.array(),
      rearImages: Yup.array(),
      distanceImages: Yup.array(),
      closeImages: Yup.array(),
      vehicleDocumentImages: Yup.array(),
      otherImages: Yup.array(),
    }),
  });

  const defaultValues = useMemo(() => ({
    firstName: '',
    lastName: '',
    captureDate: new Date(),
    address: {
      street: '',
      city: '',
      postalCode: '',
    },
    licensePlate: '',
    vin: '',
    images: {
      frontImages: [],
      rearImages: [],
      distanceImages: [],
      closeImages: [],
      vehicleDocumentImages: [],
      otherImages: [],
    },
  }), []);

  const methods = useForm({
    resolver: yupResolver(newSchema),
    defaultValues,
  });

  const {
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    if (!id) {
      enqueueSnackbar(t('invalid_id'), {
        variant: 'error',
      });
      return;
    }
    try {
      const formData: Record<string, any> = {
        ...data,
        damageId: id,
      };
      await Promise.all(repairFileKeys.map(async (fileKey) => {
        if (formData.images[fileKey] && formData.images[fileKey].length) {
          const downloadUrls = await Promise.all(
            formData.images[fileKey].map((file: any) => {
              if (file && file instanceof File) {
                const filePath = `repairConfirmation/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
                return uploadFile(file as File, filePath);
              }
              return ""
            })
          )
          const fileUrls = downloadUrls.filter(Boolean);
          const currentUrls: string[] = formData.images[fileKey].filter((item: any) => typeof item === "string");
          currentUrls.push(...fileUrls);
          formData.images[fileKey] = currentUrls
        }
      }));
      const res: any = await setRepairConfirmation(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      reset();
      enqueueSnackbar(t('created_successfully'));
      router.push(paths.dashboard.damages.root);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('repair_confirmation')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('repair_confirmation') },
          { name: t('create') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" color="primary" mb={2}>
            {t('repair_record')}
          </Typography>
          <Box
            marginTop={3}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 2fr)',
              sm: 'repeat(2, 2fr)',
            }}
          >
            <RHFTextField name="firstName" label={t('first_name')} />
            <RHFTextField name="lastName" label={t('last_name')} />
            <RHFDateTimeFiled name="captureDate" label={t('capture_date')} />
            <RHFTextField name="address.street" label={t('street')} />
            <RHFTextField name="address.postalCode" label={t('postal_code')} />
            <RHFTextField name="address.city" label={t('city')} />
            <RHFTextField name="licensePlate" label={t('license_plate')} />
            <RHFTextField name="vin" label="VIN" />
          </Box>
        </Card>
        <RepairConfirmationFilesSection getValues={getValues} setValue={setValue} />
        <Stack direction="row" spacing={3} alignContent="center" sx={{ my: 4, float: "right" }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {t('submit')}
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Container>
  );
}

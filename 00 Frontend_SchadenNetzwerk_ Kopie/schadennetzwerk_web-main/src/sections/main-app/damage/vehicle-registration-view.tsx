import "yup-phone-lite";
import axios from "axios";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tooltip } from "@mui/material";
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { API_ROOT, getCityAndPostCode } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { CLIENT_TYPES } from "src/constants/viewConstants";
import { useDocScanData } from "src/providers/damage-scan-provider";

import Image from "src/components/image/image";
import Label from "src/components/label/label";
import Iconify from "src/components/iconify/iconify";
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider, {
  RHFTextField,
  RHFRadioGroup,
} from "src/components/hook-form";

import DateForm from "./view-components/vehicle-registration-date";

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function VehicleRegistrationView() {
  const router = useRouter();
  const { t } = useTranslate();
  const { setDocInfo } = useDocScanData();

  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [vehicleInfo, setVehicleInfo] = useState<Record<string, any>>({});

  const NewVehicleSchema = Yup.object().shape({
    customerVehicleLicensePlate: Yup.string(),
    customerVehicleVINNumber: Yup.string(),
    customerVehicleBrand: Yup.string(),
    customerVehicleModel: Yup.string(),
    customerVehicleFirstRegistration: Yup.mixed<any>().nullable(),
    customerType: Yup.string(),
    customerFirstName: Yup.string(),
    customerLastName: Yup.string(),
    customerStreet: Yup.string(),
    customerCity: Yup.string(),
    customerPostalCode: Yup.string(),
  });

  const defaultValues: any = useMemo(
    () => ({
      customerVehicleLicensePlate: vehicleInfo?.registrationNumber || "",
      customerVehicleVINNumber: vehicleInfo?.vin || "",
      customerVehicleBrand: vehicleInfo?.maker || "",
      customerVehicleModel: vehicleInfo?.model || "",
      customerVehicleFirstRegistration: vehicleInfo?.ez ? new Date(vehicleInfo.ez) : "",
      customerType: "PRIVATE_CLIENT",
      customerFirstName: vehicleInfo?.firstname || "",
      customerLastName: vehicleInfo?.name1 || "",
      customerStreet: vehicleInfo?.address1 || "",
      customerCity: vehicleInfo.address2 ? getCityAndPostCode(vehicleInfo.address2).city : "",
      customerPostalCode: vehicleInfo.address2 ? getCityAndPostCode(vehicleInfo.address2).postCode : "",
    }),
    [vehicleInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewVehicleSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setDocInfo(data);
    router.push(paths.dashboard.damages.new);
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setIsApiLoading(true);
      const files = Array.from(e.target.files);
      const formData = new FormData();
      formData.append("doc", files[0]);
      await axios.post(`${API_ROOT()}scan_doc`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      })
        .then(async (res) => {
          setIsApiLoading(false);
          setVehicleInfo(res.data);
        })
        .catch(err => {
          setIsApiLoading(false);
        })
    }
  }, []);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, vehicleInfo]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('damage')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('damage'), href: paths.dashboard.damages.root },
          { name: t('vehicle_registration') },
        ]}
        sx={{
          mb: { xs: 2, md: 3 },
        }}
      />

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: { xs: 3, md: 5 } }}>
        <Tooltip title={t('upload_document_description')}>
          <LoadingButton
            component="label"
            color='primary'
            variant='contained'
            loading={isApiLoading}
            size="large"
            sx={{
              py: 1.5,
              px: 2,
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: 180,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Iconify icon="ion:camera-sharp" width={28} sx={{ mr: 1 }} />
            {t('upload_document')}
            <VisuallyHiddenInput type='file' onChange={handleFileUpload} />
          </LoadingButton>
        </Tooltip>
      </Stack>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" color="primary" mb={2}>
            {t('new_damage_with_vehicle_registration')}
          </Typography>
          <Label variant='soft' my={2} sx={{
            whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: { xs: 3, sm: 1 },
            color: 'warning.main',
            // bgcolor: (theme) => theme.palette.mode === 'dark' ? '#424242' : '#E0E0E0',
          }}>
            {t('upload_vehicle_document')}
          </Label>
          <Grid container spacing={3}>
            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerVehicleLicensePlate" label={t('license_plate')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.registrationNumber_img}`} />
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerVehicleVINNumber" label={t('vehicle_identification_number')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.vin_img}`} />
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerVehicleBrand" label={t('manufacturer')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.d1_img}`} />
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerVehicleModel" label={t('model')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.d3_img}`} />
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <DateForm />
            </Grid>


            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.ez_img}`} />
            </Grid>

            <Grid xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('customer_type')}</Typography>
                <RHFRadioGroup row spacing={4} name="customerType" options={CLIENT_TYPES} />
              </Stack>
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerFirstName" label={t('first_name')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.firstname_img}`} />
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerLastName" label={t('last_name')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.name1_img}`} />
            </Grid>

            <Grid xs={12} md={6} lg={6}>
              <RHFTextField name="customerStreet" label={t('street')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.address1_img}`} />
            </Grid>

            <Grid xs={6} md={3} lg={3}>
              <RHFTextField name="customerPostalCode" label={t('postal_code')} />
            </Grid>
            <Grid xs={6} md={3} lg={3}>
              <RHFTextField name="customerCity" label={t('city')} />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <Image src={`data:image/png;base64, ${vehicleInfo?.address2_img}`} />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ bgcolor: "success.main" }}>
              {t('confirm_damage')}
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Container >
  )
}

import { useState, useEffect, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MenuItem, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getCityAndPostCode } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { ScanVehicleDoc } from 'src/services/API/api';
import { useMainData } from 'src/providers/data-provider';
import { CLIENT_TYPES } from "src/constants/viewConstants";

import Iconify from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { RHFSelect, RHFTextField, RHFRadioGroup } from 'src/components/hook-form';

import { UserRole } from 'src/types/enums';

type Props = {
  getValues: any,
  setValue: any,
}

export default function VehicleDocScan({ getValues, setValue }: Props) {
  const { t } = useTranslate();
  const { control } = useFormContext();
  const { workshopInfo } = useMainData();
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [vehicleInfo, setVehicleInfo] = useState<Record<string, any>>({});
  const { user } = useAuthContext();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsApiLoading(true);
      if (acceptedFiles.length) {
        const file = acceptedFiles[0];
        const res = await ScanVehicleDoc(file);
        setIsApiLoading(false);
        if (res) {
          setVehicleInfo(res);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (Object.keys(vehicleInfo).length > 0) {
      setValue('vehicleData.customerVehicleLicensePlate', vehicleInfo.registrationNumber, { shouldValidate: true });
      setValue('vehicleData.customerVehicleVINNumber', vehicleInfo.vin, { shouldValidate: true });
      setValue('vehicleData.customerVehicleBrand', vehicleInfo.maker, { shouldValidate: true });
      setValue('vehicleData.customerVehicleModel', vehicleInfo.model, { shouldValidate: true });
      setValue('vehicleData.customerVehicleFirstRegistration', vehicleInfo.ez ? new Date(vehicleInfo.ez) : "", { shouldValidate: true });
      setValue('vehicleData.customerType', "PRIVATE_CLIENT", { shouldValidate: true });
      setValue('vehicleData.customerFirstName', vehicleInfo.firstname, { shouldValidate: true });
      setValue('vehicleData.customerLastName', vehicleInfo.name1, { shouldValidate: true });
      setValue('vehicleData.customerStreet', vehicleInfo.address1, { shouldValidate: true });
      setValue('vehicleData.customerCity', vehicleInfo.address2 ? getCityAndPostCode(vehicleInfo.address2).city : "", { shouldValidate: true });
      setValue('vehicleData.customerPostalCode', vehicleInfo.address2 ? getCityAndPostCode(vehicleInfo.address2).postCode : "", { shouldValidate: true });
    }
  }, [setValue, vehicleInfo]);

  useEffect(() => {
    if (user && user.role === UserRole.Owner) {
      setValue('workshopId', user.workshopIds[0], { shouldValidate: true });
    }
  }, [setValue, user]);

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('scan_vehicle_registration_document')}
      </Typography>
      <Box
        marginTop={3}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
        }}
      >
        <RHFSelect name="workshopId" label={t('workshops')}>
          {workshopInfo.map((workshop) => (
            <MenuItem key={workshop.workshopId} value={workshop.workshopId}>
              {workshop.name}
            </MenuItem>
          ))}
        </RHFSelect>
        <UploadBox
          disableMultiple
          disabled={isApiLoading}
          placeholder={
            isApiLoading ? (<CircularProgress />) : (
              <Stack spacing={0.5} alignItems="center">
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">{t('upload_your_files')}</Typography>
              </Stack>
            )
          }
          sx={{ flexGrow: 1, height: 'auto', py: 2.5, mb: 3, width: '100%' }}
          onDrop={handleDrop}
        />
      </Box>
      <Box
        marginTop={3}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        <RHFTextField name="vehicleData.customerVehicleLicensePlate" label={t('license_plate')} />
        <RHFTextField name="vehicleData.customerVehicleVINNumber" label={t('vehicle_identification_number')} />
        <RHFTextField name="vehicleData.customerVehicleBrand" label={t('manufacturer')} />
        <RHFTextField name="vehicleData.customerVehicleModel" label={t('model')} />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">{t('first_registration')}</Typography>
          <Controller
            name="vehicleData.customerVehicleFirstRegistration"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                {...field}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                }}
              />
            )}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2">{t('customer_type')}</Typography>
          <RHFRadioGroup row spacing={4} name="vehicleData.customerType" options={CLIENT_TYPES} />
        </Stack>
        <RHFTextField name="vehicleData.customerFirstName" label={t('first_name')} />
        <RHFTextField name="vehicleData.customerLastName" label={t('last_name')} />
        <RHFTextField name="vehicleData.customerStreet" label={t('street')} />
        <RHFTextField name="vehicleData.customerPostalCode" label={t('postal_code')} />
        <RHFTextField name="vehicleData.customerCity" label={t('city')} />
      </Box>
    </Card>
  )
}

import "yup-phone-lite";
import { useState, useEffect, useCallback } from "react";

import Box from '@mui/material/Box';
import Stack from "@mui/system/Stack";
import Card from '@mui/material/Card';
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";
import InputAdornment from '@mui/material/InputAdornment';

import { useTranslate } from 'src/locales';
import { carBrands } from "src/constants/carManufacturers";
import { banks, leasingCompanies } from "src/constants/leasingCompany";
import { decodeVIN, getCarModels } from "src/services/firebase/functions";
import { CLIENT_TYPES, YES_OR_NO_TYPES, VEHICLE_CATEGORIES, VEHICLE_OWNER_TYPES } from "src/constants/viewConstants";

import Label from "src/components/label";
import Iconify from "src/components/iconify/iconify";
import { useSnackbar } from 'src/components/snackbar';
import {
  RHFSelect,
  RHFTextField,
  RHFRadioGroup,
  RHFAutocomplete,
  RHFMuiPhoneField,
} from "src/components/hook-form";

import { QueryResultType } from "src/types/enums";

import DateForm from "./vehicle-registration-date";

type Props = {
  watch: any,
  setValue: any,
}
// ----------------------------------------------------------------------

export default function DamageEditInjuredPartyForm({ watch, setValue }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [carModels, setCarModels] = useState<Record<string, any>[]>([]);

  const vehicleBrand = watch('customerVehicleBrand');
  const vehicleVINNumber = watch('customerVehicleVINNumber');
  const vehicleOwnerType = watch('customerVehicleOwnerType');
  const watchCustomerType = watch('customerType');

  useEffect(() => {
    if (vehicleBrand) {
      getCarModelsFromBrand(vehicleBrand);
    }
  }, [vehicleBrand]);

  const getCarModelsFromBrand = async (brand: string) => {
    await getCarModels({ brand })
      .then((res: any) => {
        if (res.data.result === QueryResultType.RESULT_SUCCESS) {
          const result = res.data.data;
          if (result) {
            setCarModels(res.data.data);
          } else {
            setCarModels([]);
          }
        }
      })
      .catch(error => {
        console.log("error===", error);
      })
  }

  const handleVIN = useCallback(async () => {
    if (vehicleVINNumber) {
      await decodeVIN({ vin: vehicleVINNumber })
        .then((res: any) => {
          if (res.data.result === QueryResultType.RESULT_SUCCESS) {
            const vinRes: Record<string, any> = res.data.data;
            let make = '';
            let model = '';
            if (vinRes.decode) {
              vinRes.decode.forEach((item: Record<string, any>) => {
                if (item.label === "Make") {
                  make = item.value;
                } else if (item.label === "Model") {
                  model = item.value;
                }
              });
              setValue('customerVehicleBrand', make);
              setValue('customerVehicleModel', model);
            } else {
              setValue('customerVehicleBrand', "");
              setValue('customerVehicleModel', "");
              setCarModels([]);
              enqueueSnackbar(t('vin_is_not_valid'), {
                variant: 'error',
              });
            }
          }
        })
        .catch((err) => {
          console.log("===Error===", err);
        });
    }
  }, [enqueueSnackbar, setValue, t, vehicleVINNumber]);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" mb={2}>
        {t('injured_party')}
      </Typography>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('customer')}
            </Typography>
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('customer_type')}</Typography>
                <RHFRadioGroup row spacing={4} name="customerType" options={CLIENT_TYPES} />
              </Stack>
            </Box>
            <Divider sx={{ my: 3 }} />
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
              <RHFTextField name="customerFirstName" label={t('first_name')} error helperText={t('firstName_is_required')} />
              <RHFTextField name="customerLastName" label={t('last_name')} error={watchCustomerType === "PRIVATE_CLIENT"} helperText={watchCustomerType === "PRIVATE_CLIENT" ? t('lastName_is_required') : ""} />
              <RHFTextField name="customerEmail" label={t('email')} error helperText={t('email_is_required')} />
            </Box>
            <Label variant='soft' color='info' mt={2} sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', height: "auto", p: 1, my: "1rem" }}>
              {t('alert_input_phone_or_whatsapp')}
            </Label>
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
              <RHFMuiPhoneField name="customerWhatsapp" label={t('whatsapp')} isWhatsapp />
              <RHFMuiPhoneField name="customerPhone" label={t('mobile')} error helperText={t('phone_number_is_not_valid')} />
              <RHFTextField name="customerTelephone" label={t('telephone')} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField name="customerStreet" label={t('street')} error helperText={t('street_is_required')} />
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="customerPostalCode" label={t('postal_code')} error helperText={t('postal_code_is_required')} />
                <RHFTextField name="customerCity" label={t('city')} error helperText={t('city_is_required')} />
              </Box>
              <RHFTextField name="customerCountry" label={t('country')} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="customerNumber" label={t('customer_number')} />
              <RHFTextField name="customerLandline" label={t('landline_number')} />
              <RHFTextField name="customerContactPerson" label={t('contact_person')} />
              <RHFTextField name="customerDriverLicenseNumber" label={t('driver_license_number')} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="injuredPartyInformation" multiline rows={3} label={t('reachability')} />
              <RHFTextField name="damagingNote" multiline rows={3} label={t('more_comments')} />
              <RHFTextField name="customerBankHolder" label={t('holder')} />
              <RHFTextField name="customerBankIBAN" label={t('IBAN')} />
              <RHFTextField name="customerBank" label={t('Bank')} />
              <RHFTextField name="customerBankBIC" label={t('BIC')} />
            </Box>
          </Card>
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('vehicle_data')}
            </Typography>
            <Box
              marginTop={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField name="customerVehicleLicensePlate" label={t('license_plate')} error helperText={t('license_plate_number_is_required')} />
              <RHFTextField
                name="customerVehicleVINNumber"
                label={t('vehicle_identification_number')}
                error
                // helperText={t('VIN_is_required')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="tabler:scan" width={24} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ marginRight: "-14px" }}>
                      <Button variant="contained" color="primary" size="large" onClick={handleVIN}>
                        {t('generate')}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('tax_deduction')}</Typography>
                <RHFRadioGroup row spacing={4} name="customerTaxDeduction" options={YES_OR_NO_TYPES} />
              </Stack>
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
              <RHFAutocomplete
                name="customerVehicleBrand"
                placeholder={t('manufacturer')}
                helperText={t('please_select_car_brand')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === null || value === "" || option === value
                }
                options={carBrands.map((option) => option)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const name = carBrands.filter(
                    (brand) => brand === option
                  )[0];

                  if (!name) {
                    return null;
                  }

                  return (
                    <li {...props} key={name}>
                      {name}
                    </li>
                  );
                }}
              />
              <RHFAutocomplete
                name="customerVehicleModel"
                placeholder={t('model')}
                helperText={t('please_select_car_model')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={carModels.map((option) => option.name)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { id, name } = carModels.filter(
                    (carModel) => carModel.name === option
                  )[0];

                  if (!name) {
                    return null;
                  }

                  return (
                    <li {...props} key={id}>
                      {name}
                    </li>
                  );
                }}
              />
            </Box>
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
              <RHFSelect name="customerVehicleCategory" label={t('vehicle_category')}>
                {VEHICLE_CATEGORIES.map((owner) => (
                  <MenuItem key={owner.value} value={owner.value}>
                    {owner.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <DateForm />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('legal_vehicle_owner')}</Typography>
              <RHFRadioGroup row spacing={4} name="customerVehicleOwnerType" options={VEHICLE_OWNER_TYPES} />
            </Stack>

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
              <RHFAutocomplete
                name="customerVehicleLeasingCompany"
                placeholder={t('leasing_company')}
                disabled={vehicleOwnerType !== 'leasingCompanyOwner'}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={leasingCompanies.map((option) => option.name)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { name } = leasingCompanies.filter(
                    (company) => company.name === option
                  )[0];

                  if (!name) {
                    return null;
                  }

                  return (
                    <li {...props} key={name}>
                      {name}
                    </li>
                  );
                }}
              />
            </Box>

            {vehicleOwnerType === 'bank' && (
              <Box
                marginTop={2}
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="customerVehicleOwnerBank"
                  placeholder={t('bank')}
                  isOptionEqualToValue={(option, value) =>
                    value === undefined || value === "" || option === value
                  }
                  options={banks.map((option) => option.name)}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => {
                    const { name } = banks.filter(
                      (company) => company.name === option
                    )[0];

                    if (!name) {
                      return null;
                    }

                    return (
                      <li {...props} key={name}>
                        {name}
                      </li>
                    );
                  }}
                />
              </Box>
            )}

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
              <RHFTextField
                name="customerVehicleExcess"
                label={t('excess')}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="material-symbols:euro" width={24} />
                    </InputAdornment>
                  ),
                }}
              />
              <RHFTextField
                name="customerVehicleMileage"
                label={t('mileage')}
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      km
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Card >
  );
}

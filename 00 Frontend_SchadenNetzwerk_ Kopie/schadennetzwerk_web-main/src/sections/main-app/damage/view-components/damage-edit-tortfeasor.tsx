import "yup-phone-lite";

import Box from '@mui/material/Box';
import Stack from "@mui/system/Stack";
import Card from '@mui/material/Card';
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";

import { useTranslate } from 'src/locales';
import { insurances } from "src/constants/insurances";
import { carBrands } from "src/constants/carManufacturers";
import { SALUTATIONS, VEHICLE_CATEGORIES } from "src/constants/viewConstants";

import {
  RHFSelect,
  RHFTextField,
  RHFRadioGroup,
  RHFAutocomplete,
  RHFMuiPhoneField,
} from "src/components/hook-form";


// ----------------------------------------------------------------------

type Props = {
  watch: any;
}

export default function DamageEditTortfeasorForm({ watch }: Props) {
  const { t } = useTranslate();

  const watchTortfeasorSalutation = watch('tortfeasorSalutation');

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" mb={2}>
        {t('tortfeasor')}
      </Typography>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('Schädiger / Unfallgegner')}
            </Typography>

            <Stack spacing={1}>
              <RHFRadioGroup row spacing={4} name="tortfeasorSalutation" options={SALUTATIONS} />
            </Stack>

            <Box
              rowGap={3}
              marginTop={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="tortfeasorFirstName" label={t('first_name')} error helperText={t('firstName_is_required')} />
              <RHFTextField name="tortfeasorLastName" label={t('last_name')} error={watchTortfeasorSalutation !== "COMPANY"} helperText={watchTortfeasorSalutation !== "COMPANY" ? t('lastName_is_required') : ''} />
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
              <RHFTextField name="tortfeasorStreet" label={t('street')} />
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="tortfeasorPostalCode" label={t('postal_code')} />
                <RHFTextField name="tortfeasorCity" label={t('city')} />
              </Box>
              <RHFTextField name="tortfeasorCountry" label={t('country')} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField name="tortfeasorEmail" label={t('email')} />
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              marginTop={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="tortfeasorLandline" label={t('landline_number')} />
              <RHFMuiPhoneField name="tortfeasorPhone" label={t('mobile')} />
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
              <RHFTextField name="tortfeasorVehicleLicensePlate" label={t('license_plate')} error helperText={t('license_plate_number_is_required')} />
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
              <RHFSelect name="tortfeasorVehicleCategory" label={t('vehicle_category')}>
                {VEHICLE_CATEGORIES.map((owner) => (
                  <MenuItem key={owner.value} value={owner.value}>
                    {owner.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFAutocomplete
                name="tortfeasorVehicleBrand"
                placeholder={t('manufacturer')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
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
              <RHFTextField multiline rows={3} name="tortfeasorInformation" label={t('notes_on_the_perpetrator')} />
            </Box>
          </Card>
          <Card sx={{ p: 3, mt: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('tortfeasor_insurance')}
              <Typography sx={{ color: 'warning.light' }}>
                &nbsp;({t('select_insurance_to_speed_up')})
              </Typography>
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
              <RHFAutocomplete
                name="tortfeasorInsuranceName"
                placeholder={t('insurance')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={insurances.map((option) => option.name)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { name } = insurances.filter(
                    (insurance) => insurance.name === option
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
              <RHFTextField name="tortfeasorInsuranceNumber" label={t('insurance_certificate_number')} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Card >
  );
}

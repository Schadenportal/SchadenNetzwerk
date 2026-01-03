import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { YES_OR_NO_TYPES } from 'src/constants/viewConstants';

import { RHFSelect, RHFSwitch } from 'src/components/hook-form';

import { VehicleConditionTypes } from 'src/types/enums';

export default function VehicleCondition() {
  const { t } = useTranslate();

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('vehicle_condition')}
      </Typography>
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
        <RHFSelect name="vehicleCondition.general" label={t('general')}>
          {Object.values(VehicleConditionTypes).map((value) => (
            <MenuItem key={value} value={value}>
              {t(value)}
            </MenuItem>
          ))}
        </RHFSelect>
        <RHFSelect name="vehicleCondition.bodywork" label={t('bodywork')}>
          {Object.values(VehicleConditionTypes).map((value) => (
            <MenuItem key={value} value={value}>
              {t(value)}
            </MenuItem>
          ))}
        </RHFSelect>
        <RHFSelect name="vehicleCondition.paint" label={t('paint')}>
          {Object.values(VehicleConditionTypes).map((value) => (
            <MenuItem key={value} value={value}>
              {t(value)}
            </MenuItem>
          ))}
        </RHFSelect>
        <RHFSelect name="vehicleCondition.interior" label={t('cost_interior')}>
          {Object.values(VehicleConditionTypes).map((value) => (
            <MenuItem key={value} value={value}>
              {t(value)}
            </MenuItem>
          ))}
        </RHFSelect>
      </Box>
      <Typography variant='subtitle2' my={3}>
        {t('vehicle_condition_warning')}
      </Typography>
      <Box
        rowGap={3}
        marginTop={-1}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        <RHFSelect name="vehicleCondition.repairedPreviousDamage" label={t('repaired_previous_damage')}>
          {YES_OR_NO_TYPES.map((item) => (
            <MenuItem key={item.label} value={item.value}>
              {t(item.label)}
            </MenuItem>
          ))}
        </RHFSelect>
        <RHFSelect name="vehicleCondition.existingOldDamage" label={t('existing_old_damage')}>
          {YES_OR_NO_TYPES.map((item) => (
            <MenuItem key={item.label} value={item.value}>
              {t(item.label)}
            </MenuItem>
          ))}
        </RHFSelect>
      </Box>

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
        <Stack direction="row" spacing={2}>
          <RHFSwitch name="vehicleCondition.roadworthy" label={t('roadworthy')} />
          <RHFSwitch name="vehicleCondition.disassembled" label={t('disassembled')} />
          <RHFSwitch name="vehicleCondition.roadSafe" label={t('roadSafe')} />
        </Stack>
      </Box>
    </Card>
  )
}

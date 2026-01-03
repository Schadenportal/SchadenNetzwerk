import React, { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { IDamageTableFilters } from 'src/types/damage';

const DamageStatus = [
  { value: "open", label: "offen" },
  { value: "closed", label: "geschlossen" }
]

const repairApprovalStatus = [
  { value: "approved", label: "approved" },
  { value: "not_approved", label: "not_approved" }
]

// ----------------------------------------------------------------------

type Props = {
  filters: IDamageTableFilters;
  onFilters: (name: string, value: string) => void;
};

export default function DamageTableToolbar({
  filters,
  onFilters,
}: Props) {
  const { t } = useTranslate();

  const handleFilterOrderStatus = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('orderStatus', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRepairApproval = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('repairApprovalStatus', event.target.value);
    },
    [onFilters]
  );

  const handleFilterDamageNumber = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('damageNumber', event.target.value);
    },
    [onFilters]
  );

  const handleFilterServiceAdviser = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('serviceAdviser', event.target.value);
    },
    [onFilters]
  );

  const handleFilterLicensePlate = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('licensePlate', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCustomer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('customerName', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.damageNumber}
          onChange={handleFilterDamageNumber}
          placeholder={t('damage_number')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.serviceAdviser}
          onChange={handleFilterServiceAdviser}
          placeholder={t('service_adviser')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.customerName}
          onChange={handleFilterCustomer}
          placeholder={t('customer')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.licensePlate}
          onChange={handleFilterLicensePlate}
          placeholder={t('license_plate')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>{t('order_status')}</InputLabel>
          <Select
            value={filters.orderStatus}
            onChange={handleFilterOrderStatus}
            input={<OutlinedInput label={t('order_status')} />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {DamageStatus.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.value)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>{t('repair_approval')}</InputLabel>
          <Select
            value={filters.repairApprovalStatus}
            onChange={handleFilterRepairApproval}
            input={<OutlinedInput label={t('repair_confirmation')} />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {repairApprovalStatus.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.value)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}

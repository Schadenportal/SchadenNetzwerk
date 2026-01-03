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

import { IServiceProviderTableFilters } from 'src/types/service-providers';

import { SERVICE_PROVIDER_OPTIONS } from './service-provider-edit-form';


// ----------------------------------------------------------------------

type Props = {
  filters: IServiceProviderTableFilters;
  onFilters: (name: string, value: string) => void;
};

export default function ServiceProviderTableToolbar({
  filters,
  onFilters,
}: Props) {
  const { t } = useTranslate();

  const handleFilterServiceType = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('serviceType', event.target.value);
    },
    [onFilters]
  );

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterEmail = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('email', event.target.value);
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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>{t('provider_type')}</InputLabel>
          <Select
            value={filters.serviceType}
            onChange={handleFilterServiceType}
            input={<OutlinedInput label={t('provider_type')} />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {SERVICE_PROVIDER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder={t('name')}
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
          value={filters.email}
          onChange={handleFilterEmail}
          placeholder={t('email')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}

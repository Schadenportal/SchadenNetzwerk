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

import { ServiceTaskStatusTypes } from 'src/types/enums';
import { IServiceAssignmentFilters } from 'src/types/service-providers';


// ----------------------------------------------------------------------

type Props = {
  filters: IServiceAssignmentFilters;
  onFilters: (name: string, value: string) => void;
};

export default function ServiceAssignmentSearchBar({
  filters,
  onFilters,
}: Props) {
  const { t } = useTranslate();

  const handleFilterServiceType = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('serviceStatus', event.target.value);
    },
    [onFilters]
  );

  const handleFilterOrderNumber = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('orderNumber', event.target.value);
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
        py: 2.5
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.orderNumber}
          onChange={handleFilterOrderNumber}
          placeholder={t('order_number')}
          sx={{
            '& .MuiInputLabel-root': {
              color: (theme) => theme.palette.text.tableText,
            },
            '& .MuiOutlinedInput-input': {
              color: (theme) => theme.palette.text.tableText,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
              },
              '&:hover fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
              },
              '&.Mui-focused fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: (theme) => theme.palette.text.tableText,
              opacity: 0.7,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: (theme) => theme.palette.text.tableText }}
                />
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
            '& .MuiInputLabel-root': {
              color: (theme) => theme.palette.text.tableText,
            },
            '& .MuiOutlinedInput-input': {
              color: (theme) => theme.palette.text.tableText,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
              },
              '&:hover fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
              },
              '&.Mui-focused fieldset': {
                borderColor: (theme) => theme.palette.text.tableText,
              },
            },
            '& .MuiSelect-icon': {
              color: (theme) => theme.palette.text.tableText,
            },
            '& .MuiInputLabel-shrink': {
              color: (theme) => theme.palette.text.tableText,
              // focused label color
              '&.Mui-focused': {
                color: (theme) => theme.palette.text.tableText,
              },
            }
          }}
        >
          <InputLabel>{t('provider_type')}</InputLabel>
          <Select
            value={filters.serviceStatus}
            onChange={handleFilterServiceType}
            input={<OutlinedInput label={t('order_status')} />}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 240,
                  '& .MuiMenuItem-root': {
                    color: (theme) => theme.palette.text.primary,
                  },
                },
              },
            }}
          >
            {Object.entries(ServiceTaskStatusTypes).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {t(`${value}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}

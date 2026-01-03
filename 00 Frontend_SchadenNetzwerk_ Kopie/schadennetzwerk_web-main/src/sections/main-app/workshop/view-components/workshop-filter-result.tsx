import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { IWorkshopTableFilters } from 'src/types/workshop';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IWorkshopTableFilters;
  onFilters: (name: string, value: string) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function WorkshopFilterResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}: Props) {

  const { t } = useTranslate();

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          {t('results_found')}
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {t('clear')}
        </Button>
      </Stack>
    </Stack>
  );
}

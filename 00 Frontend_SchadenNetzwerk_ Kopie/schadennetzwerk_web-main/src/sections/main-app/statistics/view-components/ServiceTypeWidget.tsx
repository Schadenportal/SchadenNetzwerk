import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import Card, { CardProps } from '@mui/material/Card';

import { euro, fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  icon: React.ReactElement;
  width: number;
  height: number;
  percent?: string;
  isCurrency?: boolean;
}

export default function ServiceTypeWidget({ title, total, icon, width, height, percent, isCurrency, sx, ...other }: Props) {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100%',
        p: 2,
        pl: 3,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        ...sx,
      }}
      {...other}
    >
      <Box>
        <Box sx={{ mb: 1, typography: 'h3' }}>{isCurrency ? euro.format(total) : fShortenNumber(total)}</Box>
        <Box sx={{ color: 'text.secondary', typography: 'subtitle2' }}>
          {title}
          {percent && (
            <Typography color='white' variant='h6' >
              {percent}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width,
          height,
          lineHeight: 0,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

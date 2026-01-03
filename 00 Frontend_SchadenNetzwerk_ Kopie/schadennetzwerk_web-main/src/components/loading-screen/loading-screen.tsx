import Box, { BoxProps } from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

export default function LoadingScreen({ sx, ...other }: BoxProps) {
  return (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    >
      <LinearProgress sx={{
        width: 1, maxWidth: 360,
        color: (theme) => theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,
      }} />
    </Box>
  );
}

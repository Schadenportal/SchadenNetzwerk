import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack, { StackProps } from '@mui/material/Stack';

// ----------------------------------------------------------------------

type EmptyContentProps = StackProps & {
  title?: string;
  imgUrl?: string;
  filled?: boolean;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyContent({
  title,
  imgUrl,
  action,
  filled,
  description,
  sx,
  ...other
}: EmptyContentProps) {
  return (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        px: 3,
        height: 1,
        ...(filled && {
          borderRadius: 2,
          bgcolor: (theme) => theme.palette.mode === 'light'
            ? alpha(theme.palette.common.white, 0.8) // Light background for light mode
            : alpha(theme.palette.grey[100], 0.1), // Slightly darker for dark mode
          border: (theme) => `dashed 2px ${theme.palette.mode === 'light'
            ? alpha(theme.palette.grey[500], 0.3)
            : alpha(theme.palette.grey[400], 0.2)}`,
          backdropFilter: 'blur(8px)', // Add blur effect for better visibility
        }),
        ...sx,
      }}
      {...other}
    >
      <Box
        component="img"
        alt="empty content"
        src={imgUrl || '/assets/icons/empty/ic_content.svg'}
        sx={{
          width: 1,
          maxWidth: 160,
          opacity: 0.8, // Slightly reduce opacity for better integration
        }}
      />

      {title && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            mt: 1,
            color: (theme) => theme.palette.mode === 'light'
              ? theme.palette.grey[600]
              : theme.palette.grey[600],
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      )}

      {description && (
        <Typography
          variant="caption"
          sx={{
            mt: 1,
            color: (theme) => theme.palette.mode === 'light'
              ? theme.palette.grey[500]
              : theme.palette.grey[400],
            textAlign: 'center'
          }}
        >
          {description}
        </Typography>
      )}

      {action && action}
    </Stack>
  );
}

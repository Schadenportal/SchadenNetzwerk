import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack, { StackProps } from '@mui/material/Stack';
import {
  alpha,
  useTheme
} from '@mui/material/styles';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  title?: string;
  description?: string;
  descriptionBold?: string;
  greeting?: string;
  img?: React.ReactNode;
  action?: React.ReactNode;
}

export default function Welcome({ title, description, descriptionBold, greeting, action, img, ...other }: Props) {
  const theme = useTheme();

  return (
    <Stack
      flexDirection="column"
      sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(0, 91, 159, 0.08) 0%, rgba(0, 114, 188, 0.06) 25%, rgba(0, 91, 159, 0.08) 50%, rgba(0, 114, 188, 0.06) 75%, rgba(0, 91, 159, 0.08) 100%)'
          : 'linear-gradient(135deg, #f5f4f5 0%, #e8e6e7 25%, #f0eeef 50%, #e8e6e7 75%, #f5f4f5 100%)',
        borderRadius: 2,
        position: 'relative',
        color: 'text.primary',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? alpha('#E0E0E0', 0.5)
          : alpha(theme.palette.grey[400], 0.7),
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
          : '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.97) 30%, rgba(245, 245, 245, 0.92) 70%, rgba(240, 240, 240, 0.95) 100%)'
            : 'transparent', // Remove white overlay for light mode
          borderRadius: 'inherit',
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 20%, rgba(0, 91, 159, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 114, 188, 0.04) 0%, transparent 50%)'
            : 'transparent', // Remove white overlay for light mode
          borderRadius: 'inherit',
          zIndex: -1,
        }
      }}
      {...other}
    >
      <Stack
        flexDirection={{ xs: 'column', md: 'row' }}
        flexGrow={1}
        justifyContent="center"
        alignItems={{ xs: 'center' }}
        sx={{
          p: {
            xs: theme.spacing(5, 3, 0, 3),
            md: theme.spacing(5, 5, 0),
          },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Box sx={{ order: { xs: 2, md: 1 }, maxWidth: 720 }}>
          {title && (
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                lineHeight: 1.2,
                mb: 3,
                color: theme.palette.mode === 'dark' ? '#003478' : 'grey.800',
                textShadow: theme.palette.mode === 'dark'
                  ? '0 2px 4px rgba(0, 0, 0, 0.4)'
                  : '0 1px 3px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.2)',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #003478 0%, #002D5A 30%, #00467A 60%, #003478 100%)'
                  : 'linear-gradient(135deg, #003478 0%, #002D5A 30%, #00467A 60%, #003478 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              {title}
            </Typography>
          )}
          <Typography
            variant="body2"
            component="span"
            sx={{
              opacity: 1,
              whiteSpace: 'pre-line',
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'grey.700',
              textShadow: theme.palette.mode === 'dark'
                ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                : '0 1px 3px rgba(255, 255, 255, 0.9), 0 0.5px 1px rgba(0, 0, 0, 0.15)',
              fontSize: '1rem',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            {description}
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: theme.palette.mode === 'dark' ? '#003478' : '#00A651',
                textShadow: theme.palette.mode === 'dark'
                  ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                  : '0 1px 3px rgba(255, 255, 255, 0.9), 0 0.5px 1px rgba(0, 166, 81, 0.2)'
              }}
            >
              &nbsp; {descriptionBold}
            </Typography>
            <Typography
              variant='body2'
              mt={2}
              sx={{
                fontWeight: "600",
                color: theme.palette.mode === 'dark' ? 'text.secondary' : 'grey.600',
                textShadow: theme.palette.mode === 'dark'
                  ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                  : '0 1px 2px rgba(255, 255, 255, 0.9), 0 0.5px 1px rgba(0, 0, 0, 0.1)',
                lineHeight: 1.5,
              }}
            >
              {greeting}
            </Typography>
          </Typography>
        </Box>

        {
          img && (
            <Stack
              component="span"
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{
                p: { xs: 5, md: 3 },
                maxWidth: 360,
                mx: { xs: 'auto', md: 0 },  // Auto center on xs, remove auto margin on md+
                ml: { md: 'auto' },         // Push to right on md+
                order: { xs: 1, md: 2 },
                alignItems: { md: 'flex-start' },  // Align logo to top on desktop
                pt: { md: 0 }  // Remove top padding on desktop to align with text start
              }}
            >
              {img}
            </Stack>
          )
        }
      </Stack>
      <Box sx={{ p: "0 32px 32px" }}>
        {action && action}
      </Box>
    </Stack >
  );
}

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { alpha } from '@mui/material/styles';

import { useRouter, usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useAuthContext();

  const router = useRouter();
  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Box
      sx={{
        height: 1,
        background: (theme) => theme.palette.mode === 'dark'
          ? theme.palette.background.paper // Use palette background for dark mode
          : theme.palette.background.default, // Use palette background for light mode
        backdropFilter: (theme) => theme.palette.mode === 'dark' ? 'blur(16px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        borderRight: (theme) => theme.palette.mode === 'light'
          ? `2px solid ${theme.palette.divider}`
          : `2px solid ${theme.palette.divider}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 1,
          height: '100%',
          background: 'transparent',
          boxShadow: 'none',
          zIndex: 1
        }
      }}
    >
      <Scrollbar
        sx={{
          height: 1,
          position: 'relative',
          zIndex: 2,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo Section */}
        <Box
          onClick={() => router.push('/')}
          sx={{
            p: { xs: 2, sm: 3 },
            pb: 2,
            mb: 3,
            position: 'relative',
            cursor: 'pointer',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 16,
              right: 16,
              height: 1,
            }
          }}
        >
          <Logo
            sx={{
              mx: 'auto',
              display: 'block',
              filter: (theme) => theme.palette.mode === 'dark' ? 'brightness(0.95) contrast(1.05)' : 'brightness(1) contrast(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.02) translateY(-1px)',
                filter: (theme) => theme.palette.mode === 'dark' ? 'brightness(1.05) contrast(1.1)' : 'brightness(1.02) contrast(1.05)',
              }
            }}
          />
        </Box>

        {/* Navigation Section */}
        <Box sx={{ px: 2, flex: 1 }}>
          <NavSectionVertical
            data={navData}
            slotProps={{
              currentRole: user?.role,
            }}
            sx={{
              '& .nav-list': {
                gap: 0.5,
              },
              '& .nav-item': {
                borderRadius: 1.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'transparent',
                  transition: 'all 0.3s ease',
                  zIndex: 0,
                },
                '&:hover': {
                  transform: 'translateX(4px)',
                  '&::before': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(0, 52, 120, 0.08) 0%, rgba(0, 45, 90, 0.06) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 166, 81, 0.04) 0%, rgba(0, 150, 57, 0.03) 100%)',
                  },
                  '& .nav-item-text': {
                    color: (theme) => theme.palette.mode === 'dark' ? '#003478' : '#00A651',
                    textShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 0 6px rgba(0, 52, 120, 0.2)'
                      : '0 1px 2px rgba(0, 166, 81, 0.15)',
                  },
                  '& .nav-item-icon': {
                    transform: 'scale(1.05)',
                    filter: (theme) => theme.palette.mode === 'dark'
                      ? 'drop-shadow(0 0 3px rgba(0, 52, 120, 0.3))'
                      : 'drop-shadow(0 1px 2px rgba(0, 166, 81, 0.2))',
                  }
                },
                '&.active': {
                  '&::before': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(0, 52, 120, 0.15) 0%, rgba(0, 45, 90, 0.12) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 166, 81, 0.08) 0%, rgba(0, 150, 57, 0.06) 100%)',
                  },
                  '& .nav-item-text': {
                    color: (theme) => theme.palette.mode === 'dark' ? '#003478' : '#00A651',
                    fontWeight: 600,
                    textShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 0 8px rgba(0, 52, 120, 0.4)'
                      : '0 2px 4px rgba(0, 166, 81, 0.25)',
                  },
                  '& .nav-item-icon': {
                    color: (theme) => theme.palette.mode === 'dark' ? '#003478' : '#00A651',
                    filter: (theme) => theme.palette.mode === 'dark'
                      ? 'drop-shadow(0 0 4px rgba(0, 52, 120, 0.5))'
                      : 'drop-shadow(0 2px 4px rgba(0, 166, 81, 0.3))',
                  }
                }
              },
              '& .nav-item-text': {
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.025em',
              },
              '& .nav-item-icon': {
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '& .nav-subheader': {
                color: (theme) => theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.5)
                  : alpha(theme.palette.common.black, 0.5),
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                mb: 1,
                mt: 2,
                px: 2,
                textShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 1px 2px rgba(0, 0, 0, 0.4)'
                  : '0 1px 2px rgba(255, 255, 255, 0.6)',
              }
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

      </Scrollbar>
    </Box>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? `
                2px 0 20px rgba(0, 52, 120, 0.4),
                8px 0 40px rgba(0, 0, 0, 0.3),
                inset -1px 0 0 rgba(0, 52, 120, 0.2)
              `
              : 'none',
            zIndex: (theme) => theme.zIndex.drawer,
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            overflow: 'hidden',
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? `
                  8px 0 32px rgba(0, 52, 120, 0.5),
                  16px 0 64px rgba(0, 0, 0, 0.4)
                `
                : '8px 0 32px rgba(0, 0, 0, 0.08)',
              border: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(0, 52, 120, 0.4)'
                : 'none',
              background: 'transparent',
              borderRadius: (theme) => theme.palette.mode === 'dark' ? '0 16px 16px 0' : '0',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

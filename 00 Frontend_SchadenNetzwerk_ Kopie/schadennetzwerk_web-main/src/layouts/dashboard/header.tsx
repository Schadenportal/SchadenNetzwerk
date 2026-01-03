import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import { NAV, HEADER } from '../config-layout';
import SettingsButton from '../common/settings-button';
import AccountPopover from '../common/account-popover';
import LanguagePopover from '../common/language-popover';
import NotificationsPopover from '../common/notifications-popover';

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {/* Search Bar */}
        <InputBase
          placeholder="Search..."
          startAdornment={
            <IconButton size="small" sx={{ mr: 1 }}>
              <Iconify icon="eva:search-fill" width={20} />
            </IconButton>
          }
          sx={{
            bgcolor: alpha(theme.palette.grey[500], 0.12),
            borderRadius: 1,
            px: 2,
            py: 0.5,
            mr: 1,
            minWidth: 200,
            display: { xs: 'none', sm: 'flex' },
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[500], 0.16),
            },
            '&.Mui-focused': {
              bgcolor: alpha(theme.palette.grey[500], 0.16),
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
            color: theme.palette.text.tableText,
          }}
        />

        <LanguagePopover />

        <NotificationsPopover />

        <SettingsButton />

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        bgcolor: 'background.default',
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

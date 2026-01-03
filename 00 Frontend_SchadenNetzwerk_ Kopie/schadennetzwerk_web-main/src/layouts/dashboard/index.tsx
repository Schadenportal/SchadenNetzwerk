import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { updateUserStatus } from 'src/services/firebase/functions';

import { useSettingsContext } from 'src/components/settings';

import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  const changeUserStatus = useCallback(async (status: boolean) => {
    await updateUserStatus({ isOnline: status })
  }, []);

  useEffect(() => {
    changeUserStatus(true);
    const handleVisibilityChange = () => {
      changeUserStatus(document.visibilityState === 'visible');
    };
    const handleBeforeUnload = () => {
      changeUserStatus(false);
    }
    const handleOnLoad = () => {
      changeUserStatus(true);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    window.addEventListener('load', handleOnLoad);
    // document.addEventListener('load', handleOnLoad);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      // document.removeEventListener('load', handleOnLoad);
      window.removeEventListener('load', handleOnLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [changeUserStatus]);

  if (isHorizontal) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main>{children}</Main>
      </>
    );
  }

  if (isMini) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}

          <Main>{children}</Main>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header onOpenNav={nav.onTrue} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {renderNavVertical}

        <Main>{children}</Main>
      </Box>
    </>
  );
}

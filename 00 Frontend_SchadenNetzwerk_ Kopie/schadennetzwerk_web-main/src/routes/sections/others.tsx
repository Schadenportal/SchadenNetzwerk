import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import CompactLayout from 'src/layouts/compact';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const Page500 = lazy(() => import('src/pages/500'));
const Page403 = lazy(() => import('src/pages/403'));
const Page404 = lazy(() => import('src/pages/404'));
const ComingSoonPage = lazy(() => import('src/pages/coming-soon'));
const MaintenancePage = lazy(() => import('src/pages/maintenance'));
const DamageOverviewPage = lazy(() => import('src/pages/no-auth/damage-overview'));

// ----------------------------------------------------------------------

export const otherRoutes = [
  {
    element: (
      <CompactLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </CompactLayout>
    ),
    children: [
      { path: 'coming-soon', element: <ComingSoonPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      { path: '500', element: <Page500 /> },
      { path: '404', element: <Page404 /> },
      { path: '403', element: <Page403 /> },
      { path: 'damage-overview/:damageId', element: <DamageOverviewPage /> },
    ],
  },
];

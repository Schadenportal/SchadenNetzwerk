import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import { ServiceProviderGuard } from 'src/auth/guard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------
// MAIN APP
const ServiceAssignmentListPage = lazy(() => import('src/pages/service-assignments/list'));
const ServiceAssignmentDamageDetailPage = lazy(() => import('src/pages/service-assignments/details'));
// ----------------------------------------------------------------------

export const serviceAssignmentsRoutes = [
  {
    path: 'service_assignment',
    element: (
      <ServiceProviderGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ServiceProviderGuard>
    ),
    children: [
      { element: <ServiceAssignmentListPage />, index: true },
      { path: ':id/detail', element: <ServiceAssignmentDamageDetailPage /> },
    ],
  },
];

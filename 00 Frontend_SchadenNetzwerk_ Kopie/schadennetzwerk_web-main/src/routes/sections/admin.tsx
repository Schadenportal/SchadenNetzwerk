import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import AdminGuard from 'src/auth/guard/admin-guard';
import DashboardLayout from 'src/layouts/dashboard';
import AppraiserInfoPage from 'src/pages/appraiser-info';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------
// MAIN APP
const SalesmanListPage = lazy(() => import('src/pages/salesman/list'));
const SalesmanEditPage = lazy(() => import('src/pages/salesman/edit'));
const CustomerListPage = lazy(() => import('src/pages/service-adviser/list'));
const CustomerEditPage = lazy(() => import('src/pages/service-adviser/edit'));
const WorkshopListPage = lazy(() => import('src/pages/workshops/list'));
const WorkshopEditPage = lazy(() => import('src/pages/workshops/edit'));
const AgentListPage = lazy(() => import('src/pages/agent/list'));
const AgentEditPage = lazy(() => import('src/pages/agent/edit'));
const UsersListPage = lazy(() => import('src/pages/users/list'));
// ----------------------------------------------------------------------

export const adminRoutes = [
  {
    path: 'admin',
    element: (
      <AdminGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AdminGuard>
    ),
    children: [
      { element: <SalesmanListPage />, index: true },
      {
        path: 'users',
        children: [
          { element: <UsersListPage />, index: true },
        ]
      },
      {
        path: 'salesman',
        children: [
          { element: <SalesmanListPage />, index: true },
          { path: 'new', element: <SalesmanEditPage /> },
          { path: ':id/edit', element: <SalesmanEditPage /> },
        ]
      },
      {
        path: 'agent',
        children: [
          { element: <AgentListPage />, index: true },
          { path: 'new', element: <AgentEditPage /> },
          { path: ':id/edit', element: <AgentEditPage /> },
        ]
      },
      {
        path: 'customer',
        children: [
          { element: <CustomerListPage />, index: true },
          { path: 'new', element: <CustomerEditPage /> },
          { path: ':id/edit', element: <CustomerEditPage /> },
        ]
      },
      {
        path: 'workshops',
        children: [
          { element: <WorkshopListPage />, index: true },
          { path: 'new', element: <WorkshopEditPage /> },
          { path: ':id/edit', element: <WorkshopEditPage /> },
        ],
      },
      {
        path: 'appraiser_info',
        children: [
          { path: ':id', element: <AppraiserInfoPage /> },
        ]
      }
    ],
  },
];

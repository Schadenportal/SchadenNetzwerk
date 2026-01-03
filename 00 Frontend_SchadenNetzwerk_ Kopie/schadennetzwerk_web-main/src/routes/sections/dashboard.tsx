import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------
// MAIN APP
const DamageListPage = lazy(() => import('src/pages/damages/list'));
const DamageEditPage = lazy(() => import('src/pages/damages/edit'));
const DamageDetailPage = lazy(() => import('src/pages/damages/detail'));
const RepairPlanPage = lazy(() => import('src/pages/damages/repair-plan'));
const EditRepairPlanPage = lazy(() => import('src/pages/damages/edit-repair-plan'));
const CostEstimateCreatePage = lazy(() => import('src/pages/cost-estimate/create'));
const CostEstimationListPage = lazy(() => import('src/pages/cost-estimate/list'));
const UsedCarCreatePage = lazy(() => import('src/pages/used-car/create'));
const UsedCarListPage = lazy(() => import('src/pages/used-car/list'));
const TransportDamageListPage = lazy(() => import('src/pages/transport-damage/list'));
const TransportDamageEditPage = lazy(() => import('src/pages/transport-damage/edit'));
const VehicleRegistrationPage = lazy(() => import('src/pages/damages/vehicle-registration'));
const RepairConfirmationPage = lazy(() => import('src/pages/damages/repair_confirmation'));
const StatisticsPage = lazy(() => import('src/pages/statistics'));
const WorkshopListPage = lazy(() => import('src/pages/workshops/list'));
const WorkshopEditPage = lazy(() => import('src/pages/workshops/edit'));
const ServiceProviderListPage = lazy(() => import('src/pages/service-providers/list'));
const ServiceProviderAssignListPage = lazy(() => import('src/pages/service-providers/assign-list'));
const ServiceProviderEditPage = lazy(() => import('src/pages/service-providers/edit'));
const SalesmanListPage = lazy(() => import('src/pages/salesman/list'));
const SalesmanEditPage = lazy(() => import('src/pages/salesman/edit'));
const SupportPage = lazy(() => import('src/pages/support'));
const SettingsAccountPage = lazy(() => import('src/pages/settings/account'));
const DataProtection = lazy(() => import('src/pages/terms-data-protection/data-protection'));
const TermsOfUse = lazy(() => import('src/pages/terms-data-protection/terms'));
const AppraiserInfoPage = lazy(() => import('src/pages/appraiser-info'));
const ChatPage = lazy(() => import('src/pages/chat'));
const DownloadFile = lazy(() => import('src/pages/download-file'));
const EditInvoice = lazy(() => import('src/pages/damages/edit-invoice'));
const UploadedInvoiceFileList = lazy(() => import('src/pages/statistics/invoice-file-list'));
const ServiceAdviserListPage = lazy(() => import('src/pages/service-adviser/list'));
const ServiceAdviserEditPage = lazy(() => import('src/pages/service-adviser/edit'));
const EditPaintShopOrderView = lazy(() => import('src/sections/main-app/damage/edit-paint-shop-order-view'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: '',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <StatisticsPage />, index: true },
      {
        path: 'damages',
        children: [
          { element: <DamageListPage />, index: true },
          { path: 'new', element: <DamageEditPage /> },
          { path: 'repair_plan', element: <RepairPlanPage /> },
          { path: 'repair_plan/edit', element: <EditRepairPlanPage /> },
          { path: ':id/repair_confirmation', element: <RepairConfirmationPage /> },
          { path: 'vehicle_registration', element: <VehicleRegistrationPage /> },
          { path: ':id/edit', element: <DamageEditPage /> },
          { path: ':id/detail', element: <DamageDetailPage /> },
          { path: ':id/invoice/:invoiceId', element: <EditInvoice /> },
          { path: ':damageId/paint_shop_order/edit', element: <EditPaintShopOrderView /> },
        ],
      },
      {
        path: 'cost_estimate',
        children: [
          { element: <CostEstimationListPage />, index: true },
          { path: 'new', element: <CostEstimateCreatePage /> },
          { path: ':id/edit', element: <CostEstimateCreatePage /> },
        ]
      },
      {
        path: 'used_car',
        children: [
          { element: <UsedCarListPage />, index: true },
          { path: 'new', element: <UsedCarCreatePage /> },
          { path: ':id/edit', element: <UsedCarCreatePage /> },
        ]
      },
      {
        path: 'transport_damage',
        children: [
          { element: <TransportDamageListPage />, index: true },
          { path: 'new', element: <TransportDamageEditPage /> },
          { path: ':id/edit', element: <TransportDamageEditPage /> },
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
        path: 'service_providers',
        children: [
          { element: <ServiceProviderListPage />, index: true },
          { path: ':workshopId/assign', element: <ServiceProviderAssignListPage /> },
          { path: 'new', element: <ServiceProviderEditPage /> },
          { path: ':id/edit', element: <ServiceProviderEditPage /> },
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
        path: 'settings',
        children: [
          { path: 'account', element: <SettingsAccountPage /> },
        ]
      },
      {
        path: 'service_adviser',
        children: [
          { element: <ServiceAdviserListPage />, index: true },
          { path: 'new', element: <ServiceAdviserEditPage /> },
          { path: ':id/edit', element: <ServiceAdviserEditPage /> },
        ]
      },
      { path: 'download_form', element: <DownloadFile /> },
      { path: 'upload_list', element: <UploadedInvoiceFileList /> },
      { path: 'appraiser_info', element: <AppraiserInfoPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'terms_of_use', element: <TermsOfUse /> },
      { path: 'data_protection', element: <DataProtection /> },
      {
        path: 'chat',
        children: [
          { element: <ChatPage />, index: true },
          { path: ':damageId/room', element: <ChatPage /> },
        ],
      },
    ],
  },
];

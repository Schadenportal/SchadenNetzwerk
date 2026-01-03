import { Navigate, useRoutes } from 'react-router-dom';

// import { PATH_AFTER_LOGIN } from 'src/config-global';
import { authRoutes } from './auth';
import { adminRoutes } from './admin';
import { otherRoutes } from './others';
import { dashboardRoutes } from './dashboard';
import { serviceAssignmentsRoutes } from './servie-provider';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Service Assignments
    ...serviceAssignmentsRoutes,

    // Admin routes
    ...adminRoutes,

    // Other routes
    ...otherRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

import { useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { UserRole } from 'src/types/enums';

import { useAuthContext } from '../hooks';
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

const loginPaths: Record<string, string> = {
  firebase: paths.auth.firebase.login,
};

const adminRelatedRoles = [UserRole.Admin, UserRole.SalesAppraiser, UserRole.Salesman];

export default function AdminGuard({ children }: Props) {
  const { loading } = useAuthContext();

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();
  const { authenticated, method } = useAuthContext();

  const { user } = useAuthContext();

  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const loginPath = loginPaths[method];

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
    } else if (user && (!adminRelatedRoles.includes(user.role))) {
      router.replace("/");
    }
  }, [authenticated, method, router, user]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

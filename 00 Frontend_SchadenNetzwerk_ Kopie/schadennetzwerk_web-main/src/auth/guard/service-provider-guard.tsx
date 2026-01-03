import { useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { PROVIDER_ROLES } from 'src/constants/viewConstants';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function ServiceProviderGuard({ children }: Props) {
  const { loading } = useAuthContext();

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();

  const { user } = useAuthContext();

  const check = useCallback(() => {
    if (user && !PROVIDER_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [router, user]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

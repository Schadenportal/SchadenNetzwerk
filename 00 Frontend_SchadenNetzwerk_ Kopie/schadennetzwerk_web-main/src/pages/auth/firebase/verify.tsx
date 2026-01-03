import { Helmet } from 'react-helmet-async';

import { FirebaseVerifyView } from 'src/sections/auth/firebase';

// ----------------------------------------------------------------------

export default function VerifyPage() {
  return (
    <>
      <Helmet>
        <title>Verify Email</title>
      </Helmet>

      <FirebaseVerifyView />
    </>
  );
}

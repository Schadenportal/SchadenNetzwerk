import { Helmet } from 'react-helmet-async';

import { FirebaseForgotPasswordView } from 'src/sections/auth/firebase';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>

      <FirebaseForgotPasswordView />
    </>
  );
}

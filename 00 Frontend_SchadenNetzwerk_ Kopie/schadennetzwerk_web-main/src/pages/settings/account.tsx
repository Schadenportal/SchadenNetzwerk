import { Helmet } from 'react-helmet-async';

import { AccountView } from 'src/sections/main-app/settings';

// ----------------------------------------------------------------------

export default function accountPage() {
  return (
    <>
      <Helmet>
        <title> Account </title>
      </Helmet>

      <AccountView />
    </>
  );
}

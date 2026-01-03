import { Helmet } from 'react-helmet-async';

import { UsersListView } from 'src/sections/main-app/users';

// ----------------------------------------------------------------------

export default function UsersListPage() {
  return (
    <>
      <Helmet>
        <title> Users </title>
      </Helmet>

      <UsersListView />
    </>
  );
}

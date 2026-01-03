import { Helmet } from 'react-helmet-async';

import { AppraiserInfoEditView } from 'src/sections/main-app/appraiser-info';
// ----------------------------------------------------------------------

export default function AppraiserInfoPage() {
  return (
    <>
      <Helmet>
        <title> Appraiser Info </title>
      </Helmet>

      <AppraiserInfoEditView />
    </>
  );
}

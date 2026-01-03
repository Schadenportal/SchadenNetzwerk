import { Helmet } from 'react-helmet-async';

import { ServiceAdviserEditView } from 'src/sections/main-app/service-adviser';


// ----------------------------------------------------------------------

export default function ServiceAdviserEditPage() {
  return (
    <>
      <Helmet>
        <title> Edit service adviser </title>
      </Helmet>

      <ServiceAdviserEditView />
    </>
  );
}

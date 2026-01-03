import { Helmet } from 'react-helmet-async';

import { WorkshopCreateView } from 'src/sections/main-app/workshop';


// ----------------------------------------------------------------------

export default function WorkshopEditPage() {
  return (
    <>
      <Helmet>
        <title> Create a new workshop </title>
      </Helmet>

      <WorkshopCreateView />
    </>
  );
}

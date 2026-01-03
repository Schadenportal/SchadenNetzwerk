import { Helmet } from 'react-helmet-async';

import { SalesmanEditView } from 'src/sections/main-app/salesman';


// ----------------------------------------------------------------------

export default function SalesmanEditPage() {
  return (
    <>
      <Helmet>
        <title> Edit salesman </title>
      </Helmet>

      <SalesmanEditView />
    </>
  );
}

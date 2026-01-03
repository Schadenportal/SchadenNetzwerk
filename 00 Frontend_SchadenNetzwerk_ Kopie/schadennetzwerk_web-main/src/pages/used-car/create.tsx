import { Helmet } from 'react-helmet-async';

import { UsedCarEditView } from 'src/sections/main-app/used-car';

export default function UsedCarCreatePage() {
  return (
    <>
      <Helmet>
        <title> Create used car </title>
      </Helmet>

      <UsedCarEditView />
    </>
  );
}

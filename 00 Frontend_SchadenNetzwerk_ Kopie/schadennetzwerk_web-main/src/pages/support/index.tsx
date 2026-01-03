import { Helmet } from 'react-helmet-async';

import { SupportSectionView } from 'src/sections/main-app/support';

// ----------------------------------------------------------------------

export default function ShopPage() {
  return (
    <>
      <Helmet>
        <title>Support</title>
      </Helmet>

      <SupportSectionView />
    </>
  );
}

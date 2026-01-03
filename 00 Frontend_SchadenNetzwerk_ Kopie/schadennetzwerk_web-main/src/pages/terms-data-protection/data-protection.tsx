import { Helmet } from 'react-helmet-async';

import { DataProtectionSection } from 'src/sections/terms-data-protection.tsx';

// ----------------------------------------------------------------------

export default function DataProtection() {
  return (
    <>
      <Helmet>
        <title>Data Protection</title>
      </Helmet>
      <DataProtectionSection />
    </>
  );
}

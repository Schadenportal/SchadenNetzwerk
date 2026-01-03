import { Helmet } from 'react-helmet-async';

import { TermsSection } from 'src/sections/terms-data-protection.tsx';

// ----------------------------------------------------------------------

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms of Use</title>
      </Helmet>
      <TermsSection />
    </>
  );
}

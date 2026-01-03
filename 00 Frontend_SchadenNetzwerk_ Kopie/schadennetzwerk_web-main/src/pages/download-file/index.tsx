import { Helmet } from 'react-helmet-async';

import { FilesSection } from 'src/sections/main-app/download-file';

// ----------------------------------------------------------------------

export default function DownloadFile() {
  return (
    <>
      <Helmet>
        <title> Download Form </title>
      </Helmet>

      <FilesSection />
    </>
  );
}

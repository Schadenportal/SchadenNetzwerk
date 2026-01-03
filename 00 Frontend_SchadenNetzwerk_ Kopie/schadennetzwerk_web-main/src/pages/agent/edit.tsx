import { Helmet } from 'react-helmet-async';

import { AgentEditView } from 'src/sections/main-app/agent';

// ----------------------------------------------------------------------

export default function AgentEditPage() {
  return (
    <>
      <Helmet>
        <title> Edit insurance agent </title>
      </Helmet>

      <AgentEditView />
    </>
  );
}

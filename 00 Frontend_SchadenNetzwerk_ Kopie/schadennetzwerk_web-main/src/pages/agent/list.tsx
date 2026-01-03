import { Helmet } from 'react-helmet-async';

import { AgentListView } from 'src/sections/main-app/agent';
// ----------------------------------------------------------------------

export default function AgentListPage() {
  return (
    <>
      <Helmet>
        <title>Insurance Agent</title>
      </Helmet>

      <AgentListView />
    </>
  );
}

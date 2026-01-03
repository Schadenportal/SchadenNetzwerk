
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import AgentModel from 'src/models/AgentModel';
import { COLLECTION_AGENT } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import AgentEditForm from './view-components/agent-edit-form';

export default function AgentEditView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [agentData, setAgentData] = useState<AgentModel>();

  const getData = useCallback(async () => {
    if (id) {
      const agent = await getDocument(COLLECTION_AGENT, id, AgentModel);
      if (agent) {
        setAgentData(agent);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('agent')}
        links={[
          { name: t('admin_area'), href: paths.dashboard.root },
          { name: t('agent'), href: paths.admin.agent.root },
          { name: id !== undefined ? t('edit') : t('create') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <AgentEditForm currentAgent={agentData} /> : <AgentEditForm />}
    </Container>
  )
}

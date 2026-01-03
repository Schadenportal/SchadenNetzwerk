
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import WorkshopModel from 'src/models/WorkshopModel';
import { COLLECTION_WORKSHOPS } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import WorkshopNewEditForm from './view-components/workshop-new-create-form';

export default function WorkshopCreateView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [workshopData, setWorkshopData] = useState<WorkshopModel>();

  const getData = useCallback(async () => {
    if (id) {
      const workshop = await getDocument(COLLECTION_WORKSHOPS, id, WorkshopModel);
      if (workshop) {
        setWorkshopData(workshop);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('workshops')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('workshops'), href: paths.dashboard.workshops.root },
          { name: id !== undefined ? t('edit') : t('create') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <WorkshopNewEditForm currentWorkshop={workshopData} /> : <WorkshopNewEditForm />}
    </Container>
  )
}

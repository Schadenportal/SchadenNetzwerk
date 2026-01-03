
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import ServiceAdviserModel from 'src/models/ServiceAdviserModel';
import { COLLECTION_SERVICE_ADVISER } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ServiceAdviserEditForm from './view-components/service-adviser-edit-form';

export default function ServiceAdviserEditView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [customerData, setCustomerData] = useState<ServiceAdviserModel>();

  const getData = useCallback(async () => {
    if (id) {
      const customer = await getDocument(COLLECTION_SERVICE_ADVISER, id, ServiceAdviserModel);
      if (customer) {
        setCustomerData(customer);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('service_adviser')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('service_adviser'), href: paths.dashboard.service_adviser.root },
          { name: id !== undefined ? t('edit') : t('create') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <ServiceAdviserEditForm currentAdviser={customerData} /> : <ServiceAdviserEditForm />}
    </Container>
  )
}


import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import ServiceProviderModel from 'src/models/ServiceProviderModel';
import { COLLECTION_SERVICE_PROVIDERS } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ServiceProviderEditForm from './view-components/service-provider-edit-form';

export default function ServiceProviderCreateView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProviderModel>();

  const getData = useCallback(async () => {
    if (id) {
      const serviceProvider = await getDocument(COLLECTION_SERVICE_PROVIDERS, id, ServiceProviderModel);
      if (serviceProvider) {
        setServiceProviderData(serviceProvider);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('service_providers')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('service_providers'), href: paths.dashboard.service_providers.root },
          { name: id !== undefined ? t('edit') : t('create') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <ServiceProviderEditForm currentServiceProvider={serviceProviderData} /> : <ServiceProviderEditForm />}
    </Container>
  )
}

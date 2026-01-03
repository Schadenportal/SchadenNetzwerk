
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import SalesmanModel from 'src/models/SalesmanModel';
import { COLLECTION_SALESMAN } from 'src/constants/firebase';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import SalesmanEditForm from './view-components/salesman-edit-form';

export default function SalesmanEditView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const [salesmanData, setSalesmanData] = useState<SalesmanModel>();

  const getData = useCallback(async () => {
    if (id) {
      const salesman = await getDocument(COLLECTION_SALESMAN, id, SalesmanModel);
      if (salesman) {
        setSalesmanData(salesman);
      }
    }
  }, [id]);

  useEffect(() => {
    getData()
  }, [getData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('salesman')}
        links={[
          { name: t('admin_area'), href: paths.dashboard.root },
          { name: t('salesman'), href: paths.admin.salesman.root },
          { name: id !== undefined ? t('edit') : t('create') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {id ? <SalesmanEditForm currentSalesman={salesmanData} /> : <SalesmanEditForm />}
    </Container>
  )
}

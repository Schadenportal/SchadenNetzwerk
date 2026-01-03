import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import RepairEditForm from './view-components/repair-edit-form';

export default function EditRepairPlanView() {
  const { t } = useTranslate();

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('repair_plan')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('repair_plan'), href: paths.dashboard.damages.repair_plan },
          { name: t('create') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <RepairEditForm />
    </Container>
  );
}

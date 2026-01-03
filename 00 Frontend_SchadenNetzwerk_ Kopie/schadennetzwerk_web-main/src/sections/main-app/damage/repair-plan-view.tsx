import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import RepairPlanSection from './view-components/repair-plan-section';

export default function RepairPlanView() {
  const { t } = useTranslate();

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('repair_plan')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('repair_plan'), href: paths.dashboard.damages.repair_plan },
          { name: t('list') },
        ]}
        action={
          <Button
            component={RouterLink}
            variant="contained"
            href={paths.dashboard.damages.edit_repair_plan}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            {t('create_repair_plan')}
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <RepairPlanSection />
    </Container>
  );
}

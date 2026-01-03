import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import AccountGeneral from './account-view-components/account-general';
import AccountChangePassword from './account-view-components/account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'general',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function AccountView() {
  const { t } = useTranslate();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('account')}
        links={[
          { name: t('settings') },
          { name: t('user') },
          { name: t('account') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={t(tab.label)} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral />}

      {currentTab === 'security' && <AccountChangePassword />}
    </Container>
  );
}

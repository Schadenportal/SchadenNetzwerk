import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { PROVIDER_ROLES } from 'src/constants/viewConstants';

import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

import { UserRole } from 'src/types/enums';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  damage_statistics: <Iconify icon="material-symbols:analytics" />,
  damage: <Iconify icon="fa-solid:car-crash" />,
  costEstimate: <Iconify icon="tdesign:money" />,
  usedCar: <Iconify icon="maki:car-rental" />,
  transportDamage: <Iconify icon="ion:car-sport" />,
  workshop: <Iconify icon="game-icons:mechanic-garage" />,
  serviceAdviser: <Iconify icon="mdi:account-tie" />,
  adminWorkshop: <Iconify icon="mdi:car-cog" />,
  service_provider: <Iconify icon="la:users-cog" />,
  salesman: <Iconify icon="gis:globe-users" />,
  customer: <Iconify icon="gis:globe-users" />,
  users: <Iconify icon="raphael:users" />,
  support: <Iconify icon="ic:outline-contact-support" />,
  analytics: icon('ic_analytics'),
  assignment: <Iconify icon="uil:notes" />,
  dataProtection: <Iconify icon="flat-color-icons:data-protection" />,
  termsOfUse: <Iconify icon="ic:baseline-privacy-tip" />,
  aboutYourself: <Iconify icon="mdi:about" />,
  agent: <Iconify icon="material-symbols:support-agent-sharp" />,
  chat: <Iconify icon="cryptocurrency:chat" />,
  download: <Iconify icon="solar:file-download-bold" />,
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();
  const { user } = useAuthContext();

  const data = useMemo(
    () => [
      // Main APP
      // ----------------------------------------------------------------------
      {
        subheader: t('damage_management'),
        items: [
          {
            title: t('damage_statistics'),
            path: paths.dashboard.root,
            icon: ICONS.analytics,
          },
          {
            title: t('damages'),
            path: paths.dashboard.damages.root,
            icon: ICONS.damage,
            children: [
              { title: t('damage_list'), path: paths.dashboard.damages.root },
              { title: t('create_damage'), path: paths.dashboard.damages.vehicle_registration },
              { title: t('create_damage_manually'), path: paths.dashboard.damages.new },
              { title: t('repair_plan'), path: paths.dashboard.damages.repair_plan },
            ]
          },
          {
            title: t('cost_estimate'),
            path: paths.dashboard.cost_estimate.root,
            icon: ICONS.costEstimate,
            children: [
              { title: t('cost_estimation_list'), path: paths.dashboard.cost_estimate.root },
              { title: t('menu_cost_estimate'), path: paths.dashboard.cost_estimate.new },
            ],
            roles: [UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.SalesAppraiser, UserRole.Salesman]
          },
          {
            title: t('used_car'),
            path: paths.dashboard.used_car.root,
            icon: ICONS.usedCar,
            children: [
              { title: t('used_car_overview'), path: paths.dashboard.used_car.root },
              { title: t('create_used_car'), path: paths.dashboard.used_car.new },
            ],
            roles: [UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.SalesAppraiser, UserRole.Salesman]
          },
          {
            title: t('transport_damage'),
            path: paths.dashboard.transport_damage.root,
            icon: ICONS.transportDamage,
            children: [
              { title: t('transport_damage_overview'), path: paths.dashboard.transport_damage.root },
              { title: t('create_transport_damage'), path: paths.dashboard.transport_damage.new },
            ],
            roles: [UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.SalesAppraiser, UserRole.Salesman]
          },
          {
            title: t('workshops'),
            path: paths.dashboard.workshops.root,
            icon: ICONS.workshop,
            roles: [UserRole.Admin, UserRole.Owner],
          },
          {
            title: t('appraiser_info'),
            path: paths.dashboard.appraiser_info,
            icon: ICONS.aboutYourself,
            roles: [UserRole.Appraiser, UserRole.SalesAppraiser]
          },
          // {
          //   title: t('chat'),
          //   path: paths.dashboard.chat.root,
          //   icon: ICONS.chat,
          // },
          {
            title: t('download_form'),
            path: paths.dashboard.downloadForm,
            icon: ICONS.download,
          },
          {
            title: t('support'),
            path: paths.dashboard.support,
            icon: ICONS.support,
          },
          {
            title: t('terms_of_use'),
            path: paths.dashboard.termsOfUse,
            icon: ICONS.termsOfUse,
          },
          {
            title: t('data_protection'),
            path: paths.dashboard.dataProtection,
            icon: ICONS.dataProtection,
          },
        ]
      },
      user && user.role === UserRole.Owner ? {
        subheader: t('service_adviser'),
        items: [
          {
            title: t('service_adviser'),
            path: paths.dashboard.service_adviser.root,
            icon: ICONS.serviceAdviser,
            roles: [UserRole.Admin, UserRole.Owner],
          },
        ],
      } : {
        subheader: "",
        items: [],
      },
      user && PROVIDER_ROLES.includes(user.role) ? {
        subheader: t('assignment_management'),
        items: [
          {
            title: t('assignment'),
            path: paths.serviceAssignment.root,
            icon: ICONS.assignment,
          },
        ],
      } : {
        subheader: "",
        items: [],
      },
      user && [UserRole.Admin, UserRole.Salesman, UserRole.SalesAppraiser].includes(user.role) ? {
        subheader: t('admin_area'),
        items: [
          {
            title: t('users'),
            path: paths.admin.users.root,
            icon: ICONS.users,
            roles: [UserRole.Admin],
          },
          {
            title: t('salesman'),
            path: paths.admin.salesman.root,
            icon: ICONS.salesman,
            roles: [UserRole.Admin],
          },
          {
            title: t('workshops'),
            path: paths.admin.workshops.root,
            icon: ICONS.adminWorkshop,
            roles: [UserRole.Admin, UserRole.Salesman, UserRole.SalesAppraiser],
          },
          {
            title: t('agent'),
            path: paths.admin.agent.root,
            icon: ICONS.agent,
            roles: [UserRole.Admin, UserRole.Salesman, UserRole.SalesAppraiser],
          },
          {
            title: t('service_providers'),
            path: paths.dashboard.service_providers.root,
            icon: ICONS.service_provider,
            roles: [UserRole.Admin]
          },
        ],
      } : {
        subheader: "",
        items: [],
      }
    ],
    [t, user]
  );

  return data;
}

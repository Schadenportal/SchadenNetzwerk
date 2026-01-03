
const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '',
  SERVICE_ASSIGNMENT: '/service_assignment',
  ADMIN: '/admin',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  // AUTH
  auth: {
    firebase: {
      login: `${ROOTS.AUTH}/login`,
      verify: `${ROOTS.AUTH}/verify`,
      // register: `${ROOTS.AUTH}/register`,
      forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: `${ROOTS.DASHBOARD}/`,
    damages: {
      root: `${ROOTS.DASHBOARD}/damages`,
      new: `${ROOTS.DASHBOARD}/damages/new`,
      repair_plan: `${ROOTS.DASHBOARD}/damages/repair_plan`,
      repair_confirmation: (id: string) => `${ROOTS.DASHBOARD}/damages/${id}/repair_confirmation`,
      edit_repair_plan: `${ROOTS.DASHBOARD}/damages/repair_plan/edit`,
      vehicle_registration: `${ROOTS.DASHBOARD}/damages/vehicle_registration`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/damages/${id}/edit`,
      detail: (id: string) => `${ROOTS.DASHBOARD}/damages/${id}/detail`,
      invoice: (id: string, invoiceId: string) => `${ROOTS.DASHBOARD}/damages/${id}/invoice/${invoiceId}`,
      edit_paint_shop_order: (damageId: string) => `${ROOTS.DASHBOARD}/damages/${damageId}/paint_shop_order/edit`,
    },
    cost_estimate: {
      root: `${ROOTS.DASHBOARD}/cost_estimate`,
      new: `${ROOTS.DASHBOARD}/cost_estimate/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/cost_estimate/${id}/edit`,
    },
    used_car: {
      root: `${ROOTS.DASHBOARD}/used_car`,
      new: `${ROOTS.DASHBOARD}/used_car/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/used_car/${id}/edit`,
    },
    transport_damage: {
      root: `${ROOTS.DASHBOARD}/transport_damage`,
      new: `${ROOTS.DASHBOARD}/transport_damage/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/transport_damage/${id}/edit`,
    },
    workshops: {
      root: `${ROOTS.DASHBOARD}/workshops`,
      new: `${ROOTS.DASHBOARD}/workshops/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/workshops/${id}/edit`,
    },
    service_providers: {
      root: `${ROOTS.DASHBOARD}/service_providers`,
      new: `${ROOTS.DASHBOARD}/service_providers/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/service_providers/${id}/edit`,
      assign: (workshopId: string) => `${ROOTS.DASHBOARD}/service_providers/${workshopId}/assign`,
    },
    salesman: {
      root: `${ROOTS.DASHBOARD}/salesman`,
      new: `${ROOTS.DASHBOARD}/salesman/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/salesman/${id}/edit`,
    },
    service_adviser: {
      root: `${ROOTS.DASHBOARD}/service_adviser`,
      new: `${ROOTS.DASHBOARD}/service_adviser/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/service_adviser/${id}/edit`,
    },
    settings: {
      account: `${ROOTS.DASHBOARD}/settings/account`,
    },
    appraiser_info: `${ROOTS.DASHBOARD}/appraiser_info`,
    support: `${ROOTS.DASHBOARD}/support`,
    termsOfUse: `${ROOTS.DASHBOARD}/terms_of_use`,
    dataProtection: `${ROOTS.DASHBOARD}/data_protection`,
    downloadForm: `${ROOTS.DASHBOARD}/download_form`,
    uploadList: `${ROOTS.DASHBOARD}/upload_list`,
    chat: {
      root: `${ROOTS.DASHBOARD}/chat`,
      damageChat: (damageId: string) => `${ROOTS.DASHBOARD}/chat/${damageId}/room`,
    }
  },
  serviceAssignment: {
    root: ROOTS.SERVICE_ASSIGNMENT,
    detail: (id: string) => `${ROOTS.SERVICE_ASSIGNMENT}/${id}/detail`,
  },
  admin: {
    root: ROOTS.ADMIN,
    users: {
      root: `${ROOTS.ADMIN}/users`,
    },
    salesman: {
      root: `${ROOTS.ADMIN}/salesman`,
      new: `${ROOTS.ADMIN}/salesman/new`,
      edit: (id: string) => `${ROOTS.ADMIN}/salesman/${id}/edit`,
    },
    agent: {
      root: `${ROOTS.ADMIN}/agent`,
      new: `${ROOTS.ADMIN}/agent/new`,
      edit: (id: string) => `${ROOTS.ADMIN}/agent/${id}/edit`,
    },
    workshops: {
      root: `${ROOTS.ADMIN}/workshops`,
      new: `${ROOTS.ADMIN}/workshops/new`,
      edit: (id: string) => `${ROOTS.ADMIN}/workshops/${id}/edit`,
    },
    appraiserInfo: {
      edit: (id: string) => `${ROOTS.ADMIN}/appraiser_info/${id}`,
    }
  }
};

import { UserRole, VehicleEngineTypes } from "src/types/enums";

export const ON_BEHALF_TYPES = [
  { value: "agent", label: "agent" },
  { value: "appraiser", label: "appraiser" },
];

export const INSURANCE_TYPES = [
  { value: 'liability', label: 'liability' },
  { value: 'fullyComprehensive', label: 'fully_comprehensive' },
  { value: 'partiallyComprehensive', label: 'partially_comprehensive' },
  { value: 'personalLiability', label: 'personal_liability' },
  { value: 'commercialLiability', label: 'commercial_liability' },
];

export const CLIENT_TYPES = [
  { value: "PRIVATE_CLIENT", label: "private_client" },
  { value: "CORPORATE_CLIENT", label: "corporate_client" },
];

export const DRIVER_TYPES = [
  { value: 'unknownDriver', label: 'unknown' },
  { value: 'customerDriver', label: 'customer' },
  { value: 'otherDriver', label: 'other' },
]

export const VEHICLE_OWNER_TYPES = [
  { value: 'unknownOwner', label: 'unknown' },
  { value: 'leasingCompanyOwner', label: 'leasing_company' },
  { value: 'bank', label: 'bank' },
  { value: 'otherOwner', label: 'other' },
]

export const SALUTATIONS = [
  { value: 'MR', label: 'mr' },
  { value: 'MRS', label: 'mrs' },
  { value: 'COMPANY', label: 'company' },
]

export const VEHICLE_CATEGORIES = [
  { value: 'PKW', label: 'PKW' },
  { value: 'Transporter', label: 'Transporter' },
  { value: 'LKW', label: 'LKW' },
  { value: 'Wohnmobil', label: 'Wohnmobil' },
]

export const DAMAGE_TYPES = [
  { value: 'controlled', label: 'Gesteuerter Versicherungsschaden' },
  { value: 'quotation', label: 'Kostenvoranschlag' },
];

export const YES_OR_NO_TYPES = [
  { value: 1, label: 'yes' },
  { value: 0, label: 'no' },
]

export const DealershipSubFileTypes = [
  'cost_estimate',
  'repair_invoice',
]

export const COST_ESTIMATE_TYPES = [
  { value: 'standard', label: 'cost_estimate_standard' },
  { value: 'liabilityDamage', label: 'liability_damage' },
];

export const COMMISSION_TYPES = [
  { value: 'percent', label: 'percent' },
  { value: 'euro', label: 'euro' },
]

export const CUSTOMER_PREFERENCE_TYPES = [
  { value: 'repairDesired', label: 'repair_desired' },
  { value: 'fictitiousBilling', label: 'fictitious_billing' },
  { value: 'unknown', label: 'unknown' },
];

export const ENGINE_TYPES = [
  { value: VehicleEngineTypes.GASOLINE, label: 'gasoline' },
  { value: VehicleEngineTypes.ELECTRIC, label: 'electric' },
  { value: VehicleEngineTypes.HYBRID, label: 'hybrid' },
]

export const ADMIN_ROLES = [UserRole.Admin, UserRole.Salesman, UserRole.SalesAppraiser];
export const PROVIDER_ROLES = [UserRole.Appraiser, UserRole.Lawyer, UserRole.CarRenter, UserRole.PaintShop, UserRole.TowingService];
export const GENERAL_ROLES = [...ADMIN_ROLES, UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.ServiceAdviser];
export const OTHER_SERVICES = [UserRole.CarRenter, UserRole.PaintShop, UserRole.TowingService];
export const SUPER_ADMIN_ROLES = [UserRole.Admin];
export const MAIN_MANAGER_ROLES = [UserRole.Admin, UserRole.Lawyer];
export const WORKSHOP_ROLES = [UserRole.Owner, UserRole.ServiceAdviser];

export enum UserRole {
  Admin = "admin",
  Owner = "owner",
  Lawyer = "lawyer",
  Appraiser = "appraiser",
  CarRenter = "carRenter",
  TowingService = "towingService",
  PaintShop = "paintShop",
  Salesman = "salesman",
  SalesAppraiser = "salesAppraiser",
  Agent = "agent",
  ServiceAdviser = "serviceAdviser",
}

export enum QueryResultType {
  RESULT_SUCCESS = 1000,
  RESULT_UNKNOWN_ERROR = -1,
  RESULT_INVALID_PARAM = -1000,
  RESULT_DUPLICATED_EMAIL = -1011,
  RESULT_DUPLICATED_PHONE = -1012,
  RESULT_DUPLICATED_NAME = -1013,
  RESULT_NOT_EXIST = -1020,
  RESULT_EMAIL_NOT_EXIST = -1021,
  RESULT_PHONE_NOT_EXIST = -1022,
  RESULT_USERNAME_NOT_EXIST = -1023,
  RESULT_USER_NOT_EXIST = -1024,
  RESULT_NOT_OWNER = -1030,
}

export enum ServiceProviderType {
  ATTORNEY = 'Attorney',
  APPRAISER = 'Appraiser',
  CAR_RENTAL = 'CarRental',
  PAINT_SHOP = 'PaintShop',
  TOWING_SERVICE = 'TowingService'
}

export enum ServiceTaskTypes {
  ATTORNEY_TASK = "attorney_task",
  APPRAISER_TASK = "appraiser_task",
  CAR_RENTAL_TASK = "car_rental_task",
  PAINT_SHOP_TASK = "paint_shop_task",
  TOWING_SERVICE_TASK = "towing_service_task",
}

export enum DamageStatusType {
  CREATED = "created",
  SIGNED = "signed",
  FINISHED = "finished",
}

export enum ServiceTaskStatusTypes {
  CREATED = "created",
  SIGNED = "signed",
  ACCEPTED = "accepted",
  FINISHED = "finished",
}

export enum FileCategories {
  DEALERSHIP = "dealership",
  APPRAISER = "appraiser",
  CAR_RENTAL = 'car_rental_accident_replacement',
  JUSTIZCAR = 'justizcar',
  PAINT_SHOP = "paint_shop",
  OTHER_FILES = 'other_files',
}

export enum FileDealershipCategories {
  ORDER = "order",
  COST_ESTIMATE = "cost_estimate",
  REPAIR_INVOICE = "repair_invoice",
  REPAIR_APPROVAL = "repair_approval",
  MISCELLANEOUS = "miscellaneous",
  OUTSTANDING_CLAIMS = "outstanding_claims"
}

export enum FileAppraiserCategories {
  EXPERT_OPINION = "expert_opinion",
  APPRAISER_INVOICE = "appraiser_invoice",
  ACCIDENT_REPORT = "accident_report",
  REPAIR_APPROVAL = "repair_approval",
  MISCELLANEOUS = "miscellaneous",
  OUTSTANDING_CLAIMS = "outstanding_claims"
}

export enum FileCarRentalCategories {
  RENTAL_INVOICE = "rental_invoice",
  RENTAL_CONTRACT = "rental_contract",
  ASSIGNMENT_INSURANCE = "assignment_insurance",
  REPAIR_APPROVAL = "repair_approval",
  MISCELLANEOUS = "miscellaneous",
  OUTSTANDING_CLAIMS = "outstanding_claims"
}

export enum FileJustizcarCategories {
  POWER_OF_ATTORNEY = "power_of_attorney",
  LIABILITY_INQUIRY = "liability_inquiry",
  NOTIFICATION_TO_INSURANCE = "notification_to_insurance",
  COMMUNICATION_TO_INSURANCE = "communication_to_insurance",
  INSURANCE_SETTLEMENT = "insurance_settlement",
  ACCIDENT_REPORT = "accident_report",
  MISCELLANEOUS = "miscellaneous",
  COURT_MAIL = "court_mail",
  REPAIR_APPROVAL = "repair_approval",
  OUTSTANDING_CLAIMS = "outstanding_claims"
}

export enum FileOthersCategories {
  VRC = "vehicle_registration_certificate",
  PURCHASE_CONTRACT = "purchase_contract",
  MISCELLANEOUS = "miscellaneous",
}

export enum COST_ESTIMATE_TYPES {
  STANDARD = "standard",
  LIABILITY_DAMAGE = "liabilityDamage"
}

export enum CustomerPreferenceTypes {
  REPAIR_DESIRED = "repairDesired",
  FICTITIOUS_BILLING = "fictitiousBilling",
  UNKNOWN = "unknown"
}

export enum SurchargeTypes {
  PERCENT = "percent",
  EURO = "euro"
}

export enum VehicleConditionTypes {
  LIKE_NEW = "like_new",
  VERY_GOOD = "very_good",
  GOOD = "good",
  WELL_MAINTAINED = "well_maintained",
  MODERATE = "moderate",
  NEGLECTED = "neglected",
  VERY_NEGLECTED = "very_neglected"
}

export enum SupportResultTypes {
  PENDING = "pending",
  SOLVED = "solved",
  REJECTED = "rejected",
}

export enum VehicleEngineTypes {
  GASOLINE = "gasoline",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
}

export enum ChatRoomTypes {
  ONE_TO_ONE = "ONE_TO_ONE",
  GROUP = "GROUP",
}

export enum NotificationTypes {
  CHAT = "chat",
  FILE_UPLOAD = "fileUpload",
  APPRAISER_INFO_COMPLETE = "appraiserInfoComplete",
  REPAIR_APPROVED = "repairApproved",
  DAMAGE_CLOSED = "damageClosed",
  INVOICE_INFO_CREATED = "invoiceInfoCreated",
  INVOICE_INFO_UPDATED = "invoiceInfoUpdated",
  COMPLAINT = "complaint",
  INSURANCE_VALUATION = "insuranceValuation",
  UNKNOWN = "unknown",
}

export enum NotificationActionTypes {
  AS_READ = "asRead",
  AS_ARCHIVE = "asArchive",
  AS_DELETE = "asDelete",
}

export enum DamageStatusUpdatingTypes {
  APPROVED = "approved",
  COMPLAINT = "complaint",
  INSURANCE_VALUATION = "insurance_valuation",
}

export enum FilePaintShopCategories {
  PAINT_SHOP_ORDER = "paint_shop_order",
  MISCELLANEOUS = "miscellaneous",
}

export enum PaintShopOrderStatus {
  STARTED = "started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

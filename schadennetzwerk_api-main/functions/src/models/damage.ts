import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const editDamageModel = Joi.object({
  "insuranceAgent": Joi.string().allow(""),
  "appraiserRef": Joi.string().allow(""),
  "damageId": Joi.string().optional(),
  "workshopId": Joi.string().allow(""),
  "serviceAdvisers": Joi.array().items(Joi.string()).optional(),
  "serviceManager": Joi.string().allow(""),
  "serviceClerk": Joi.string().allow(""),
  "insuranceName": Joi.string().allow(null, ""),
  "insuranceNumber": Joi.string().allow(""),
  "insuranceDamageNumber": Joi.string().allow(""),
  "hasPreviousDamage": Joi.number().optional().default(0), // 0: no, 1: yes
  "wasAmountKnown": Joi.number().optional().default(0), // 0: no, 1: yes
  "knownAmount": Joi.number().optional().default(0),
  // General =====

  "insuranceType": Joi.string().allow(""), // Default first one
  "controlled": Joi.boolean().default(false), // Default false
  "quotation": Joi.boolean().default(false), // Default false
  "damageDate": Joi.date().required(),
  "damageCity": Joi.string().allow(""),
  "damageCountry": Joi.string().allow(""),
  "damagedVehicleLocation": Joi.string().allow(""),
  "damageNumber": Joi.string().allow(""),
  "accidentWithInjuries": Joi.boolean(),
  "accidentWithWitnesses": Joi.boolean(),
  "accidentPoliceRecorded": Joi.boolean(),
  "driverAtAccident": Joi.string().allow(""),
  "accidentDescription": Joi.string().allow(""), // Accident ====

  "customerType": Joi.string().allow(""),
  "customerFirstName": Joi.string().required(),
  "customerLastName": Joi.string().when("customerType", {
    is: "PRIVATE_CLIENT",
    then: Joi.string().required(),
    otherwise: Joi.string().allow(""),
  }),
  "customerEmail": Joi.string().email().required(),
  "customerPhone": Joi.string().required(),
  "customerWhatsapp": Joi.string().allow(""),
  "customerTelephone": Joi.string().allow(""),
  "customerStreet": Joi.string().required(),
  "customerCountry": Joi.string().required(),
  "customerCity": Joi.string().required(),
  "customerPostalCode": Joi.string().required(),
  "customerNumber": Joi.string().allow(""),
  "customerLandline": Joi.string().allow(""),
  "customerContactPerson": Joi.string().allow(""),
  "customerDriverLicenseNumber": Joi.string().allow(""),
  "injuredPartyInformation": Joi.string().allow(""),
  "damagingNote": Joi.string().allow(""),
  "customerBankHolder": Joi.string().allow(""),
  "customerBankIBAN": Joi.string().allow(""),
  "customerBank": Joi.string().allow(""),
  "customerBankBIC": Joi.string().allow(""),
  "customerVehicleLicensePlate": Joi.string().required(),
  "customerVehicleVINNumber": Joi.string().allow(""),
  "customerVehicleBrand": Joi.string().required(),
  "customerVehicleModel": Joi.string().required(),
  "customerVehicleCategory": Joi.string().allow(""),
  "customerVehicleFirstRegistration": Joi.date().allow(null, ""),
  "customerVehicleOwnerType": Joi.string().allow(""),
  "customerVehicleLeasingCompany": Joi.string().allow(null, ""),
  "customerVehicleOwnerBank": Joi.string().allow(null, ""),
  "customerVehicleExcess": Joi.string().allow(""),
  "customerVehicleMileage": Joi.string().allow(""),
  "customerTaxDeduction": Joi.number().optional().default(-1), // Customer part

  "tortfeasorSalutation": Joi.string().allow(""),
  "tortfeasorFirstName": Joi.string().required(),
  "tortfeasorLastName": Joi.string().when("tortfeasorSalutation", {
    is: "COMPANY",
    then: Joi.string().allow(""),
    otherwise: Joi.string().required(),
  }),
  "tortfeasorEmail": Joi.string().allow(""),
  "tortfeasorPhone": Joi.string().allow(""),
  "tortfeasorStreet": Joi.string().allow(""),
  "tortfeasorCountry": Joi.string().allow(""),
  "tortfeasorCity": Joi.string().allow(""),
  "tortfeasorPostalCode": Joi.string().allow(""),
  "tortfeasorLandline": Joi.string().allow(""),
  "tortfeasorVehicleLicensePlate": Joi.string().required(),
  "tortfeasorVehicleCategory": Joi.string().allow(""),
  "tortfeasorVehicleBrand": Joi.string().allow(null, ""),
  "tortfeasorInformation": Joi.string().allow(""),
  "tortfeasorInsuranceName": Joi.string().allow(null, ""),
  "tortfeasorInsuranceNumber": Joi.string().allow(""), // Tortfeasor part

  "attorneyId": Joi.string().allow(null, ""),
  "descriptionForAttorney": Joi.string().allow(""),
  "appraiserId": Joi.string().allow(null, ""),
  "descriptionForAppraiser": Joi.string().allow(""),
  "carRentalId": Joi.string().allow(""),
  "descriptionForCarRental": Joi.string().allow(""),
  "paintShopId": Joi.string().allow(""),
  "paintShopPdf": Joi.string().allow(""),
  "descriptionForPaintShop": Joi.string().allow(""),
  "towingServiceId": Joi.string().allow(""),
  "descriptionForTowingService": Joi.string().allow(""), // Service provider
  "isRkuOn": Joi.boolean(),
  "isRepairScheduleOn": Joi.boolean(),
  "willSendPriceList": Joi.boolean(),
  // For only admin and appraisers : This will be used to create a damage without sending any notifications
  "isManualCreating": Joi.boolean(),
  "willSendDelayedReminder": Joi.boolean(),
});

export const FileUploadModel = Joi.object({
  damageId: Joi.string(),
  category: Joi.string(),
  subCategory: Joi.string(),
  fileName: Joi.string(),
  fileUrl: Joi.string(),
});

export const updateDamageModel = Joi.object({
  damageId: Joi.string().required(),
  revenue: Joi.number().required(),
  diminished: Joi.number().required(),
  liabilityRate: Joi.number().optional().default(0),
  fullyComprehensiveRate: Joi.number().optional().default(0),
  controlledInsuranceLossRate: Joi.number().optional().default(0),
  totalLoss: Joi.boolean().required(),
  isRepaired: Joi.boolean().required(),
  isCutsApproved: Joi.boolean().required(),
  engineType: Joi.string().required(),
});

export const createRepairPlanModel = Joi.object({
  damageId: Joi.string().required(),
  expertReport: Joi.date().optional().allow(null),
  expertInspection: Joi.date().optional().allow(null),
  expertReportReceiptDate: Joi.date().optional().allow(null),
  decisionFrom: Joi.date().optional().allow(null),
  decisionTo: Joi.date().optional().allow(null),
  entryToWorkshop: Joi.date().optional().allow(null),
  repairOrder: Joi.date().optional().allow(null),
  orderOfParts: Joi.date().optional().allow(null),
  arrivalOfParts: Joi.date().optional().allow(null),
  repairStartDate: Joi.date().optional().allow(null),
  repairInterruptionFrom: Joi.date().optional().allow(null),
  repairInterruptionTo: Joi.date().optional().allow(null),
  repairResume: Joi.date().optional().allow(null),
  entryToPaintShop: Joi.date().optional().allow(null),
  paintStartDate: Joi.date().optional().allow(null),
  paintEndDate: Joi.date().optional().allow(null),
  repairCompletion: Joi.date().optional().allow(null),
  pickupReadyDate: Joi.date().optional().allow(null),
  pickupDate: Joi.date().optional().allow(null),
  totalRepairPeriodFrom: Joi.date().optional().allow(null),
  totalRepairPeriodTo: Joi.date().optional().allow(null),
  reasonDesc: Joi.string().allow(""),
  pointDesc: Joi.string().allow(""),
});

export const setRepairConfirmationModel = Joi.object({
  damageId: Joi.string().required(),
  repairConfirmId: Joi.string(),
  firstName: Joi.string().allow(""),
  lastName: Joi.string().allow(""),
  captureDate: Joi.date().optional().allow(null),
  address: Joi.object({
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    postalCode: Joi.string().allow(""),
  }),
  licensePlate: Joi.string().allow(""),
  vin: Joi.string().allow(""),
  images: Joi.object({
    frontImages: Joi.array(),
    rearImages: Joi.array(),
    distanceImages: Joi.array(),
    closeImages: Joi.array(),
    vehicleDocumentImages: Joi.array(),
    otherImages: Joi.array(),
  }),
});

export type IEditDamageModel = Joi.extractType<typeof editDamageModel>;
export type IFileUploadModel = Joi.extractType<typeof FileUploadModel>;
export type IUpdateDamageModel = Joi.extractType<typeof updateDamageModel>;
export type ICreateRepairPlanModel = Joi.extractType<typeof createRepairPlanModel>;
export type ISetRepairConfirmationModel = Joi.extractType<typeof setRepairConfirmationModel>;

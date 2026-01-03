import { Timestamp } from "firebase/firestore";

import { PaintShopOrderStatus } from "src/types/enums";

type Costs = {
  revenue: number;
  diminished: number;
  liabilityRate?: number;
  fullyComprehensiveRate?: number;
  controlledInsuranceLossRate?: number;
}
class DamageModel {
  damageId: string;

  chatGroupId: string;

  orderNumber: string;

  status: string;

  insuranceAgent: string;

  appraiserRef: string;

  workshopId: string;

  serviceAdvisers: string[];

  serviceManager: string;

  serviceClerk: string;

  insuranceName: string;

  insuranceNumber: string;

  hasPreviousDamage?: number; // 0 = No, 1 = Yes

  wasAmountKnown?: number; // Was amount known? 0 = No, 1 = Yes

  knownAmount?: number; // If wasAmountKnown = 1, what was the amount?

  insuranceDamageNumber: string;

  insuranceType: string;

  controlled: boolean;

  quotation: boolean;

  damageDate: Timestamp;

  damageCity: string;

  damageCountry: string;

  damagedVehicleLocation: string;

  damageNumber: string;

  accidentWithInjuries: boolean;

  accidentWithWitnesses: boolean;

  accidentPoliceRecorded: boolean;

  driverAtAccident: string;

  accidentDescription: string; // Accident ====

  customerType: string;

  customerFirstName: string;

  customerLastName: string;

  customerEmail: string;

  customerPhone: string;

  customerWhatsapp: string;

  customerTelephone: string;

  customerStreet: string;

  customerCountry: string;

  customerCity: string;

  customerPostalCode: string;

  customerNumber: string;

  customerLandline: string;

  customerContactPerson: string;

  customerDriverLicenseNumber: string;

  injuredPartyInformation: string;

  damagingNote: string;

  customerBankHolder: string;

  customerBankIBAN: string;

  customerBank: string;

  customerBankBIC: string;

  customerVehicleLicensePlate: string;

  customerVehicleVINNumber: string;

  customerVehicleBrand: string;

  customerVehicleModel: string;

  customerVehicleCategory: string;

  customerVehicleFirstRegistration: Timestamp;

  customerVehicleOwnerType: string;

  customerVehicleLeasingCompany: string;

  customerVehicleOwnerBank: string;

  customerVehicleExcess: string;

  customerVehicleMileage: string;

  customerTaxDeduction: number; // Customer part

  tortfeasorSalutation: string;

  tortfeasorFirstName: string;

  tortfeasorLastName: string;

  tortfeasorEmail: string;

  tortfeasorPhone: string;

  tortfeasorStreet: string;

  tortfeasorCountry: string;

  tortfeasorCity: string;

  tortfeasorPostalCode: string;

  tortfeasorLandline: string;

  tortfeasorVehicleLicensePlate: string;

  tortfeasorVehicleCategory: string;

  tortfeasorVehicleBrand: string;

  tortfeasorInformation: string;

  tortfeasorInsuranceName: string;

  tortfeasorInsuranceNumber: string; // Tortfeasor part

  attorneyId: string;

  descriptionForAttorney: string;

  appraiserId: string;

  descriptionForAppraiser: string;

  carRentalId: string;

  descriptionForCarRental: string;

  paintShopId: string;

  descriptionForPaintShop: string;

  towingServiceId: string;

  descriptionForTowingService: string; // Service provider

  isRkuOn: boolean;

  isRepairScheduleOn: boolean;

  userId: string;

  assignmentDoc: string;

  repairScheduleDoc: string;

  costs: Costs;

  createdAt: Timestamp;

  updatedAt: Timestamp;

  repairConfirmId?: string;

  repairApproved: boolean;

  isComplaint?: boolean;

  isInsuranceValuation?: boolean;

  invoiceId?: string;

  paintShopOrderStatus: PaintShopOrderStatus;

  paintShopPdfUrl?: string;

  constructor(data: Record<string, any>) {
    this.damageId = data.damageId as string
    this.chatGroupId = data.chatGroupId as string
    this.orderNumber = data.orderNumber as string
    this.status = data.status as string
    this.insuranceAgent = data.insuranceAgent as string
    this.appraiserRef = data.appraiserRef as string
    this.workshopId = data.workshopId as string
    this.serviceAdvisers = data.serviceAdvisers as string[]
    this.serviceManager = data.serviceManager as string
    this.serviceClerk = data.serviceClerk as string
    this.insuranceName = data.insuranceName as string
    this.insuranceNumber = data.insuranceNumber as string
    this.hasPreviousDamage = data.hasPreviousDamage as number || 0
    this.wasAmountKnown = data.wasAmountKnown as number || 0
    this.knownAmount = data.knownAmount as number || 0
    this.insuranceDamageNumber = data.insuranceDamageNumber as string
    this.insuranceType = data.insuranceType as string
    this.controlled = data.controlled as boolean
    this.quotation = data.quotation as boolean
    this.damageDate = data.damageDate as Timestamp
    this.damageCity = data.damageCity as string
    this.damageCountry = data.damageCountry as string
    this.damagedVehicleLocation = data.damagedVehicleLocation as string
    this.damageNumber = data.damageNumber as string
    this.accidentWithInjuries = data.accidentWithInjuries as boolean
    this.accidentWithWitnesses = data.accidentWithWitnesses as boolean
    this.accidentPoliceRecorded = data.accidentPoliceRecorded as boolean
    this.driverAtAccident = data.driverAtAccident as string
    this.accidentDescription = data.accidentDescription as string
    this.customerType = data.customerType as string
    this.customerFirstName = data.customerFirstName as string
    this.customerLastName = data.customerLastName as string
    this.customerEmail = data.customerEmail as string
    this.customerPhone = data.customerPhone as string
    this.customerWhatsapp = data.customerWhatsapp as string
    this.customerTelephone = data.customerTelephone as string
    this.customerStreet = data.customerStreet as string
    this.customerCountry = data.customerCountry as string
    this.customerCity = data.customerCity as string
    this.customerPostalCode = data.customerPostalCode as string
    this.customerNumber = data.customerNumber as string
    this.customerLandline = data.customerLandline as string
    this.customerContactPerson = data.customerContactPerson as string
    this.customerDriverLicenseNumber = data.customerDriverLicenseNumber as string
    this.injuredPartyInformation = data.injuredPartyInformation as string
    this.damagingNote = data.damagingNote as string
    this.customerBankHolder = data.customerBankHolder as string
    this.customerBankIBAN = data.customerBankIBAN as string
    this.customerBank = data.customerBank as string
    this.customerBankBIC = data.customerBankBIC as string
    this.customerVehicleLicensePlate = data.customerVehicleLicensePlate as string
    this.customerVehicleVINNumber = data.customerVehicleVINNumber as string
    this.customerVehicleBrand = data.customerVehicleBrand as string
    this.customerVehicleModel = data.customerVehicleModel as string
    this.customerVehicleCategory = data.customerVehicleCategory as string
    this.customerVehicleFirstRegistration = data.customerVehicleFirstRegistration as Timestamp
    this.customerVehicleOwnerType = data.customerVehicleOwnerType as string
    this.customerVehicleLeasingCompany = data.customerVehicleLeasingCompany as string
    this.customerVehicleOwnerBank = data.customerVehicleOwnerBank as string
    this.customerVehicleExcess = data.customerVehicleExcess as string
    this.customerVehicleMileage = data.customerVehicleMileage as string
    this.customerTaxDeduction = data.customerTaxDeduction as number
    this.tortfeasorSalutation = data.tortfeasorSalutation as string
    this.tortfeasorFirstName = data.tortfeasorFirstName as string
    this.tortfeasorLastName = data.tortfeasorLastName as string
    this.tortfeasorEmail = data.tortfeasorEmail as string
    this.tortfeasorPhone = data.tortfeasorPhone as string
    this.tortfeasorStreet = data.tortfeasorStreet as string
    this.tortfeasorCountry = data.tortfeasorCountry as string
    this.tortfeasorCity = data.tortfeasorCity as string
    this.tortfeasorPostalCode = data.tortfeasorPostalCode as string
    this.tortfeasorLandline = data.tortfeasorLandline as string
    this.tortfeasorVehicleLicensePlate = data.tortfeasorVehicleLicensePlate as string
    this.tortfeasorVehicleCategory = data.tortfeasorVehicleCategory as string
    this.tortfeasorVehicleBrand = data.tortfeasorVehicleBrand as string
    this.tortfeasorInformation = data.tortfeasorInformation as string
    this.tortfeasorInsuranceName = data.tortfeasorInsuranceName as string
    this.tortfeasorInsuranceNumber = data.tortfeasorInsuranceNumber as string
    this.attorneyId = data.attorneyId as string
    this.descriptionForAttorney = data.descriptionForAttorney as string
    this.appraiserId = data.appraiserId as string
    this.descriptionForAppraiser = data.descriptionForAppraiser as string
    this.carRentalId = data.carRentalId as string
    this.descriptionForCarRental = data.descriptionForCarRental as string
    this.paintShopId = data.paintShopId as string
    this.descriptionForPaintShop = data.descriptionForPaintShop as string
    this.towingServiceId = data.towingServiceId as string
    this.descriptionForTowingService = data.descriptionForTowingService as string
    this.isRkuOn = data.isRkuOn as boolean
    this.isRepairScheduleOn = data.isRepairScheduleOn as boolean
    this.createdAt = data.createdAt as Timestamp
    this.updatedAt = data.updatedAt as Timestamp
    this.userId = data.userId as string
    this.repairScheduleDoc = data.repairScheduleDoc as string
    this.costs = data.costs as Costs
    this.assignmentDoc = data.assignmentDoc as string
    this.repairConfirmId = data.repairConfirmId as string
    this.repairApproved = data.repairApproved as boolean
    this.isComplaint = data.isComplaint as boolean || false;
    this.isInsuranceValuation = data.isInsuranceValuation as boolean || false;
    this.invoiceId = data.invoiceId as string;
    this.paintShopOrderStatus = data.paintShopOrderStatus as PaintShopOrderStatus;
    this.paintShopPdfUrl = data.paintShopPdfUrl as string || "";

    Object.freeze(this);
  }
}

export default DamageModel;

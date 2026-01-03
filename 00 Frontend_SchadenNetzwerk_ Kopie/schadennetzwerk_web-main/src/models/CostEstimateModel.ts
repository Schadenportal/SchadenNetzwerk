import { Timestamp } from "firebase/firestore";

export type VehicleData = {
  customerVehicleLicensePlate: string,
  customerVehicleVINNumber: string,
  customerVehicleBrand: string,
  customerVehicleModel: string,
  customerVehicleFirstRegistration: Timestamp | null,
  customerType: "PRIVATE_CLIENT" | "CORPORATE_CLIENT",
  customerFirstName: string,
  customerLastName: string,
  customerStreet: string,
  customerCity: string,
  customerPostalCode: string,
}

class CostEstimateModel {
  costEstimationId: string;

  frontImages: string[];

  frontAngledLeftImages: string[];

  frontDriverImages: string[];

  rearAngledDriverImages: string[];

  rearFrontImages: string[];

  rearAngledPassengerImages: string[];

  frontPassengerImages: string[];

  frontRightAngledImages: string[];

  roofImages: string[];

  carBelowImages: string[];

  damageFarImages: string[];

  damageNearImages: string[];

  damageAdditionalImages: string[];

  speedometerImages: string[];

  interiorImages: string[];

  miscellaneousImages: string[];

  calculationType: string;

  preferenceType: string;

  transferCost: number;

  mechanicsHourlyRate: number;

  electricsHourlyRate: number;

  bodyworkHourlyRate: number;

  paintHourlyRate: number;

  paintingMaterialCost: number;

  sparePartSurcharge: number;

  smallPartSurchargeIndication: string;

  smallPartSurcharge: number;

  general: string;

  bodywork: string;

  paint: string;

  interior: string;

  repairedPreviousDamage: number;

  existingOldDamage: number;

  disassembled: boolean;

  roadworthy: boolean;

  roadSafe: boolean;

  remarks: string;

  repairInstructions: string

  reportFiles: string[];

  otherFiles: string[];

  creatorId: string;

  editorId: string;

  workshopId: string;

  createdAt: Timestamp;

  vehicleData: VehicleData;



  constructor(data: Record<string, any>) {
    this.costEstimationId = data.costEstimationId as string;
    this.frontImages = data.frontImages as Array<string>;
    this.frontAngledLeftImages = data.frontAngledLeftImages as Array<string>;
    this.frontDriverImages = data.frontDriverImages as Array<string>;
    this.rearAngledDriverImages = data.rearAngledDriverImages as Array<string>;
    this.rearFrontImages = data.rearFrontImages as Array<string>;
    this.rearAngledPassengerImages = data.rearAngledPassengerImages as Array<string>;
    this.frontPassengerImages = data.frontPassengerImages as Array<string>;
    this.frontRightAngledImages = data.frontRightAngledImages as Array<string>;
    this.roofImages = data.roofImages as Array<string>;
    this.carBelowImages = data.carBelowImages as Array<string>;
    this.damageFarImages = data.damageFarImages as Array<string>;
    this.damageNearImages = data.damageNearImages as Array<string>;
    this.damageAdditionalImages = data.damageAdditionalImages as Array<string>;
    this.speedometerImages = data.speedometerImages as Array<string>;
    this.interiorImages = data.interiorImages as Array<string>;
    this.miscellaneousImages = data.miscellaneousImages as Array<string>;
    this.calculationType = data.calculationType as string;
    this.preferenceType = data.preferenceType as string;
    this.transferCost = data.transferCost as number;
    this.mechanicsHourlyRate = data.mechanicsHourlyRate as number;
    this.electricsHourlyRate = data.electricsHourlyRate as number;
    this.bodyworkHourlyRate = data.bodyworkHourlyRate as number;
    this.paintHourlyRate = data.paintHourlyRate as number;
    this.paintingMaterialCost = data.paintingMaterialCost as number;
    this.sparePartSurcharge = data.sparePartSurcharge as number;
    this.smallPartSurchargeIndication = data.smallPartSurchargeIndication as string;
    this.smallPartSurcharge = data.smallPartSurcharge as number;
    this.general = data.general as string;
    this.bodywork = data.bodywork as string;
    this.paint = data.paint as string;
    this.interior = data.interior as string;
    this.repairedPreviousDamage = data.repairedPreviousDamage as number;
    this.existingOldDamage = data.existingOldDamage as number;
    this.disassembled = data.disassembled as boolean;
    this.roadworthy = data.roadworthy as boolean;
    this.roadSafe = data.roadSafe as boolean;
    this.remarks = data.remarks as string;
    this.repairInstructions = data.repairInstructions as string
    this.reportFiles = data.reportFiles as Array<string>;
    this.otherFiles = data.otherFiles as Array<string>;
    this.creatorId = data.creatorId as string;
    this.editorId = data.editorId as string;
    this.workshopId = data.workshopId as string;
    this.createdAt = data.createdAt as Timestamp;
    this.vehicleData = data.vehicleData as VehicleData;

    Object.freeze(this);
  }
}

export default CostEstimateModel;

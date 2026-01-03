import { Timestamp } from "firebase/firestore";

import { VehicleData } from "./CostEstimateModel";

type VehicleCondition = {
  general: string;
  bodywork: string;
  paint: string;
  interior: string;
  repairedPreviousDamage: number;
  existingOldDamage: number;
  disassembled: boolean;
  roadworthy: boolean;
  roadSafe: boolean;
}

type AboutVehicle = {
  numberOfOwners: number;
  isHistoryMaintained: boolean;
  lastServiceDate: Timestamp;
  vehicleKeyCount: number;
  vehicleFactor: number;
  mileage: string;
  isImported: boolean;
  importCountry: string;
  isAccidentFree: number;
  isDocAvailable: boolean;
  damageCost: number;
  isTUVDue: boolean;
  tuvDueDate: Timestamp;
}

class UsedCarModel {
  usedCarId: string;

  workshopId: string;

  vehicleData: VehicleData;

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

  vehicleCondition: VehicleCondition;

  remarks: string;

  repairInstructions: string;

  reportFiles: string[];

  otherFiles: string[];

  aboutVehicle: AboutVehicle;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.usedCarId = data.usedCarId as string;
    this.workshopId = data.workshopId as string;
    this.vehicleData = data.vehicleData as VehicleData;
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
    this.vehicleCondition = data.vehicleCondition as VehicleCondition;
    this.remarks = data.remarks as string;
    this.repairInstructions = data.repairInstructions as string;
    this.reportFiles = data.reportFiles as string[];
    this.otherFiles = data.otherFiles as string[];
    this.createdAt = data.createdAt as Timestamp;
    this.aboutVehicle = data.aboutVehicle as AboutVehicle;

    Object.freeze(this);
  }
}

export default UsedCarModel;

import { VehicleConditionTypes } from "src/types/enums";

export const costEstimationMock = {
  // general: VehicleConditionTypes.LIKE_NEW,
  // bodywork: VehicleConditionTypes.GOOD,
  // paint: VehicleConditionTypes.WELL_MAINTAINED,
  // interior: VehicleConditionTypes.MODERATE,
  // repairedPreviousDamage: 0,
  // existingOldDamage: 0,
  // disassembled: false,
  // roadworthy: true,
  // roadSafe: false,
  // // Remarks
  // remarks: "Please repair my car asap. Will be tip",
  // // Repair Instructions
  // repairInstructions: "Your mind. Don't care about that.",

  general: VehicleConditionTypes.LIKE_NEW,
  bodywork: VehicleConditionTypes.LIKE_NEW,
  paint: VehicleConditionTypes.LIKE_NEW,
  interior: VehicleConditionTypes.LIKE_NEW,
  repairedPreviousDamage: 0,
  existingOldDamage: 0,
  disassembled: false,
  roadworthy: true,
  roadSafe: false,
  // Remarks
  remarks: "",
  // Repair Instructions
  repairInstructions: "",
  // About Vehicle
  numberOfOwners: 5,
  isHistoryMaintained: false,
  lastServiceDate: new Date(),
  vehicleKeyCount: 1,
  vehicleFactor: 70,
  mileage: "1000",
  isImported: false,
  importCountry: "Germany",
  isAccidentFree: 1,
  isDocAvailable: true,
  damageCost: 0,
  isTUVDue: true,
  tuvDueDate: new Date(),
}

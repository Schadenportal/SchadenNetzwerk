import { Timestamp } from "firebase/firestore";

class TransportDamageModel {
  transportDamageId: string;

  workshopId: string;

  employee: string;

  isWaybillAvailable: boolean;

  waybillNumber: string;

  manufacturer: string;

  vin: string;

  vinImage: string[];

  transportDoc: string[];

  isVehicleDamaged: boolean;

  otherFiles: string[];

  receiverEmail: string;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.transportDamageId = data.transportDamageId as string;
    this.workshopId = data.workshopId as string;
    this.employee = data.employee as string;
    this.isWaybillAvailable = data.isWaybillAvailable as boolean;
    this.waybillNumber = data.waybillNumber as string;
    this.manufacturer = data.manufacturer as string;
    this.vin = data.vin as string;
    this.vinImage = data.vinImage as string[];
    this.transportDoc = data.transportDoc as string[];
    this.isVehicleDamaged = data.isVehicleDamaged as boolean;
    this.otherFiles = data.otherFiles as string[];
    this.receiverEmail = data.receiverEmail as string;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default TransportDamageModel;

import { Timestamp } from "firebase/firestore";

type WorkshopInfo = {
  workshopId: string;
  workshopName: string;
  workshopStreet: string;
  workshopCity: string;
  workshopPostalCode: string;
  workshopEmail: string;
  workshopPhone: string;
  workshopWhatsapp: string;
}

class ServiceTaskModel {
  serviceTaskId: string;

  taskType: string;

  notes: string;

  serviceProviderId: string;

  damageId: string;

  orderNumber: string;

  customerName: string;

  damageDate: Timestamp;

  cLicensePlate: string

  status: string;

  workshopInfo: WorkshopInfo

  constructor(data: Record<string, any>) {
    this.serviceTaskId = data.serviceTaskId as string;
    this.taskType = data.taskType as string;
    this.notes = data.notes as string;
    this.serviceProviderId = data.serviceProviderId as string;
    this.orderNumber = data.orderNumber as string;
    this.damageId = data.damageId as string;
    this.customerName = data.customerName as string;
    this.damageDate = data.damageDate as Timestamp;
    this.cLicensePlate = data.cLicensePlate as string;
    this.status = data.status as string;
    this.workshopInfo = data.workshopInfo as WorkshopInfo;

    Object.freeze(this);
  }
}

export default ServiceTaskModel;

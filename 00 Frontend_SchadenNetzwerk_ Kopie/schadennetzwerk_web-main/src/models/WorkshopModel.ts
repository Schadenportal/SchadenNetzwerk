import { Timestamp } from "firebase/firestore";

export type OtherEmailType = {
  transportEmail?: string;
  ceoEmail?: string;
  otherEmail?: string;
}

class WorkshopModel {
  workshopId: string;

  name: string;

  email: string;

  phone: string;

  whatsapp: string;

  street: string;

  city: string;

  country: string;

  postalCode: string;

  otherEmails: OtherEmailType;

  commission: number;

  setupFee: number;
  
  monthlyBaseFee: number;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.workshopId = data.workshopId as string;
    this.name = data.name as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.whatsapp = data.whatsapp as string;
    this.street = data.street as string;
    this.city = data.city as string;
    this.country = data.country as string;
    this.postalCode = data.postalCode as string;
    this.otherEmails = data.otherEmails as OtherEmailType;
    this.commission = data.commission as number;
    this.setupFee = data.setupFee as number || 0; // Default to 0 if not provided
    this.monthlyBaseFee = data.monthlyBaseFee as number || 0; // Default to 0 if not provided
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default WorkshopModel;

import { Timestamp } from "firebase/firestore";

class AgentModel {
  agentId: string;

  workshopIds: string[];

  whatsapp: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  street: string;

  country: string;

  city: string;

  postalCode: string;

  commission: number;

  commissionType: string;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.agentId = data.agentId as string;
    this.workshopIds = data.workshopIds as string[];
    this.whatsapp = data.whatsapp as string;
    this.firstName = data.firstName as string;
    this.lastName = data.lastName as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.street = data.street as string;
    this.city = data.city as string;
    this.postalCode = data.postalCode as string;
    this.country = data.country as string;
    this.commission = data.commission as number;
    this.commissionType = data.commissionType as string;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default AgentModel;

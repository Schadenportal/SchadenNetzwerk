import { Timestamp } from "firebase/firestore";

class ServiceProviderModel {
  serviceProviderId: string;

  serviceType: string;

  workshopIds: string[];

  name: string;

  email: string;

  phone: string;

  telephone: string;

  whatsapp: string;

  commission: number;

  setupFee: number;

  needSendContract: boolean;

  street: string;

  city: string;

  country: string;

  postalCode: string;

  isDisabled: boolean;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.serviceProviderId = data.serviceProviderId as string;
    this.serviceType = data.serviceType as string;
    this.workshopIds = data.workshopIds as string[];
    this.name = data.name as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.telephone = data.telephone as string;
    this.commission = data.commission as number;
    this.setupFee = data.setupFee as number || 0; // Default to 0 if not provided
    this.needSendContract = data.needSendContract as boolean;
    this.whatsapp = data.whatsapp as string;
    this.street = data.street as string;
    this.city = data.city as string;
    this.country = data.country as string;
    this.postalCode = data.postalCode as string;
    this.isDisabled = data.isDisabled as boolean;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default ServiceProviderModel;

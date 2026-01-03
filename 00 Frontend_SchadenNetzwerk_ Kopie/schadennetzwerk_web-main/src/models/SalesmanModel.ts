import { Timestamp } from "firebase/firestore";

class SalesmanModel {
  salesmanId: string;

  workshopIds: string[];

  whatsapp: string;

  commission: number;

  name: string;

  email: string;

  phone: string;

  salesmanNumber: string;

  street: string;

  country: string;

  city: string;

  postalCode: string;

  needSendContract: boolean;

  isAppraiserToo: boolean;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.salesmanId = data.salesmanId as string;
    this.workshopIds = data.workshopIds as string[];
    this.commission = data.commission as number;
    this.whatsapp = data.whatsapp as string;
    this.name = data.name as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.salesmanNumber = data.salesmanNumber as string;
    this.street = data.street as string;
    this.city = data.city as string;
    this.postalCode = data.postalCode as string;
    this.country = data.country as string;
    this.isAppraiserToo = data.isAppraiserToo as boolean;
    this.needSendContract = data.needSendContract as boolean;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default SalesmanModel;

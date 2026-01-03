import { Timestamp } from "firebase/firestore";

class ServiceAdviserModel {
  adviserId: string;

  workshopId: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  whatsapp: string;

  street: string;

  country: string;

  city: string;

  postalCode: string;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.adviserId = data.adviserId as string;
    this.workshopId = data.workshopId as string;
    this.firstName = data.firstName as string;
    this.lastName = data.lastName as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.whatsapp = data.whatsapp as string;
    this.street = data.street as string;
    this.country = data.country as string;
    this.city = data.city as string;
    this.postalCode = data.postalCode as string;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default ServiceAdviserModel;

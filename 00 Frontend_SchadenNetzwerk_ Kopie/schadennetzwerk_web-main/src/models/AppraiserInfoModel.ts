import { Timestamp } from "firebase/firestore";

type AddressInfo = {
  street: string;

  city: string;

  country: string;

  postalCode: string;
}

class AppraiserInfoModel {
  appraiserId: string;

  appraiserInfoId: string;

  name: string;

  companyName: string;

  email: string;

  phone: string;

  address: AddressInfo;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.appraiserId = data.appraiserId as string;
    this.appraiserInfoId = data.appraiserInfoId as string;
    this.name = data.name as string;
    this.companyName = data.companyName as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.address = data.address as AddressInfo;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default AppraiserInfoModel;

import { Timestamp } from "firebase/firestore";

class RepairConfirmationModel {
  damageId: string;

  repairConfirmId?: string;

  firstName?: string;

  lastName?: string;

  captureDate?: string;

  address?: {
    street: string;
    city: string;
    postalCode: string;
  };

  licensePlate?: string;

  vin?: string;

  images: {
    frontImages: string[];
    rearImages: string[];
    distanceImages: string[];
    closeImages: string[];
    vehicleDocumentImages: string[];
    otherImages: string[];
  };

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.damageId = data.damageId as string;
    this.repairConfirmId = data.repairConfirmId as string;
    this.firstName = data.firstName as string;
    this.lastName = data.lastName as string;
    this.captureDate = data.captureDate as string;
    this.address = data.address as {
      street: string;
      city: string;
      postalCode: string;
    };
    this.licensePlate = data.licensePlate as string;
    this.vin = data.vin as string;
    this.images = data.images as {
      frontImages: string[];
      rearImages: string[];
      distanceImages: string[];
      closeImages: string[];
      vehicleDocumentImages: string[];
      otherImages: string[];
    };
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default RepairConfirmationModel;

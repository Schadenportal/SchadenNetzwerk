import { Timestamp } from "firebase/firestore";

type DamageInfo = {
  orderNumber: string,
  customer: string,
  licensePlate: string,
  vehicleBrand: string,
  customerEmail: string,
}

class RepairPlanDocModel {
  damageId: string;

  repairPlanDocId: string;

  fileUrl: string;

  createdAt: Timestamp;

  damageInfo: DamageInfo

  constructor(data: Record<string, any>) {
    this.damageId = data.damageId as string;
    this.repairPlanDocId = data.repairPlanDocId as string;
    this.fileUrl = data.fileUrl as string;
    this.createdAt = data.createdAt as Timestamp;
    this.damageInfo = data.damageInfo as DamageInfo;

    Object.freeze(this);
  }
}

export default RepairPlanDocModel;

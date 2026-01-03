import { Timestamp } from 'firebase/firestore';

class DamageInvoiceModel {
  damageInvoiceInfoId?: string;

  damageId: string;

  invoiceTotal: number;

  deductionAmount: number;

  invoiceNumber: string;

  claimNumber: string;

  insuranceCompany: string;

  workshopName: string;

  vehicleOwner: string;

  invoiceDate?: Timestamp | null;

  deductionDate?: Timestamp | null;

  deductionReason: string;

  insuranceContact: string;

  legalAction: string;

  files: string[];

  decisionComment: string;

  constructor(data: Record<string, any>) {
    this.damageInvoiceInfoId = data.damageInvoiceInfoId as string;
    this.damageId = data.damageId as string;
    this.invoiceTotal = data.invoiceTotal as number || 0;
    this.deductionAmount = data.deductionAmount as number || 0;
    this.invoiceNumber = data.invoiceNumber as string || '';
    this.claimNumber = data.claimNumber as string || '';
    this.insuranceCompany = data.insuranceCompany as string || '';
    this.workshopName = data.workshopName as string || '';
    this.vehicleOwner = data.vehicleOwner as string || '';
    this.invoiceDate = data.invoiceDate as Timestamp || null;
    this.deductionDate = data.deductionDate as Timestamp || null;
    this.deductionReason = data.deductionReason as string || '';
    this.insuranceContact = data.insuranceContact as string || '';
    this.legalAction = data.legalAction as string || '';
    this.files = data.files as string[] || [];
    this.decisionComment = data.decisionComment as string || '';

    Object.freeze(this);
  }
}

export default DamageInvoiceModel;

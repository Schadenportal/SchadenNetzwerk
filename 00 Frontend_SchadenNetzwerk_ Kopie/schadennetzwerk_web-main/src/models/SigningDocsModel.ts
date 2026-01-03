import { Timestamp } from "firebase/firestore";

class SigningDocsModel {
  signingDocId: string;

  serviceProviderId: string;

  docCategory: string;

  serviceType: string;

  fileName: string;

  status: string;

  fileURL: string;

  isContract: boolean;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.signingDocId = data.signingDocId as string;
    this.serviceProviderId = data.serviceProviderId as string;
    this.docCategory = data.docCategory as string;
    this.serviceType = data.serviceType as string;
    this.status = data.status as string;
    this.fileName = data.fileName as string;
    this.isContract = data.isContract as boolean;
    this.fileURL = data.fileURL as string;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default SigningDocsModel;

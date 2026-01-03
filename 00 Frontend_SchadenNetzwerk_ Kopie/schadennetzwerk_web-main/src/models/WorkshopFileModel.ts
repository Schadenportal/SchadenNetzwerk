import { Timestamp } from 'firebase/firestore';

export type FileInfo = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  url: string;
};

class WorkshopFileModel {
  workshopId: string;

  files: FileInfo[];

  constructor(data: Record<string, any>) {
    this.workshopId = data.workshopId as string || '';
    this.files = (data.files as FileInfo[]) || [];

    Object.freeze(this);
  }
}

export default WorkshopFileModel;

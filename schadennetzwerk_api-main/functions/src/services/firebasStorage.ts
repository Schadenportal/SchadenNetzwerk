import { bucket } from "../views/config";
import { getDownloadURL } from "firebase-admin/storage";

export const uploadBufferFile = async (filePath: string, content: Buffer) => {
  const fileRef = bucket.file(filePath);
  await fileRef.save(content);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

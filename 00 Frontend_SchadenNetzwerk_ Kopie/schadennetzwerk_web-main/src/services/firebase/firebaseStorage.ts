import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

import firebaseApp from "./firebaseApp";

const firebaseStorage = getStorage(firebaseApp);

export const uploadFile = async (file: File, directoryPath: string) => {
  try {
    const storageRef = ref(firebaseStorage, directoryPath);
    const result = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(result.ref);
    return downloadURL;
  } catch (error) {
    return null;
  }
};

export const getFileNameFromURL = (url: string) => {
  const httpsRef = ref(firebaseStorage, url);
  return httpsRef.name;
}

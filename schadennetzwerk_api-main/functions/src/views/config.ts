import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v1";

import {
  COLLECTION_SERVICE_PROVIDERS,
  COLLECTION_USERS,
  COLLECTION_WORKSHOPS,
  COLLECTION_WORKSHOP_FILES,
  COLLECTION_SALESMAN,
  COLLECTION_DAMAGE,
  COLLECTION_DAMAGE_INVOICE_INFO,
  COLLECTION_SIGNING_DOCS,
  COLLECTION_SERVICE_TASK,
  COLLECTION_CALCULATION_DATA,
  COLLECTION_COST_ESTIMATES,
  COLLECTION_TRANSPORT_DAMAGE,
  COLLECTION_SUPPORT,
  COLLECTION_DAMAGE_FILES,
  COLLECTION_USED_CAR,
  COLLECTION_SERVICE_ADVISER,
  COLLECTION_CONTRACT_DOCS,
  COLLECTION_APPRAISER_INFO,
  COLLECTION_REPAIR_DOCUMENTS,
  COLLECTION_AGENT,
  COLLECTION_CHAT_ROOM,
  COLLECTION_CHAT_MESSAGE,
  COLLECTION_CHAT_GROUP,
  COLLECTION_NOTIFICATION,
  COLLECTION_REPAIR_CONFIRMATION,
} from "../constants";

initializeApp({
  storageBucket: "schadennetzwerk-7dc39.appspot.com",
});
export const db = getFirestore();
export const bucket = getStorage().bucket();

export const usersCollection = db.collection(COLLECTION_USERS);
export const workShopCollection = db.collection(COLLECTION_WORKSHOPS);
export const workshopFilesCollection = db.collection(COLLECTION_WORKSHOP_FILES);
export const serviceProviderCollection = db.collection(COLLECTION_SERVICE_PROVIDERS);
export const salesmanCollection = db.collection(COLLECTION_SALESMAN);
export const agentCollection = db.collection(COLLECTION_AGENT);
export const serviceAdviserCollection = db.collection(COLLECTION_SERVICE_ADVISER);
export const damageCollection = db.collection(COLLECTION_DAMAGE);
export const damageInvoiceInfoCollection = db.collection(COLLECTION_DAMAGE_INVOICE_INFO);
export const repairConfirmationCollection = db.collection(COLLECTION_REPAIR_CONFIRMATION);
export const signingDocCollection = db.collection(COLLECTION_SIGNING_DOCS);
export const contractDocCollection = db.collection(COLLECTION_CONTRACT_DOCS);
export const serviceTaskCollection = db.collection(COLLECTION_SERVICE_TASK);
export const calculationDataCollection = db.collection(COLLECTION_CALCULATION_DATA);
export const costEstimationDataCollection = db.collection(COLLECTION_COST_ESTIMATES);
export const usedCarCollection = db.collection(COLLECTION_USED_CAR);
export const transportDamageDataCollection = db.collection(COLLECTION_TRANSPORT_DAMAGE);
export const supportDataCollection = db.collection(COLLECTION_SUPPORT);
export const damageFileCollection = db.collection(COLLECTION_DAMAGE_FILES);
export const appraiserCollection = db.collection(COLLECTION_APPRAISER_INFO);
export const repairDocCollection = db.collection(COLLECTION_REPAIR_DOCUMENTS);
export const chatRoomCollection = db.collection(COLLECTION_CHAT_ROOM);
export const chatMessageCollection = db.collection(COLLECTION_CHAT_MESSAGE);
export const chatGroupCollection = db.collection(COLLECTION_CHAT_GROUP);
export const notificationCollection = db.collection(COLLECTION_NOTIFICATION);

export const getDocumentInfo = async (
  collectionName: string,
  documentId: string,
) => {
  if (!documentId) {
    return null;
  }
  const ref = db.collection(collectionName).doc(documentId);
  return ref.get().then((doc) => {
    if (doc.exists) {
      return doc.data();
    } else {
      return null;
    }
  }).catch((exception) => {
    logger.info("getDocumentInfo : exception - " + exception);
    return null;
  });
};

export const getDamageFileInfo = async (damageId: string, category: string, subCategory: string) => {
  logger.error("====== Getting related damage file info =====", damageId, category, subCategory);
  try {
    const query = db.collection(COLLECTION_DAMAGE_FILES)
      .where("damageId", "==", damageId)
      .where("category", "==", category)
      .where("subCategory", "==", subCategory);
    const querySnap = await query.get();
    if (querySnap.empty) {
      logger.error("====== Empty Query Snap =====");
      return null;
    }
    if (querySnap.size === 1) {
      logger.info("======Query Siz is 1=====");
      return querySnap.docs[0].data();
    }
    logger.error("====== Query Snap size is bigger than 1=====");
    return null;
  } catch (error) {
    logger.error("===Getting file info error===", error);
    return null;
  }
};

export const getFBDocumentWithParam = async (collectionName: string, filedName: string, fieldValue: string) => {
  const query = db.collection(collectionName).where(filedName, "==", fieldValue);
  const querySnap = await query.get();
  if (querySnap.empty) {
    return null;
  }
  if (querySnap.size === 1) {
    return querySnap.docs[0].data();
  }
  return null;
};

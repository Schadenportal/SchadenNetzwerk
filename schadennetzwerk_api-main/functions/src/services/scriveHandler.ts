import { ContractDocTypes, DamageDocCategory, DocumentTypes, ServiceTaskTypes } from "../types/enums";
import axios from "axios";
import { logger } from "firebase-functions/v1";
import FormData = require("form-data");
import { bucket, contractDocCollection, damageCollection, getDocumentInfo, getFBDocumentWithParam, signingDocCollection } from "../views/config";
import { COLLECTION_DAMAGE, COLLECTION_SERVICE_PROVIDERS, COLLECTION_WORKSHOPS, commissionContractDocPlacement } from "../constants";
import { getScriveDocPlacement } from "../utils/functionUtils";
import { FieldValue } from "firebase-admin/firestore";
import { getDownloadURL } from "firebase-admin/storage";
import { sendAppraiserNotificationsAndEmail } from "../views";

const adminEmail = "roll@justizcar.de";
const adminPhone = "+491711553999";
const apiCallbackUrl = "https://apis-x77ef4jf7q-ey.a.run.app/sign_doc";

const defaultHeader = {
  // eslint-disable-next-line max-len
  "Authorization": `OAuth oauth_consumer_key="${process.env.SCRIVE_API_TOKEN}", oauth_token="${process.env.SCRIVE_ACCESS_TOKEN}", oauth_signature_method="PLAINTEXT", oauth_signature="${process.env.SCRIVE_API_SECRET}&${process.env.SCRIVE_ACCESS_SECRET}"`,
};

export const makeCommissionContractSignatureFile = async (
  appraiserId: string,
  type: ContractDocTypes,
  file: Buffer,
  fileName: string,
  name: string,
  email: string,
  phone: string) => {
  try {
    const docId: string = await initializeDocument(file, fileName);
    await addSignatoryDataForCommissionContract(docId, name, email, phone);
    const parties = await startSigning(docId);
    if (parties && parties.length) {
      const signingParty: any = parties.find((it: any) => it.signatory_role === "signing_party");
      await saveContractData(appraiserId, type, signingParty.api_delivery_url, docId, fileName);
      return signingParty.api_delivery_url as string;
    }
    return null;
  } catch (error) {
    logger.debug("==Catching Error==", error);
    return null;
  }
};

export const makeSignatureFile = async (
  damageInfo: Record<string, any>,
  serviceProviderId: string,
  category: DamageDocCategory,
  file: Buffer,
  fileName: string,
  isContract = false,
  serviceTaskType?: ServiceTaskTypes) => {
  try {
    const docId: string = await initializeDocument(file, fileName);
    await addSignatoryData(damageInfo, docId, category, isContract, serviceTaskType);
    const parties = await startSigning(docId);
    if (parties && parties.length) {
      const signingParty: any = parties.find((it: any) => it.signatory_role === "signing_party");
      await saveDocumentData(damageInfo.damageId, serviceProviderId, signingParty.api_delivery_url, docId, fileName, category, isContract, serviceTaskType);
      return signingParty.api_delivery_url as string;
    }
    return null;
  } catch (error) {
    logger.debug("==Catching Error==", error);
    return null;
  }
};

const initializeDocument = async (file: Buffer, fileName: string) => {
  const formData = new FormData();
  formData.append("file", file, { filename: fileName });
  const headers = {
    ...defaultHeader,
    "Content-Type": "multipart/form-data",
  };
  return await axios.post(`${process.env.SCRIVE_API_URL}/documents/new`, formData, { headers })
    .then((res) => {
      logger.info("===Initializing doc result===", res.data);
      return res.data.id;
    })
    .catch((err) => {
      logger.debug("==Initializing Error==", err);
      throw err;
    });
};

const addSignatoryData = async (damageInfo: Record<string, any>, docId: string, category: DamageDocCategory, isContract: boolean, serviceTaskType?: ServiceTaskTypes) => {
  let viewerEmail = "";
  let viewerPhone = "";
  if (category === DamageDocCategory.DAMAGE) {
    const workshop = await getDocumentInfo(COLLECTION_DAMAGE, damageInfo.workshopId);
    if (workshop) {
      viewerEmail = workshop.email;
      viewerPhone = workshop.phone;
    }
  } else {
    if (serviceTaskType) {
      let serviceId = "";
      switch (serviceTaskType) {
        case ServiceTaskTypes.APPRAISER_TASK:
          serviceId = damageInfo.appraiserId;
          break;
        case ServiceTaskTypes.ATTORNEY_TASK:
          serviceId = damageInfo.attorneyId;
          break;
        case ServiceTaskTypes.CAR_RENTAL_TASK:
          serviceId = damageInfo.carRentalId;
          break;
        case ServiceTaskTypes.PAINT_SHOP_TASK:
          serviceId = damageInfo.paintShopId;
          break;
        case ServiceTaskTypes.TOWING_SERVICE_TASK:
          serviceId = damageInfo.towingServiceId;
          break;
        default:
          serviceId = "";
          break;
      }
      if (serviceId !== "") {
        const service = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, serviceId);
        if (service) {
          viewerEmail = service.email;
          viewerPhone = service.phone;
        }
      }
    }
  }
  // Get document placement
  const docPlacement = getScriveDocPlacement(isContract, serviceTaskType);
  if (!docPlacement) {
    throw new Error("Placement is missing");
  }
  // Make params
  const params =
  {
    document:
      JSON.stringify({
        id: docId,
        parties: [
          {},
          {
            signatory_role: "signing_party",
            delivery_method: "api",
            fields: [
              { type: "name", order: 1, value: damageInfo.customerFirstName },
              { type: "name", order: 2, value: damageInfo.customerLastName },
              { type: "email", value: damageInfo.customerEmail },
              { type: "mobile", value: damageInfo.customerPhone },
              ...docPlacement,
            ],
          },
          {
            signatory_role: "viewer",
            delivery_method: "api",
            is_author: true,
            fields: [
              { type: "email", value: viewerEmail },
              { type: "mobile", value: viewerPhone },
            ],
          },
          // For the testing purpose
          {
            signatory_role: "viewer",
            delivery_method: "api",
            is_author: false,
            fields: [
              { type: "email", value: "dhero@justizcar.de" },
              { type: "mobile", value: "+8613714486044" },
            ],
          },
        ],
        api_callback_url: apiCallbackUrl,
      }),
    document_id: docId,
  };
  // Make API call
  const headers = {
    ...defaultHeader,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  await axios.post(`${process.env.SCRIVE_API_URL}/documents/${docId}/update`, params, { headers })
    .then((res) => {
      logger.info("===Updating doc result===", res.data);
    })
    .catch((err) => {
      logger.debug("==Updating Error==", err);
      throw err;
    });
};

export const addSignatoryDataForCommissionContract = async (docId: string, name: string, signerEmail: string, signerPhone: string) => {
  // Make params
  const params =
  {
    document:
      JSON.stringify({
        id: docId,
        parties: [
          {},
          {
            signatory_role: "signing_party",
            delivery_method: "api",
            fields: [
              { type: "name", order: 1, value: name },
              { type: "name", order: 2, value: name },
              { type: "email", value: signerEmail },
              { type: "mobile", value: signerPhone },
              ...commissionContractDocPlacement,
            ],
          },
          {
            signatory_role: "viewer",
            delivery_method: "api",
            is_author: true,
            fields: [
              { type: "email", value: adminEmail },
              { type: "mobile", value: adminPhone },
            ],
          },
        ],
        api_callback_url: apiCallbackUrl,
      }),
    document_id: docId,
  };
  // Make API call
  const headers = {
    ...defaultHeader,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  await axios.post(`${process.env.SCRIVE_API_URL}/documents/${docId}/update`, params, { headers })
    .then((res) => {
      logger.info("===Updating doc result===", res.data);
    })
    .catch((err) => {
      logger.debug("==Updating Error==", err);
      throw err;
    });
};


export const fetchAndSaveDocFile = async (fileName: string, docId: string, signingDocId: string, damageId?: string | null | undefined) => {
  await axios.get(`${process.env.SCRIVE_API_URL}/documents/${docId}/files/main/${fileName}`,
    {
      headers: defaultHeader,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    .then(async (res) => {
      logger.info("===Updating doc result===", res.data);
      const filePath = `signed_docs/${fileName}.pdf`;
      logger.info("=====Saved Bytes PDF=====", filePath);
      const fileRef = bucket.file(filePath);
      await fileRef.save(res.data);
      const downloadURL = await getDownloadURL(fileRef);
      await signingDocCollection.doc(signingDocId).set({ fileURL: downloadURL, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      // if damageId is not null or undefined and fileName starts with rku_, update damage collection
      if (damageId) {
        const damageDoc = await getDocumentInfo(COLLECTION_DAMAGE, damageId);
        if (damageDoc) {
          if (fileName.startsWith("rku_")) {
            await damageCollection.doc(damageId).set({ assignmentDoc: downloadURL, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
          }
          // Send notification to workshop
          const workshop = await getFBDocumentWithParam(COLLECTION_WORKSHOPS, "workshopId", damageDoc.workshopId);
          if (workshop) {
            sendAppraiserNotificationsAndEmail([{ email: workshop.email, id: workshop.userId }], damageDoc, undefined, undefined);
          }
        }
      }
    })
    .catch((err) => {
      logger.debug("==Updating Error==", err);
      throw err;
    });
};

export const fetchAndSaveDocFileForContract = async (fileName: string, docId: string, contractDocId: string) => {
  await axios.get(`${process.env.SCRIVE_API_URL}/documents/${docId}/files/main/${fileName}`,
    {
      headers: defaultHeader,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    .then(async (res) => {
      const filePath = `contract_docs/${fileName}.pdf`;
      const fileRef = bucket.file(filePath);
      await fileRef.save(res.data);
      const downloadURL = await getDownloadURL(fileRef);
      await contractDocCollection.doc(contractDocId).set({ fileURL: downloadURL, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    })
    .catch((err) => {
      logger.debug("==Updating Error==", err);
      throw err;
    });
};

const startSigning = async (docId: string) => {
  const headers = { ...defaultHeader };
  return await axios.post(`${process.env.SCRIVE_API_URL}/documents/${docId}/start`, { document_id: docId }, { headers })
    .then((res) => {
      logger.info("===Start signing doc result===", res.data);
      return res.data.parties;
    })
    .catch((err) => {
      logger.debug("==Start signing Error==", err);
      throw err;
    });
};

const saveContractData = async (
  dealerOrWorkshopId: string,
  contractType: ContractDocTypes,
  apiUrl: string,
  scriveDocRef: string,
  fileName: string,
) => {
  const docRef = contractDocCollection.doc();
  const dbData: Record<string, any> = {
    contractDocId: docRef.id,
    dealerOrWorkshopId,
    contractType,
    fileName,
    apiDeliveryUrl: apiUrl,
    scriveDocRef,
    status: DocumentTypes.PENDING,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: null,
  };
  await docRef.set(dbData, { merge: true });
};

const saveDocumentData = async (
  damageId: string,
  serviceProviderId: string,
  apiUrl: string,
  scriveDocRef: string,
  fileName: string,
  docCategory: DamageDocCategory,
  isContract: boolean,
  serviceType?: ServiceTaskTypes,
) => {
  const serviceTaskType = serviceType ? serviceType : "";
  const docRef = signingDocCollection.doc();
  const dbData: Record<string, any> = {
    signingDocId: docRef.id,
    serviceProviderId,
    docCategory,
    serviceType: serviceTaskType,
    fileName,
    isContract,
    apiDeliveryUrl: apiUrl,
    damageId,
    scriveDocRef,
    status: DocumentTypes.PENDING,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: null,
  };
  await docRef.set(dbData, { merge: true });
};

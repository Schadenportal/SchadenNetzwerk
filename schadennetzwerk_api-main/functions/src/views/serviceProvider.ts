import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, schemaValidationMiddleware, adminRoleMiddleWare, authMiddleware } from "../middlewares";
import { editServiceProviderModel, IDisableActionModel, IUpdateWorkshopInfoModel } from "../models";
import { checkFieldDuplicated } from "../utils/firestoreValidators";
import {
  FIELD_NAME,
  FIELD_EMAIL,
  FIELD_PHONE,
  COLLECTION_SERVICE_PROVIDERS,
  EmailAlreadyExists,
  PhoneAlreadyExists,
  InvalidParams,
  SameServiceProviderNameAlreadyExists,
  ServiceProviderDoesNotExist,
  COLLECTION_USERS,
  UnexpectedError,
  COLLECTION_SALESMAN,
  FIELD_USER_ID,
  SCRIVE_BASE_URL,
  CONTRACT_CONFIRMATION_EMAIL,
} from "../constants";
import { generateKeywords } from "../utils";
import { serviceProviderCollection, getDocumentInfo, getFBDocumentWithParam, salesmanCollection } from "./config";
import { StatusCode } from "../types";
import { ContractDocTypes, QueryResultType, ServiceProviderType } from "../types/enums";
import salesAdminRoleMiddleWare from "../middlewares/salesAdminRoleMiddleware";
import { updateSalesmanFromAppraiser, updateUserBasicInfo } from "./eventTriggers";
import { checkAuthIsUsed } from "../utils/functionUtils";
import { CONTRACT_FILE_URL, generateCommissionContractPdf } from "../services/pdfHandler";
import dayjs from "dayjs";
import { makeCommissionContractSignatureFile } from "../services/scriveHandler";
import { sendMailgunEmail } from "../services/emailSender";

export const removeServiceProvider = onCall(
  { region: "europe-west3" },
  withMiddlewares([salesAdminRoleMiddleWare],
    async (request) => {
      logger.info("removeServiceProvider: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.serviceProviderId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, data.serviceProviderId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: ServiceProviderDoesNotExist };
      }
      await serviceProviderCollection.doc(data.serviceProviderId).delete();
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const updateWorkshopInfo = onCall(
  { region: "europe-west3" },
  withMiddlewares([salesAdminRoleMiddleWare],
    async (request) => {
      logger.info("updateWorkshopInfo: ", request.data, { structuredData: true });
      const data = request.data as IUpdateWorkshopInfoModel;
      try {
        await Promise.all(data.serviceProviderIds.map(async (serviceProviderId) => {
          const oldInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, serviceProviderId);
          if (oldInfo) {
            // Check if salesman with this userId exists and Update salesman info
            const salesmanInfo = oldInfo.serviceType === ServiceProviderType.APPRAISER ? await getFBDocumentWithParam(COLLECTION_SALESMAN, FIELD_USER_ID, oldInfo.userId) : null;
            if (data.isAdd) {
              await serviceProviderCollection.doc(serviceProviderId).update({ workshopIds: FieldValue.arrayUnion(data.workshopId) });
              if (salesmanInfo) {
                await salesmanCollection.doc(salesmanInfo.salesmanId).update({ workshopIds: FieldValue.arrayUnion(data.workshopId) });
              }
            } else {
              await serviceProviderCollection.doc(serviceProviderId).update({ workshopIds: FieldValue.arrayRemove(data.workshopId) });
              if (salesmanInfo) {
                await salesmanCollection.doc(salesmanInfo.salesmanId).update({ workshopIds: FieldValue.arrayRemove(data.workshopId) });
              }
            }
          }
        }));
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (error) {
        logger.error("updateWorkshopInfo: ", error);
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR, msg: UnexpectedError };
      }
    }
  )
);

export const setServiceProvider = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [salesAdminRoleMiddleWare, schemaValidationMiddleware(editServiceProviderModel)],
    async (request) => {
      logger.info("create Service Provider: ", request.data, { structuredData: true });
      const data = request.data;
      // If update =>
      let id = "";
      if (data.serviceProviderId) {
        id = data.serviceProviderId;
      }
      logger.info("===id===", id);
      if (!id) {
        const isAuthUsed = await checkAuthIsUsed(data.email);
        if (isAuthUsed.isUsed) {
          logger.debug("Email is already in use by user ", isAuthUsed.uid);
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: EmailAlreadyExists };
        }
      }
      // Check if it's duplicated or not
      const nameCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SERVICE_PROVIDERS, FIELD_NAME, data.name, "serviceProviderId", id);
      if (nameCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: nameCheck, msg: SameServiceProviderNameAlreadyExists };
      }
      const emailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SERVICE_PROVIDERS, FIELD_EMAIL, data.email, "serviceProviderId", id);
      if (emailCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: emailCheck, msg: EmailAlreadyExists };
      }
      // Check if user email is duplicated or not when create new
      if (id === "") {
        const userEmailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_USERS, FIELD_EMAIL, data.email);
        if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
          return { status: 403, result: userEmailCheck, msg: EmailAlreadyExists };
        }
      }
      const phoneCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SERVICE_PROVIDERS, FIELD_PHONE, data.phone, "serviceProviderId", id);
      if (phoneCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: phoneCheck, msg: PhoneAlreadyExists };
      }
      //
      const dbData = {
        ...data,
        nameKeyList: generateKeywords(data.name),
        emailKeyList: generateKeywords(data.email),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.serviceProviderId) {// Update
        const oldInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, data.serviceProviderId);
        if (!oldInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        // Check if user email is duplicated or not when update
        if (oldInfo && oldInfo.email !== data.email) {
          const userEmailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_USERS, FIELD_EMAIL, data.email);
          if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
            return { status: 403, result: userEmailCheck, msg: EmailAlreadyExists };
          }
        }
        // Update user basic info
        await updateUserBasicInfo(data, oldInfo.userId);
        // Check if salesman with this userId exists and Update salesman info
        const salesmanInfo = await getFBDocumentWithParam(COLLECTION_SALESMAN, FIELD_USER_ID, oldInfo.userId);
        if (salesmanInfo) {
          await updateSalesmanFromAppraiser(data, salesmanInfo);
        }
        //
        docRef = serviceProviderCollection.doc(data.serviceProviderId);
      } else {// Create new
        docRef = serviceProviderCollection.doc();
        dbData.serviceProviderId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const handleServiceProviderInfo = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("handleServiceProviderInfo: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.serviceProviderId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const serviceProviderInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, data.serviceProviderId);
      if (!serviceProviderInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: ServiceProviderDoesNotExist };
      }
      // Send data protection agreement URL to contract files to Appraiser and Attorney
      if (Object.prototype.hasOwnProperty.call(data, "sendContract") && data.sendContract === true) {
        if (serviceProviderInfo.serviceType === ServiceProviderType.APPRAISER || serviceProviderInfo.serviceType === ServiceProviderType.ATTORNEY) {
          const contractFiles: Record<string, string>[] = [];
          // Push DataProtection URL to contract files
          contractFiles.push({ doc_name: "Datenschutzvereinbarung(Data Protection Agreement)", doc_url: CONTRACT_FILE_URL });
          // Make commission contract PDF and send to Scrive
          if (serviceProviderInfo.needSendContract) {
            const commissionFile = await generateCommissionContractPdf(serviceProviderInfo);
            if (commissionFile) {
              const commissionFileName = `Vereinbarung-Provision_${dayjs(new Date()).format("YYYYMMDDHHmmss")}.pdf`;
              const commissionContractUrl = await makeCommissionContractSignatureFile(
                data.serviceProviderId,
                ContractDocTypes.APPRAISER_COMMISSION_CONTRACT,
                commissionFile,
                commissionFileName,
                serviceProviderInfo.name,
                serviceProviderInfo.email,
                serviceProviderInfo.phone);
              if (commissionContractUrl) {
                contractFiles.push({ doc_name: "Provisionsvereinbarung(Commission Agreement)", doc_url: `${SCRIVE_BASE_URL}${commissionContractUrl}` });
              }
            }
          }
          logger.debug("===Email contract files===", contractFiles);
          // Send contract and commission email
          if (contractFiles.length) {
            await sendMailgunEmail(
              [serviceProviderInfo.email],
              "Provisionsverbeinbarung zur digitalen Unterzeichnung",
              CONTRACT_CONFIRMATION_EMAIL,
              { data: contractFiles },
            );
          }
        }
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const disableServiceProvider = onCall(
  { region: "europe-west3" },
  withMiddlewares([adminRoleMiddleWare],
    async (request) => {
      logger.info("disableServiceProvider: ", request.data, { structuredData: true });
      const data = request.data as IDisableActionModel;
      if (!data.serviceProviderId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, data.serviceProviderId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: ServiceProviderDoesNotExist };
      }
      await serviceProviderCollection.doc(data.serviceProviderId).update({ isDisabled: data.isDisabled });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

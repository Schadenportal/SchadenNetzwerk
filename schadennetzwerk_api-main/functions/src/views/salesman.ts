import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, schemaValidationMiddleware, adminRoleMiddleWare } from "../middlewares";
import { editSalesmanModel } from "../models";
import { checkFieldDuplicated } from "../utils/firestoreValidators";
import {
  FIELD_EMAIL,
  FIELD_SALESMAN_NUMBER,
  EmailAlreadyExists,
  InvalidParams,
  SalesmanNumberAlreadyExists,
  COLLECTION_SALESMAN,
  SalesmanDoesNotExist,
  COLLECTION_USERS,
  COLLECTION_SERVICE_PROVIDERS,
  FIELD_USER_ID,
} from "../constants";
import {
  generateKeywords,
  // generateRandPassword,
} from "../utils";
import { salesmanCollection, getDocumentInfo, getFBDocumentWithParam } from "./config";
import { StatusCode } from "../types";
import { QueryResultType } from "../types/enums";
import { updateServiceProviderFromSalesman, updateUserBasicInfo } from "./eventTriggers";
import { checkAuthIsUsed, generateUniqueId } from "../utils/functionUtils";

export const removeSalesman = onCall(
  { region: "europe-west3" },
  withMiddlewares([adminRoleMiddleWare],
    async (request) => {
      logger.info("remove salesman: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.salesmanId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_SALESMAN, data.salesmanId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: SalesmanDoesNotExist };
      }
      await salesmanCollection.doc(data.salesmanId).delete();
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const getSalesmanNumber = onCall(
  { region: "europe-west3" },
  withMiddlewares([adminRoleMiddleWare],
    async () => {
      const salesmanNumber = generateUniqueId();
      logger.info("getSalesmanNumber: ", salesmanNumber);
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, data: { salesmanNumber } };
    }
  )
);

export const setSalesman = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [adminRoleMiddleWare, schemaValidationMiddleware(editSalesmanModel)],
    async (request) => {
      logger.info("create Salesman: ", request.data, { structuredData: true });
      const data = request.data;
      // If update =>
      let id = "";
      if (data.salesmanId) {
        id = data.salesmanId;
      }
      if (!id) {
        const isAuthUsed = await checkAuthIsUsed(data.email);
        if (isAuthUsed.isUsed) {
          logger.debug("Email is already in use by user ", isAuthUsed.uid);
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: EmailAlreadyExists };
        }
      }
      // Check if it's duplicated or not
      const salesmanNumberCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SALESMAN, FIELD_SALESMAN_NUMBER, data.salesmanNumber, "salesmanId", id);
      if (salesmanNumberCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: salesmanNumberCheck, msg: SalesmanNumberAlreadyExists };
      }
      const emailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SALESMAN, FIELD_EMAIL, data.email, "salesmanId", id);
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
      //
      const dbData = {
        ...data,
        nameKeyList: generateKeywords(data.name),
        numberKeyList: generateKeywords(data.salesmanNumber),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.salesmanId) {// Update
        const oldInfo = await getDocumentInfo(COLLECTION_SALESMAN, data.salesmanId);
        if (!oldInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        if (oldInfo && oldInfo.email !== data.email) {
          const userEmailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_USERS, FIELD_EMAIL, data.email);
          if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
            return { status: 403, result: userEmailCheck, msg: EmailAlreadyExists };
          }
        }
        // Update user basic info
        await updateUserBasicInfo(data, oldInfo.userId);
        // Check if Appraiser exists with this email address and Update Appraiser info
        const appraiserInfo = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, FIELD_USER_ID, oldInfo.userId);
        if (appraiserInfo) {
          logger.debug("===found appraiserInfo===", appraiserInfo);
          await updateServiceProviderFromSalesman(data, appraiserInfo);
        }
        //
        docRef = salesmanCollection.doc(data.salesmanId);
      } else {// Create new
        // Create a new user
        // Add to Salesman Doc
        docRef = salesmanCollection.doc();
        dbData.salesmanId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

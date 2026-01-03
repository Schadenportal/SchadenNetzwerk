import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, schemaValidationMiddleware } from "../middlewares";
import { IServiceAdviserModel, ServiceAdviserModel } from "../models";
import {
  InvalidParams,
  COLLECTION_SERVICE_ADVISER,
  DoseNotExist,
  EmailAlreadyExists,
  FIELD_EMAIL,
  COLLECTION_USERS,
  FIELD_PHONE,
  PhoneAlreadyExists,
} from "../constants";
import {
  generateKeywords,
} from "../utils";
import { getDocumentInfo, serviceAdviserCollection } from "./config";
import { StatusCode } from "../types";
import { QueryResultType } from "../types/enums";
import authMiddleWare from "../middlewares/authMiddleware";
import { checkAuthIsUsed } from "../utils/functionUtils";
import { checkFieldDuplicated } from "../utils/firestoreValidators";
import { updateUserBasicInfo } from "./eventTriggers";

export const removeServiceAdviser = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleWare],
    async (request) => {
      logger.info("remove service adviser: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.adviserId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_SERVICE_ADVISER, data.adviserId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: DoseNotExist };
      }
      await serviceAdviserCollection.doc(data.adviserId).delete();
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const setServiceAdviser = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [authMiddleWare, schemaValidationMiddleware(ServiceAdviserModel)],
    async (request) => {
      logger.info("create Service Adviser: ", request.data, { structuredData: true });
      const data = request.data as IServiceAdviserModel;
      const id = data.adviserId || "";

      // Check auth usage for new advisers
      if (!id) {
        const isAuthUsed = await checkAuthIsUsed(data.email);
        if (isAuthUsed.isUsed) {
          logger.debug("Email is already in use by user ", isAuthUsed.uid);
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: EmailAlreadyExists };
        }
      }

      const emailCheck: QueryResultType = await checkFieldDuplicated(
        COLLECTION_SERVICE_ADVISER,
        FIELD_EMAIL,
        data.email,
        "adviserId",
        id
      );
      if (emailCheck !== QueryResultType.RESULT_SUCCESS) {
        return {
          status: 403,
          result: emailCheck,
          msg: EmailAlreadyExists,
        };
      }

      // Check user email duplication for new advisers
      if (id === "") {
        const userEmailCheck: QueryResultType = await checkFieldDuplicated(
          COLLECTION_USERS,
          FIELD_EMAIL,
          data.email
        );
        if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
          return {
            status: 403,
            result: userEmailCheck,
            msg: EmailAlreadyExists,
          };
        }
      }

      const phoneCheck: QueryResultType = await checkFieldDuplicated(
        COLLECTION_SERVICE_ADVISER,
        FIELD_PHONE,
        data.phone,
        "adviserId",
        id
      );
      if (phoneCheck !== QueryResultType.RESULT_SUCCESS) {
        return {
          status: 403,
          result: phoneCheck,
          msg: PhoneAlreadyExists,
        };
      }

      // Prepare data for database
      const dbData: Record<string, any> = {
        ...data,
        nameKeyList: generateKeywords(`${data.firstName} ${data.lastName}`),
        emailKeyList: generateKeywords(data.email),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };

      let docRef: FirebaseFirestore.DocumentReference;
      if (id) {
        // Update existing adviser
        const oldInfo = await getDocumentInfo(COLLECTION_SERVICE_ADVISER, id);
        if (!oldInfo) {
          return {
            status: 404,
            result: QueryResultType.RESULT_NOT_EXIST,
            msg: InvalidParams,
          };
        }

        // Check user email duplication when updating email
        if (oldInfo && oldInfo.email !== data.email) {
          const userEmailCheck: QueryResultType = await checkFieldDuplicated(
            COLLECTION_USERS,
            FIELD_EMAIL,
            data.email
          );
          if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
            return {
              status: 403,
              result: userEmailCheck,
              msg: EmailAlreadyExists,
            };
          }
        }

        // Update user basic info
        await updateUserBasicInfo(data, oldInfo.userId);
        docRef = serviceAdviserCollection.doc(id);
      } else {
        // Create new adviser
        docRef = serviceAdviserCollection.doc();
        dbData.adviserId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, schemaValidationMiddleware, salesAdminRoleMiddleWare } from "../middlewares";
import { checkFieldDuplicated } from "../utils/firestoreValidators";
import {
  FIELD_EMAIL,
  EmailAlreadyExists,
  InvalidParams,
  SalesmanDoesNotExist,
  COLLECTION_USERS,
  COLLECTION_AGENT,
} from "../constants";
import {
  generateKeywords,
  // generateRandPassword,
} from "../utils";
import { agentCollection, getDocumentInfo } from "./config";
import { StatusCode } from "../types";
import { QueryResultType } from "../types/enums";
import { updateUserBasicInfo } from "./eventTriggers";
import { IEditAgentModel, editAgentModel } from "../models/agent";

export const removeAgent = onCall(
  { region: "europe-west3" },
  withMiddlewares([salesAdminRoleMiddleWare],
    async (request) => {
      logger.info("remove agent: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.agentId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_AGENT, data.agentId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: SalesmanDoesNotExist };
      }
      await agentCollection.doc(data.agentId).delete();
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const setAgent = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [salesAdminRoleMiddleWare, schemaValidationMiddleware(editAgentModel)],
    async (request) => {
      logger.info("create Agent: ", request.data, { structuredData: true });
      const data = request.data as IEditAgentModel;
      // If update =>
      let id = "";
      if (data.agentId) {
        id = data.agentId;
      }
      const emailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_AGENT, FIELD_EMAIL, data.email, "agentId", id);
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
      const dbData: Record<string, any> = {
        ...data,
        nameKeyList: generateKeywords(data.firstName + " " + data.lastName),
        emailKeyList: generateKeywords(data.email),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.agentId) {// Update
        const oldInfo = await getDocumentInfo(COLLECTION_AGENT, data.agentId);
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
        await updateUserBasicInfo(data, oldInfo.userId, true);
        //
        docRef = agentCollection.doc(data.agentId);
      } else {// Create new
        // Create a new user
        // Add to Salesman Doc
        docRef = agentCollection.doc();
        dbData.agentId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

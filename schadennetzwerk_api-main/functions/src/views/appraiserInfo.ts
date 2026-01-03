import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, authMiddleware } from "../middlewares";
import {
  InvalidParams,
  COLLECTION_SERVICE_PROVIDERS,
  YouDoNotHaveEnoughPermission,
  COLLECTION_APPRAISER_INFO,
} from "../constants";
import { appraiserCollection, getDocumentInfo } from "./config";
import { StatusCode } from "../types";
import { QueryResultType, ServiceProviderType } from "../types/enums";
import { IAppraiserInfoModel } from "../models";

export const setAppraiserInfo = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      try {
        logger.info("set appraiser info: ", request.data, { structuredData: true });
        const data = request.data as IAppraiserInfoModel;
        // Get service provider info first and check if it's appraiser
        const serviceProviderInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, data.appraiserId);
        if (!serviceProviderInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        if (serviceProviderInfo.serviceType !== ServiceProviderType.APPRAISER) {
          return { status: 400, result: QueryResultType.RESULT_NOT_EXIST, msg: YouDoNotHaveEnoughPermission };
        }
        // Create db structure
        const dbData: Record<string, unknown> = {
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        };
        let docRef: FirebaseFirestore.DocumentReference;
        if (data.appraiserInfoId) { // Update
          const oldInfo = await getDocumentInfo(COLLECTION_APPRAISER_INFO, data.appraiserInfoId);
          if (!oldInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          docRef = appraiserCollection.doc(data.appraiserInfoId);
        } else { // Create
          docRef = appraiserCollection.doc();
          dbData.createdAt = FieldValue.serverTimestamp();
          dbData.appraiserInfoId = docRef.id;
        }
        await docRef.set(dbData, { merge: true });
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (err) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR };
      }
    }
  )
);

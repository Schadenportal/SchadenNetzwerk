import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { StatusCode } from "../types";
import { withMiddlewares, authMiddleware, schemaValidationMiddleware } from "../middlewares";
import { calculationDataModel, CostEstimationModel, ICostEstimationModel, ISetCalculationDataModel } from "../models/calculationData";
import { calculationDataCollection, costEstimationDataCollection, getDocumentInfo } from "./config";
import { COLLECTION_CALCULATION_DATA, COLLECTION_COST_ESTIMATES, COLLECTION_USERS, DoseNotExist, InvalidParams, PermissionDenied, YouDoNotHaveEnoughPermission } from "../constants";
import { QueryResultType } from "../types/enums";
import { FieldValue } from "firebase-admin/firestore";

export const setCalculationDefaultData = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware, schemaValidationMiddleware(calculationDataModel)],
    async (request) => {
      try {
        logger.info("setCalculationDefaultData: ", request.data, { structuredData: true });
        const user = request.auth!;
        const data = request.data as ISetCalculationDataModel;
        const dbData: Record<string, unknown> = {
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        };
        let docRef: FirebaseFirestore.DocumentReference;
        if (data.calculationId) { // Update
          const oldInfo = await getDocumentInfo(COLLECTION_CALCULATION_DATA, data.calculationId);
          if (!oldInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          docRef = calculationDataCollection.doc(data.calculationId);
        } else { // Create
          docRef = calculationDataCollection.doc();
          dbData.createdAt = FieldValue.serverTimestamp();
          dbData.calculationId = docRef.id;
          dbData.userId = user.token.uid;
        }
        await docRef.set(dbData, { merge: true });
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (err) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR };
      }
    }
  )
);

export const setCostEstimationData = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware, schemaValidationMiddleware(CostEstimationModel)],
    async (request) => {
      try {
        logger.info("set cost estimation data: ", request.data, { structuredData: true });
        const user = request.auth!;
        const data = request.data as ICostEstimationModel;
        const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
        if (!userInfo || !userInfo.workshopIds.length) {
          return { status: 400, result: QueryResultType.RESULT_NOT_EXIST, msg: YouDoNotHaveEnoughPermission };
        }
        const dbData: Record<string, unknown> = {
          ...data,
          editorId: user.token.uid,
          updatedAt: FieldValue.serverTimestamp(),
        };
        let docRef: FirebaseFirestore.DocumentReference;
        if (data.costEstimationId) { // Update
          const oldInfo = await getDocumentInfo(COLLECTION_COST_ESTIMATES, data.costEstimationId);
          if (!oldInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          docRef = costEstimationDataCollection.doc(data.costEstimationId);
        } else { // Create
          docRef = costEstimationDataCollection.doc();
          dbData.createdAt = FieldValue.serverTimestamp();
          dbData.costEstimationId = docRef.id;
          dbData.creatorId = user.token.uid;
        }
        await docRef.set(dbData, { merge: true });
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (err) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR };
      }
    }
  )
);

export const removeCostEstimation = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("remove cost estimation: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data;
      if (!data.costEstimationId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: FirebaseFirestore.DocumentData | null | undefined = await getDocumentInfo(COLLECTION_COST_ESTIMATES, data.costEstimationId);
      // Only delete if the current user is Creator or Editor
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: DoseNotExist };
      }
      if (oldInfo.creatorId === user.uid || oldInfo.editorId === user.uid) {
        await costEstimationDataCollection.doc(data.costEstimationId).delete();
      } else {
        return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

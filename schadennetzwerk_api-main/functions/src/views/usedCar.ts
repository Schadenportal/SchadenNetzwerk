import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { StatusCode } from "../types";
import { withMiddlewares, authMiddleware, schemaValidationMiddleware } from "../middlewares";
import { getDocumentInfo, usedCarCollection } from "./config";
import { COLLECTION_USED_CAR, COLLECTION_USERS, DoseNotExist, InvalidParams, PermissionDenied, YouDoNotHaveEnoughPermission } from "../constants";
import { QueryResultType } from "../types/enums";
import { FieldValue } from "firebase-admin/firestore";
import { IUsedCarModelModel, UsedCarModel } from "../models";

export const setUsedCarData = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware, schemaValidationMiddleware(UsedCarModel)],
    async (request) => {
      try {
        logger.info("set used car data: ", request.data, { structuredData: true });
        const user = request.auth!;
        const data = request.data as IUsedCarModelModel;
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
        if (data.usedCarId) { // Update
          const oldInfo = await getDocumentInfo(COLLECTION_USED_CAR, data.usedCarId);
          if (!oldInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          docRef = usedCarCollection.doc(data.usedCarId);
        } else { // Create
          docRef = usedCarCollection.doc();
          dbData.createdAt = FieldValue.serverTimestamp();
          dbData.usedCarId = docRef.id;
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

export const removeUsedCar = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("remove used car: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data;
      if (!data.usedCarId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: FirebaseFirestore.DocumentData | null | undefined = await getDocumentInfo(COLLECTION_USED_CAR, data.usedCarId);
      // Only delete if the current user is Creator or Editor
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: DoseNotExist };
      }
      if (oldInfo.creatorId === user.uid || oldInfo.editorId === user.uid) {
        await usedCarCollection.doc(data.usedCarId).delete();
      } else {
        return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

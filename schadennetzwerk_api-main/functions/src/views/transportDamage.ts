import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { StatusCode } from "../types";
import { withMiddlewares, authMiddleware, schemaValidationMiddleware } from "../middlewares";
import { ITransportDamageModel, transportDamageModel } from "../models";
import { getDocumentInfo, transportDamageDataCollection } from "./config";
import { COLLECTION_TRANSPORT_DAMAGE, COLLECTION_USERS, YouDoNotHaveEnoughPermission, InvalidParams, DoseNotExist, PermissionDenied } from "../constants";
import { QueryResultType, UserRole } from "../types/enums";
import { FieldValue } from "firebase-admin/firestore";

export const setTransportDamageData = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware, schemaValidationMiddleware(transportDamageModel)],
    async (request) => {
      try {
        logger.info("set transport damage data: ", request.data, { structuredData: true });
        const user = request.auth!;
        const data = request.data as ITransportDamageModel;
        const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
        if (!userInfo || !userInfo.workshopIds.length) {
          return { status: 400, result: QueryResultType.RESULT_NOT_EXIST, msg: YouDoNotHaveEnoughPermission };
        }
        const dbData: Record<string, unknown> = {
          ...data,
          userId: user.token.uid,
          updatedAt: FieldValue.serverTimestamp(),
        };
        let docRef: FirebaseFirestore.DocumentReference;
        if (data.transportDamageId) { // Update
          const oldInfo = await getDocumentInfo(COLLECTION_TRANSPORT_DAMAGE, data.transportDamageId);
          if (!oldInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          docRef = transportDamageDataCollection.doc(data.transportDamageId);
        } else { // Create
          docRef = transportDamageDataCollection.doc();
          dbData.createdAt = FieldValue.serverTimestamp();
          dbData.transportDamageId = docRef.id;
        }
        await docRef.set(dbData, { merge: true });
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (err) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR };
      }
    }
  )
);

export const removeTransportDamage = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("remove transport damage: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data;
      if (!data.transportDamageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: FirebaseFirestore.DocumentData | null | undefined = await getDocumentInfo(COLLECTION_TRANSPORT_DAMAGE, data.transportDamageId);
      // Only delete if the current user is Creator or Editor
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: DoseNotExist };
      }
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        logger.error("====== User doesn't exist ========");
        return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
      }
      if (userInfo.role === UserRole.Admin || oldInfo.userId === user.uid) {
        await transportDamageDataCollection.doc(data.transportDamageId).delete();
      } else {
        return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

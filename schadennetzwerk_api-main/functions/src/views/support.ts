import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, authMiddleware } from "../middlewares";
import {
  InvalidParams,
  COLLECTION_SUPPORT,
} from "../constants";
import { getDocumentInfo, supportDataCollection } from "./config";
import { StatusCode } from "../types";
import { QueryResultType } from "../types/enums";
import { ISupportModel } from "../models";

export const createSupportTicket = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      try {
        logger.info("set support data: ", request.data, { structuredData: true });
        const user = request.auth!;
        const data = request.data as ISupportModel;
        const dbData: Record<string, unknown> = {
          ...data,
          userId: user.token.uid,
          updatedAt: FieldValue.serverTimestamp(),
        };
        let docRef: FirebaseFirestore.DocumentReference;
        if (data.supportId) { // Update
          const oldInfo = await getDocumentInfo(COLLECTION_SUPPORT, data.supportId);
          if (!oldInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          docRef = supportDataCollection.doc(data.supportId);
        } else { // Create
          docRef = supportDataCollection.doc();
          dbData.createdAt = FieldValue.serverTimestamp();
          dbData.supportId = docRef.id;
        }
        await docRef.set(dbData, { merge: true });
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (err) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR };
      }
    }
  )
);

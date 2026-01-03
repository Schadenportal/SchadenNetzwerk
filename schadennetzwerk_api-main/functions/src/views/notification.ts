import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { authMiddleware, withMiddlewares } from "../middlewares";
import { NotificationActionTypes, QueryResultType } from "../types/enums";
import { InvalidParams } from "../constants";
import { notificationCollection, db } from "./config";

export const updateNotification = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      logger.info("update notification: ", request.data, { structuredData: true });
      const data = request.data;
      try {
        if (data.isUpdateStatus) {
          if (!data.notificationIds || data.notificationIds.length < 1) {
            return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
          }
          const batch = db.batch();
          await Promise.all(data.notificationIds.map(async (notificationId: string) => {
            const notificationRef = notificationCollection.doc(notificationId);
            const updateData: any = {
              updatedAt: FieldValue.serverTimestamp(),
            };
            if (data.actionType === NotificationActionTypes.AS_DELETE) {
              batch.delete(notificationRef);
            } else {
              if (data.actionType === NotificationActionTypes.AS_READ) {
                updateData.isUnread = false;
              }
              if (data.actionType === NotificationActionTypes.AS_ARCHIVE) {
                updateData.isUnread = false;
                updateData.isArchived = true;
              }
              batch.update(notificationRef, { ...updateData });
            }
          }));
          await batch.commit();
          return { status: 200, result: QueryResultType.RESULT_SUCCESS };
        }
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      } catch (error) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR };
      }
    }
  )
);

import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, serviceProviderRestrictedMiddleWare } from "../middlewares";
import {
  InvalidParams,
  COLLECTION_SERVICE_TASK,
} from "../constants";
import { getDocumentInfo, serviceTaskCollection } from "./config";
import { StatusCode } from "../types";
import { QueryResultType } from "../types/enums";

export const updateServiceTaskStatus = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [serviceProviderRestrictedMiddleWare],
    async (request) => {
      // Params {serviceTaskId, status}
      logger.info("Updating service task: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.serviceTaskId) {
        return { status: 404, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const serviceTask = await getDocumentInfo(COLLECTION_SERVICE_TASK, data.serviceTaskId);
      if (!serviceTask) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      const dbData: Record<string, any> = {
        ...serviceTask,
        updatedAt: FieldValue.serverTimestamp(),
      };
      dbData.status = data.status;
      const docRef = serviceTaskCollection.doc(data.serviceTaskId);
      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

import { db } from "../views/config";
import { FIELD_EMAIL, FIELD_NAME, FIELD_PHONE, FIELD_SALESMAN_NUMBER } from "../constants";
import { QueryResultType } from "../types/enums";
import * as logger from "firebase-functions/logger";

export const checkFieldDuplicated = async (collectionName: string, fieldPath: string, value: string, primaryKeyPath = "", primaryValue = "") => {
  let result: QueryResultType = QueryResultType.RESULT_UNKNOWN_ERROR;
  try {
    const query = primaryKeyPath !== "" && primaryValue !== "" ?
      db.collection(collectionName)
        .where(primaryKeyPath, "!=", primaryValue)
        .where(fieldPath, "==", value) :
      db.collection(collectionName).where(fieldPath, "==", value);
    const querySnap = await query.get();
    logger.debug("Getting data ===", collectionName, querySnap.empty);
    logger.debug("Getting data res ===", querySnap.empty);
    if (querySnap.empty) {
      result = QueryResultType.RESULT_SUCCESS;
    } else {
      if (fieldPath === FIELD_NAME) {
        result = QueryResultType.RESULT_DUPLICATED_NAME;
      } else if (fieldPath === FIELD_PHONE) {
        result = QueryResultType.RESULT_DUPLICATED_PHONE;
      } else if (fieldPath === FIELD_EMAIL) {
        result = QueryResultType.RESULT_DUPLICATED_EMAIL;
      } else if (fieldPath === FIELD_SALESMAN_NUMBER) {
        result = QueryResultType.RESULT_DUPLICATED_SALESMAN_NUMBER;
      }
    }
  } catch (error) {
    logger.info("Dublication Validatiion Error: ==", error);
  }
  return result;
};

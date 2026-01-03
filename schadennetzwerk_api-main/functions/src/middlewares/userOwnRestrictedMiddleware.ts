import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types/middleware";
import { getDocumentInfo } from "../views/config";
import { COLLECTION_USERS, InvalidParams, PermissionDenied } from "../constants";

const usrOwnRestrictedMiddleWare: Middleware = async (request, next) => {
  logger.info("usrOwnRestrictedMiddleware: ", request.auth, { structuredData: true });
  const user = request.auth;
  if (!user?.uid) {
    throw new HttpsError("unauthenticated", "Unauthorized.");
  }
  // Get UserInfo first
  const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
  if (!userInfo) {
    logger.error("== middle ware User doesn't exist ========");
    throw new HttpsError("invalid-argument", InvalidParams);
  }
  if (userInfo.userId !== user.uid) {
    throw new HttpsError("permission-denied", PermissionDenied);
  }

  return next(request);
};

export default usrOwnRestrictedMiddleWare;

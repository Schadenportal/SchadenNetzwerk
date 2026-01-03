import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types/middleware";
import { getDocumentInfo } from "../views/config";
import { COLLECTION_USERS, InvalidParams, YouDoNotHaveEnoughPermission } from "../constants";
import { UserRole } from "../types/enums";

const adminRoleMiddleWare: Middleware = async (request, next) => {
  logger.info("adminRoleMiddleware: ", request.auth, { structuredData: true });
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
  if (userInfo.role !== UserRole.Admin) {
    throw new HttpsError("permission-denied", YouDoNotHaveEnoughPermission);
  }

  return next(request);
};

export default adminRoleMiddleWare;

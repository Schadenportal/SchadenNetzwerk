import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types/middleware";
import { getDocumentInfo } from "../views/config";
import { ADMIN_ROLES, COLLECTION_USERS, InvalidParams, YouDoNotHaveEnoughPermission } from "../constants";

const salesAdminRoleMiddleWare: Middleware = async (request, next) => {
  logger.info("salesAdminRoleMiddleWare: ", request.auth, { structuredData: true });
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
  if (ADMIN_ROLES.includes(userInfo.role)) {
    return next(request);
  }
  throw new HttpsError("permission-denied", YouDoNotHaveEnoughPermission);
};

export default salesAdminRoleMiddleWare;

import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types/middleware";
import { getDocumentInfo, getFBDocumentWithParam } from "../views/config";
import { COLLECTION_SERVICE_PROVIDERS, COLLECTION_USERS, DAMAGE_ROLES, InvalidParams, YourAccountSuspended, YouDoNotHaveEnoughPermission } from "../constants";
import { ServiceProviderType } from "../types/enums";

const damageCreationMiddleWare: Middleware = async (request, next) => {
  logger.info("damageCreationMiddleware: ", request.auth, { structuredData: true });
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
  // If user is admin role, then allow to create damage
  if (DAMAGE_ROLES.includes(userInfo.role)) {
    return next(request);
  }
  // Get service provider info from userInfo.userId, allow only appraiser and attorney to create damage
  const serviceProviderInfo = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, "userId", userInfo.userId);
  if (serviceProviderInfo && serviceProviderInfo.isDisabled) {
    throw new HttpsError("unavailable", YourAccountSuspended);
  }
  if (serviceProviderInfo &&
    (serviceProviderInfo.serviceType === ServiceProviderType.APPRAISER ||
      serviceProviderInfo.serviceType === ServiceProviderType.ATTORNEY ||
      serviceProviderInfo.serviceType === ServiceProviderType.PAINT_SHOP
    )
  ) {
    return next(request);
  }
  throw new HttpsError("permission-denied", YouDoNotHaveEnoughPermission);
};

export default damageCreationMiddleWare;

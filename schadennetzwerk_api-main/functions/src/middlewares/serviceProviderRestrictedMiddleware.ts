import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types/middleware";
import { getFBDocumentWithParam } from "../views/config";
import { COLLECTION_SERVICE_PROVIDERS, FIELD_USER_ID, InvalidParams, YourAccountSuspended } from "../constants";

const serviceProviderRestrictedMiddleWare: Middleware = async (request, next) => {
  logger.info("serviceProviderRestrictedMiddleware: ", request.auth, { structuredData: true });
  const user = request.auth;
  if (!user?.uid) {
    throw new HttpsError("unauthenticated", "Unauthorized.");
  }
  // Get ServiceProvider Info first
  const serviceProviderInfo = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, FIELD_USER_ID, user.uid);
  if (!serviceProviderInfo) {
    logger.error("== middle ware Service Provider doesn't exist ========");
    throw new HttpsError("invalid-argument", InvalidParams);
  }
  if (serviceProviderInfo.isDisabled) {
    throw new HttpsError("unavailable", YourAccountSuspended);
  }

  return next(request);
};

export default serviceProviderRestrictedMiddleWare;

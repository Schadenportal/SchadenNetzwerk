import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types/middleware";

const authMiddleWare: Middleware = (request, next) => {
  logger.info("authMiddleware: ", request.auth, { structuredData: true });
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Unauthorized.");
  }

  return next(request);
};

export default authMiddleWare;

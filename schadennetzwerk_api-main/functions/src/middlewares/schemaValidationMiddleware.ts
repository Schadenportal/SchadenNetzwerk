import * as Joi from "@hapi/joi";
import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { Middleware } from "../types";

const schemaValidationMiddleware: (schema: Joi.ObjectSchema) => Middleware = (schema) => {
  return (request, next) => {
    logger.info("schemaValidationMiddleware: ", request.auth, request.data, {
      structuredData: true,
    });
    const validation = schema.validate(request.data);
    logger.info("schemaValidationMiddleware: validation", validation, {
      structuredData: true,
    });
    if (validation.error) {
      throw new HttpsError("invalid-argument", validation.error.message);
    }
    logger.info("schemaValidationMiddleware: no error", validation.value, {
      structuredData: true,
    });
    request.data = validation.value;

    return next(request);
  };
};

export default schemaValidationMiddleware;

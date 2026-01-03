import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { Handler, Middleware } from "../types/middleware";

export const withMiddlewares = <T = any>(middlewares: Middleware<T>[], handler: Handler<T>) => {
  return (request: CallableRequest<T>) => {
    const chainMiddlewares = ([firstMiddleware, ...restOfMiddlewares]: Middleware<T>[]) => {
      if (firstMiddleware) {
        return (innerRequest: CallableRequest<T>) => {
          try {
            return firstMiddleware(innerRequest, chainMiddlewares(restOfMiddlewares));
          } catch (error) {
            throw new HttpsError("failed-precondition", "not passed middlewares");
          }
        };
      }
      return handler;
    };

    return chainMiddlewares(middlewares)(request);
  };
};

export { default as authMiddleware } from "./authMiddleware";
export { default as schemaValidationMiddleware } from "./schemaValidationMiddleware";
export { default as adminRoleMiddleWare } from "./adminRoleMiddleware";
export { default as userOwnRestrictedMiddleware } from "./userOwnRestrictedMiddleware";
export { default as serviceProviderRestrictedMiddleWare } from "./serviceProviderRestrictedMiddleware";
export { default as salesAdminRoleMiddleWare } from "./salesAdminRoleMiddleware";
export { default as damageCreationMiddleWare } from "./damageCreationMiddleware";
export { default as lawyerRoleMiddleWare } from "./lawyerRoleMiddleware";
export { lawyerAndWorkshopRoleMiddleWare as lawyerAndWorkshopRoleMiddleWare } from "./lawyerRoleMiddleware";

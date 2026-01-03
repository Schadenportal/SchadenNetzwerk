import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {
  withMiddlewares,
  authMiddleware,
  schemaValidationMiddleware,
  userOwnRestrictedMiddleware,
} from "../middlewares";
import {
  createUserModel,
  ICreateUserModel,
  updateUserModel,
  IUpdateUserModel,
  userAuthModel,
  IUserAuthModel,
} from "../models/user";
import { getAuth } from "firebase-admin/auth";
import { generateKeywords } from "../utils";
import { usersCollection, getDocumentInfo, db } from "./config";
import { StatusCode } from "../types";
import { COLLECTION_USERS, FIELD_EMAIL, InvalidParams, SomethingWentWrong } from "../constants";
import { QueryResultType } from "../types/enums";

export const createUser = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [authMiddleware, schemaValidationMiddleware(createUserModel)],
    async (request) => {
      logger.info("createUser: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as ICreateUserModel;
      const dbData = {
        ...data,
        userId: user.token.uid,
        email: user.token.email!,
        fullName: `${data.firstName} ${data.lastName}`,
        nameKeyList: generateKeywords(`${data.firstName} ${data.lastName}`),
        emailKeyList: generateKeywords(user.token.email!),
        deletedAt: null,
        isDisabled: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await usersCollection.doc(user.uid).set(dbData);
      return { status: StatusCode.Success };
    }
  )
);

export const updateUser = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [userOwnRestrictedMiddleware, schemaValidationMiddleware(updateUserModel)],
    async (request) => {
      logger.info("updateUser: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as IUpdateUserModel;
      // Get UserInfo first
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const updatedUser = {
        ...userInfo,
        ...data,
        isUpdatedFromOthers: false,
        fullName: `${data.firstName} ${data.lastName}`,
        nameKeyList: generateKeywords(`${data.firstName} ${data.lastName}`),
        emailKeyList: generateKeywords(data.email),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await usersCollection.doc(user.uid).set(updatedUser, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const updateUserStatus = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [userOwnRestrictedMiddleware],
    async (request) => {
      logger.info("updateUserStatus: ", request.data, { structuredData: true });
      const user = request.auth!;
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const data = request.data;
      if (userInfo && userInfo.userStatus && userInfo.userStatus.isOnline === data.isOnline) {
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      }
      // User info detail
      const ip = request.rawRequest.headers["x-forwarded-for"] ||
        request.rawRequest.connection.remoteAddress ||
        request.rawRequest.socket.remoteAddress || null;
      const userAgentString = request.rawRequest.headers["user-agent"];
      const statusData: Record<string, any> = {
        lastLoginAt: FieldValue.serverTimestamp(),
        lastLoginIp: ip,
        isOnline: data.isOnline,
        lastLoginUserAgent: userAgentString,
      };
      logger.debug("statusData: ", statusData);
      //
      const updatedUser = {
        userStatus: statusData,
        updatedAt: FieldValue.serverTimestamp(),
      };
      await usersCollection.doc(user.uid).set(updatedUser, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const changeAuthUser = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [userOwnRestrictedMiddleware, schemaValidationMiddleware(userAuthModel)],
    async (request) => {
      logger.info("change password: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as IUserAuthModel;
      // Get UserInfo first
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const option: Record<string, any> = {};
      if (data.isDisable !== null) {
        option.disabled = data.isDisable;
      }
      if (data.password !== null) {
        option.password = data.password;
      }
      await getAuth()
        .updateUser(user.uid, option)
        .then(async (userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          if (userRecord.disabled) {
            const updatedUser = {
              ...userInfo,
              deletedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            };
            await usersCollection.doc(user.uid).set(updatedUser, { merge: true });
            return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
          }
          return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
        })
        .catch((error) => {
          logger.error("=======Updating User error=====", error);
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: SomethingWentWrong };
        });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const disableOrEnableUserAccount = async (uid: string, isDisable: boolean) => {
  await getAuth()
    .updateUser(uid, {
      disabled: isDisable,
    })
    .then(async (userRecord) => {
      let updatedUserData;
      if (userRecord.disabled) {
        updatedUserData = {
          deletedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
      } else {
        updatedUserData = {
          deletedAt: null,
          updatedAt: FieldValue.serverTimestamp(),
        };
      }
      await usersCollection.doc(uid).set(updatedUserData, { merge: true });
    })
    .catch((error) => {
      logger.error("=======Updating User error=====", error);
    });
};

export const deleteUser = async (uid: string) => {
  await getAuth()
    .deleteUser(uid)
    .then(async () => {
      logger.debug("Successfully deleted user");
    })
    .catch((error) => {
      logger.error("Error deleting user:", error);
    });
};

export const getUserByEmail = async (email: string) => {
  const query = db.collection(COLLECTION_USERS).where(FIELD_EMAIL, "==", email);
  const querySnap = await query.get();
  if (querySnap.empty) {
    return null;
  }
  return querySnap;
};

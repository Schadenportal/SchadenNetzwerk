import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { authMiddleware, schemaValidationMiddleware, withMiddlewares } from "../middlewares";
import { IChatMessageModel, IChatRoomModel, chatMessageModel, chatRoomModel } from "../models";
import { chatMessageCollection, chatRoomCollection, getDocumentInfo, getFBDocumentWithParam, notificationCollection, usersCollection } from "./config";
import { COLLECTION_CHAT_GROUP, COLLECTION_CHAT_MESSAGE, COLLECTION_CHAT_ROOM, COLLECTION_USERS, ChatRoomAlreadyExists, InvalidParams } from "../constants";
import { QueryResultType, UserRole } from "../types/enums";
import { StatusCode } from "../types";

export const setChatRoom = onCall({ region: "europe-west3" },
  withMiddlewares(
    [authMiddleware, schemaValidationMiddleware(chatRoomModel)],
    async (request) => {
      logger.info("create ChatRoom: ", request.data, { structuredData: true });
      const data = request.data as IChatRoomModel;
      const dbData: Record<string, unknown> = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.chatRoomId) {// Update
        const oldInfo = await getDocumentInfo(COLLECTION_CHAT_ROOM, data.chatRoomId);
        if (oldInfo === null) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        docRef = chatRoomCollection.doc(data.chatRoomId);
      } else {// Create new
        // Check if it's duplicated or not
        const partnerId = data.participants.filter((participant) => participant !== data.creator);
        const chatRoom = await chatRoomCollection
          .where("creator", "==", data.creator)
          .where("type", "==", "ONE_TO_ONE")
          .where("participants", "array-contains", partnerId)
          .get();
        if (!chatRoom.empty) {
          return { status: 403, result: QueryResultType.RESULT_ALREADY_EXIST, msg: ChatRoomAlreadyExists };
        }
        docRef = chatRoomCollection.doc();
        dbData.chatRoomId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, data: dbData };
    }
  )
);

export const deleteChatRoom = onCall({ region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      try {
        logger.info("delete ChatRoom: ", request.data, { structuredData: true });
        const data = request.data;
        if (!data.chatRoomId) {
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
        }
        const oldInfo = await getDocumentInfo(COLLECTION_CHAT_ROOM, data.chatRoomId);
        if (!oldInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        if (oldInfo.creator !== request.auth?.uid) {
          return { status: 403, result: QueryResultType.RESULT_NOT_ALLOWED, msg: InvalidParams };
        }
        await chatRoomCollection.doc(data.chatRoomId).delete();
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      } catch (error) {
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR, msg: InvalidParams };
      }
    }
  )
);

export const updateChatReadTime = onCall({ region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      logger.info("updateChatReadTime: ", request.data, { structuredData: true });
      const data = request.data;
      const user = request.auth!;
      if (!data.chatRoomId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_CHAT_ROOM, data.chatRoomId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      if (!oldInfo.participants.includes(user.uid)) {
        return { status: 403, result: QueryResultType.RESULT_NOT_ALLOWED, msg: InvalidParams };
      }
      const myReadAt: Record<string, unknown> = {
        [user.uid]: FieldValue.serverTimestamp(),
      };
      let readAts: null | Record<string, any> = null;
      readAts = oldInfo.readAts ? { ...oldInfo.readAts, ...myReadAt } : myReadAt;
      if (readAts) {
        await chatRoomCollection.doc(data.chatRoomId).set({ readAts, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        // Remove notification
        const notification = await notificationCollection
          .where("chatRoomId", "==", data.chatRoomId)
          .where("receiverId", "==", user.uid)
          .get();
        if (!notification.empty) {
          notification.forEach((doc) => {
            doc.ref.delete();
          });
        }
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      }
      return { status: 403, result: QueryResultType.RESULT_UNEXPECTED_ERROR, msg: InvalidParams };
    }
  )
);

export const setChatMessage = onCall({ region: "europe-west3" },
  withMiddlewares(
    [authMiddleware, schemaValidationMiddleware(chatMessageModel)],
    async (request) => {
      logger.info("create ChatMessage: ", request.data, { structuredData: true });
      const data = request.data as IChatMessageModel;
      const dbData: Record<string, unknown> = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.chatMessageId) {// Update
        const oldInfo = await getDocumentInfo(COLLECTION_CHAT_MESSAGE, data.chatMessageId);
        if (oldInfo === null) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        docRef = chatMessageCollection.doc(data.chatMessageId);
      } else {// Create new
        docRef = chatMessageCollection.doc();
        dbData.chatMessageId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, data: dbData };
    }
  )
);

export const deleteChatMessage = onCall({ region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      logger.info("delete ChatMessage: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.chatMessageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_CHAT_MESSAGE, data.chatMessageId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      if (oldInfo.senderId !== request.auth?.uid) {
        return { status: 403, result: QueryResultType.RESULT_NOT_ALLOWED, msg: InvalidParams };
      }
      await chatMessageCollection.doc(data.chatMessageId).delete();
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const getMyChatPartners = onCall({ region: "europe-west3" },
  withMiddlewares(
    [authMiddleware],
    async (request) => {
      logger.info("getMyChatPartners: ", request.data, { structuredData: true });
      const data = request.data as Record<string, string>;
      const user = request.auth!;
      try {
        // If user is lawyer, get all users data
        // if (!data.damageId) {
        //   return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
        // }
        const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
        if (!userInfo) {
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
        }
        // Get Admin to add them in all Chat members
        const adminUserInfo = await usersCollection.where("role", "==", UserRole.Admin).get();
        const adminList: FirebaseFirestore.DocumentData[] = [];
        if (!adminUserInfo.empty) {
          adminUserInfo.forEach((doc) => {
            const data = doc.data();
            adminList.push(data);
          });
        }
        //
        if (data.damageId) { // Get userInfo in case of damage chat
          // Get Chat group from damageId
          const chatGroup = await getFBDocumentWithParam(COLLECTION_CHAT_GROUP, "damageId", data.damageId);
          if (!chatGroup) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          // Check if user is allowed to access chatGroup(Admin can access to all chatGroup)
          logger.debug("chatGroup.members: ", chatGroup.members, " user.uid: ", user.uid, " userInfo.role: ", userInfo.role);
          if (userInfo.role !== UserRole.Admin && !chatGroup.members.includes(user.uid)) {
            return { status: 403, result: QueryResultType.RESULT_NOT_ALLOWED, msg: InvalidParams };
          }
          const myPartners = chatGroup.members.filter((member: string) => member !== user.uid);
          const chatMemberList: string[] = [];
          // Push to chatMemberList if not exist
          myPartners.forEach((partner: string) => {
            if (!chatMemberList.includes(partner)) {
              chatMemberList.push(partner);
            }
          });

          // Get user info from chatMemberList
          const allUserInfo = await Promise.all(chatMemberList.map(async (memberId) => {
            return await getDocumentInfo(COLLECTION_USERS, memberId);
          }));
          // Remove null or undefined from allUserInfo
          const chatPartnerList = allUserInfo.filter((userInfo) => userInfo);
          // Add Admin and Lawyer to chatPartnerList
          adminList.forEach((admin) => {
            if (!chatPartnerList.find((partner: any) => partner.userId === admin.userId)) {
              chatPartnerList.push(admin);
            }
          });
          return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, userList: chatPartnerList };
        } else { // Get userInfo in case of common chat
          if (userInfo.role === UserRole.Admin) {
            const allUserInfo = await usersCollection
              .where("isDisabled", "==", false)
              .where("userId", "!=", user.uid)
              .where("deletedAt", "==", null)
              .get();
            const chatPartnerList: FirebaseFirestore.DocumentData[] = [];
            if (!allUserInfo.empty) {
              allUserInfo.forEach((doc) => {
                const data = doc.data();
                chatPartnerList.push(data);
              });
            }
            return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, userList: chatPartnerList };
          }

          // Get user's workshopIds
          const chatPartnerList: FirebaseFirestore.DocumentData[] = [];
          const workshopIds = userInfo.workshopIds;
          if (workshopIds && workshopIds.length > 0) {
            // Find all users who have same workshopIds
            // const chatPartnerList: FirebaseFirestore.DocumentData[] = [];
            await Promise.all(workshopIds.map(async (workshopId: any) => {
              const allUserInfo = await usersCollection
                .where("isDisabled", "==", false)
                .where("workshopIds", "array-contains", workshopId)
                .where("userId", "!=", user.uid)
                .where("deletedAt", "==", null)
                .get();
              if (!allUserInfo.empty) {
                allUserInfo.forEach((doc) => {
                  const data = doc.data();
                  chatPartnerList.push(data);
                });
              }
            }));
          }

          // Find chatPartnerList from chatRoom
          const chatRooms = await chatRoomCollection
            .where("participants", "array-contains", user.uid)
            .get();
          // const chatPartnerList: FirebaseFirestore.DocumentData[] = [];
          if (!chatRooms.empty) {
            // Collect userIds from chatRooms
            const userIds: string[] = [];
            chatRooms.forEach((doc) => {
              const data = doc.data();
              data.participants.forEach((participant: string) => {
                // Filter unique userId which is not included in chatPartnerList and not user's userId and doesn't include in userIds and not Admin
                if (
                  !userIds.includes(participant) &&
                  participant !== user.uid && !chatPartnerList.find((partner: any) => partner.userId === participant) &&
                  !adminList.find((admin: any) => admin.userId === participant)
                ) {
                  userIds.push(participant);
                }
              });
            });
            // Get userInfo from userIds
            if (userIds.length > 0) {
              const allUserInfo = await Promise.all(userIds.map(async (userId) => {
                return await getDocumentInfo(COLLECTION_USERS, userId);
              }));
              // Remove null or undefined from allUserInfo
              allUserInfo.forEach((userInfo) => {
                if (userInfo) {
                  chatPartnerList.push(userInfo);
                }
              });
            }
          }
          // Add Admin to chatPartnerList
          adminList.forEach((admin) => {
            if (!chatPartnerList.find((partner: any) => partner.userId === admin.userId)) {
              chatPartnerList.push(admin);
            }
          });
          return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, userList: chatPartnerList };
        }
      } catch (error) {
        logger.debug("getMyChatPartners error: ", error);
        return { status: 500, result: QueryResultType.RESULT_UNEXPECTED_ERROR, msg: InvalidParams };
      }
    }
  )
);

import { onCall, onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {
  QueryResultType,
  DamageStatusType,
  InsuranceType,
  UserRole,
  VehicleEngineTypes,
  ServiceTaskStatusTypes,
  ServiceTaskTypes,
  NotificationTypes,
  ServiceProviderType,
  DamageStatusUpdatingTypes,
  PaintShopOrderStatus,
} from "../types/enums";
import {
  InvalidParams,
  SomethingWentWrong,
  OrderNumberIsNotValid,
  PermissionDenied,
  COLLECTION_DAMAGE,
  COLLECTION_DAMAGE_INVOICE_INFO,
  COLLECTION_USERS,
  FIELD_ORDER_NUMBER,
  COLLECTION_DAMAGE_FILES,
  DoseNotExist,
  ADMIN_ROLES,
  COLLECTION_REPAIR_DOCUMENTS,
  COLLECTION_SERVICE_TASK,
  COLLECTION_AGENT,
  COLLECTION_SERVICE_PROVIDERS,
  COLLECTION_REPAIR_CONFIRMATION,
  COLLECTION_WORKSHOPS,
  WORKSHOP_CREATED_INVOICE_INFO,
  LAWYER_CREATED_INVOICE_INFO,
  INVOICE_INFO_UPDATED,
} from "../constants";
import { getCarModelsByBrand } from "../services/thirdPartyAPI";
import { StatusCode } from "../types";
import { withMiddlewares, authMiddleware, schemaValidationMiddleware, damageCreationMiddleWare, lawyerAndWorkshopRoleMiddleWare } from "../middlewares";
import { vinDecoder } from "../services/vinDecoder/vinDecoder";
import { FileUploadModel, IEditDamageModel, IFileUploadModel, IUpdateDamageModel, editDamageModel, ICreateRepairPlanModel, createRepairPlanModel, ISetRepairConfirmationModel } from "../models/damage";
import { IDamageInvoiceInfoModel, damageInvoiceInfoModel } from "../models/damageInvoiceInfo";
import { getDamageUniqueNumber, getFilePathFromUrl, sumByKey } from "../utils/functionUtils";
import { checkFieldDuplicated } from "../utils/firestoreValidators";
import { FieldValue } from "firebase-admin/firestore";
import { generateKeywords } from "../utils";
import {
  damageCollection,
  getDocumentInfo,
  db,
  getDamageFileInfo,
  damageFileCollection,
  bucket, repairDocCollection,
  getFBDocumentWithParam,
  repairConfirmationCollection,
  damageInvoiceInfoCollection,
  notificationCollection,
} from "./config";
import { generateRepairSchedulePdf } from "../services/pdfHandler";
import dayjs = require("dayjs");


// Helper function to send notifications for damage invoice info
const sendDamageInvoiceInfoNotifications = async (data: IDamageInvoiceInfoModel, userId: string, isUpdate = false) => {
  try {
    // Get damage info
    const damageInfo = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
    if (!damageInfo) {
      logger.error("Damage not found for damageId:", data.damageId);
      return;
    }

    // Get user info
    const userInfo = await getDocumentInfo(COLLECTION_USERS, userId);
    if (!userInfo) {
      logger.error("User not found for userId:", userId);
      return;
    }

    let notificationTitle = "";
    let targetUserIds: string[] = [];
    const notificationType = isUpdate ? NotificationTypes.INVOICE_INFO_UPDATED : NotificationTypes.INVOICE_INFO_CREATED;

    if (isUpdate) {
      // For updates, notify relevant users based on damage associations
      if (damageInfo.workshopId) {
        const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
        if (workshop && workshop.userId) {
          targetUserIds.push(workshop.userId);
        }

        // Also notify lawyers associated with the workshop
        const serviceProviders = await db.collection(COLLECTION_SERVICE_PROVIDERS)
          .where("serviceType", "==", ServiceProviderType.ATTORNEY)
          .where("workshopIds", "array-contains", damageInfo.workshopId)
          .get();

        const lawyerUserIds = serviceProviders.docs.map((doc) => doc.data().userId).filter(Boolean);
        targetUserIds.push(...lawyerUserIds);
      }

      notificationTitle = INVOICE_INFO_UPDATED;
      // Remove the updater from notifications
      targetUserIds = [...new Set(targetUserIds.filter((id) => id !== userId))];
    } else {
      // For creation, determine notification based on creator role
      if (userInfo.role === UserRole.Owner && damageInfo.workshopId) {
        // Workshop owner created invoice info - notify lawyers in same workshop
        notificationTitle = WORKSHOP_CREATED_INVOICE_INFO;

        // Find lawyers associated with this workshop
        const serviceProviders = await db.collection(COLLECTION_SERVICE_PROVIDERS)
          .where("serviceType", "==", ServiceProviderType.ATTORNEY)
          .where("workshopIds", "array-contains", damageInfo.workshopId)
          .get();

        targetUserIds = serviceProviders.docs.map((doc) => doc.data().userId).filter(Boolean);
      } else if (userInfo.role === UserRole.Lawyer && damageInfo.workshopId) {
        // Lawyer created invoice info - notify workshop owner
        notificationTitle = LAWYER_CREATED_INVOICE_INFO;

        // Find workshop owner
        const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
        if (workshop && workshop.userId) {
          targetUserIds = [workshop.userId];
        }
      }
    }

    // Send notifications
    if (notificationTitle && targetUserIds.length > 0) {
      await Promise.all(targetUserIds.map(async (receiverId) => {
        const notificationData: Record<string, unknown> = {
          title: JSON.stringify({ title: notificationTitle, name: userInfo?.fullName || `${userInfo?.firstName} ${userInfo?.lastName}` || userInfo?.email || "" }),
          type: notificationType,
          senderId: userId,
          senderPhotoURL: userInfo.photoURL || null,
          receiverId: receiverId,
          chatRoomId: null,
          linkUrl: `/damages/${data.damageId}/invoice/${data.damageInvoiceInfoId || "new"}`,
          isUnread: true,
          isArchived: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        const docRef = notificationCollection.doc();
        notificationData.notificationId = docRef.id;
        await docRef.set(notificationData);
      }));
    }
  } catch (error) {
    logger.error("===Send Damage Invoice Info Notifications Error===", error);
  }
};

export const getCarModels = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("==Requested Car model ===: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.brand) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const models = await getCarModelsByBrand(data.brand);
      if (models) {
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, data: models };
      }
      return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: SomethingWentWrong };
    }
  )
);

export const decodeVIN = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("==Requested Vin Decode ===: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.vin) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const vinRes = await vinDecoder("decode", data.vin);
      if (vinRes) {
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, data: vinRes };
      }
      return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: SomethingWentWrong };
    }
  )
);

export const setDamage = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [damageCreationMiddleWare, schemaValidationMiddleware(editDamageModel)],
    async (request) => {
      logger.info("create new damage: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as IEditDamageModel;
      // If update =>
      let id = "";
      if (data.damageId) {
        id = data.damageId;
      }
      //
      // Check if it's duplicated or not
      let orderNumber: null | string = null;
      if (!data.damageId) {
        orderNumber = await getDamageUniqueNumber();
        if (orderNumber) {
          const orderNumberCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_DAMAGE, FIELD_ORDER_NUMBER, orderNumber, "damageId", id);
          if (orderNumberCheck !== QueryResultType.RESULT_SUCCESS) {
            return { status: 403, result: orderNumberCheck, msg: OrderNumberIsNotValid };
          }
        } else {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: SomethingWentWrong };
        }
      }

      const dbData: Record<string, any> = {
        ...data,
        cLicenseKeyList: generateKeywords(data.customerVehicleLicensePlate),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      // Testing
      let isCreating = false;
      //
      if (data.damageId) {// Update
        const oldInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
        const userInfo: any = await getDocumentInfo(COLLECTION_USERS, user.uid);
        if (oldInfo === null || userInfo === null) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        // if (oldInfo.userId === userInfo.userId || EDITOR_ROLES.includes(userInfo.role)) { // Only allow Admin or their own data
        //   dbData.userId = oldInfo.userId;
        //   docRef = damageCollection.doc(data.damageId);
        // } else {
        //   return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
        // }
        dbData.userId = oldInfo.userId;
        docRef = damageCollection.doc(data.damageId);
      } else {// Create new
        docRef = damageCollection.doc();
        let userId = user.uid;
        // Check if insuranceAgent is exist and if yes, find user id
        if (data.insuranceAgent) {
          const agentInfo = await getDocumentInfo(COLLECTION_AGENT, data.insuranceAgent);
          if (!agentInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          const userInfo = await getDocumentInfo(COLLECTION_USERS, agentInfo.userId);
          if (!userInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          userId = userInfo.userId;
        }
        // Check if appraiserRef is exist and if yes, find user id
        if (data.appraiserRef) {
          const appraiserInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, data.appraiserRef);
          if (!appraiserInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          const userInfo = await getDocumentInfo(COLLECTION_USERS, appraiserInfo.userId);
          if (!userInfo) {
            return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
          }
          userId = userInfo.userId;
        }
        //
        dbData.damageId = docRef.id;
        dbData.orderNumber = orderNumber;
        dbData.orderNumberKeyList = generateKeywords(orderNumber || "");
        dbData.userId = userId;
        dbData.status = data.isManualCreating ? DamageStatusType.SIGNED : DamageStatusType.CREATED;
        dbData.createdAt = FieldValue.serverTimestamp();
        //
        isCreating = true;
      }
      // --T--
      if (isCreating && data.isRepairScheduleOn) {
        const fileUrl = await generateRepairSchedulePdf(dbData);
        if (fileUrl) {
          dbData.repairScheduleDoc = fileUrl;
        }
      }
      //
      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const completeDamage = onCall(
  { region: "europe-west3" },
  withMiddlewares([lawyerAndWorkshopRoleMiddleWare],
    async (request) => {
      logger.info("complete damage: ", request.data, { structuredData: true });
      const data = request.data as IUpdateDamageModel;
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      if (oldInfo === null) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      const dbData: Record<string, any> = {
        status: DamageStatusType.FINISHED,
        costs: {
          revenue: data.revenue,
          diminished: data.diminished,
          liabilityRate: data.liabilityRate || 0,
          fullyComprehensiveRate: data.fullyComprehensiveRate || 0,
          controlledInsuranceLossRate: data.controlledInsuranceLossRate || 0,
        },
        damageCloseStatus: {
          totalLoss: data.totalLoss,
          isRepaired: data.isRepaired,
          isCutsApproved: data.isCutsApproved,
          engineType: data.engineType,
        },
        updatedAt: FieldValue.serverTimestamp(),
      };
      await damageCollection.doc(data.damageId).set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const updateRepairApproval = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("update repair approval: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as Record<string, any>;
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      if (oldInfo === null) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      // Check if user is assigned to this damage
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      if (userInfo.userId !== oldInfo.userId && userInfo.role !== UserRole.Admin) {
        // Check if service provider is included to this damage
        if (userInfo.role === UserRole.Owner) {
          // get workshopId from userInfo
          const workshopInfo = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, "userId", userInfo.userId);
          if (!workshopInfo || oldInfo.workshopId !== workshopInfo.workshopId) {
            return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
          }
        } else {
          // Get service provider info
          const serviceProviderInfo = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, "userId", userInfo.userId);
          if (!serviceProviderInfo || ![oldInfo.appraiserId, oldInfo.attorneyId].includes(serviceProviderInfo.serviceProviderId)) {
            return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
          }
        }
      }
      const dbData: Record<string, any> = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      const statusType: DamageStatusUpdatingTypes = data.statusType;
      const checkStatus = data.isChecked;
      switch (statusType) {
        case DamageStatusUpdatingTypes.APPROVED:
          // Handle approved status
          dbData.repairApproved = checkStatus;
          break;
        case DamageStatusUpdatingTypes.COMPLAINT:
          // Handle complaint status
          dbData.isComplaint = checkStatus;
          break;
        case DamageStatusUpdatingTypes.INSURANCE_VALUATION:
          // Handle insurance valuation status
          dbData.isInsuranceValuation = checkStatus;
          break;
      }
      await damageCollection.doc(data.damageId).set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const setInvoiceInfoForDamage = onCall(
  { region: "europe-west3" },
  withMiddlewares([lawyerAndWorkshopRoleMiddleWare, schemaValidationMiddleware(damageInvoiceInfoModel)],
    async (request) => {
      logger.info("set invoice info for damage: ", request.data, { structuredData: true });
      const user = request.auth;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const data = request.data as IDamageInvoiceInfoModel;

      // Check if damageId is provided
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }

      // If this is just for notification, skip database operations and only send notifications
      if (data.isForNotification) {
        const isUpdate = Boolean(data.damageInvoiceInfoId);
        await sendDamageInvoiceInfoNotifications(data, user.uid, isUpdate);
        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      }

      // Check if the damage exists
      const damageInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      if (!damageInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }

      // Get user info to check permissions
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }

      // Check if user is authorized - Admin can always access
      if (userInfo.role !== UserRole.Admin) {
        // For workshop owners, check if they belong to the same workshop as the damage
        if (userInfo.role === UserRole.Owner) {
          if (!userInfo.workshopIds || !userInfo.workshopIds.includes(damageInfo.workshopId)) {
            return { status: 403, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
          }
        } else if (userInfo.role === UserRole.Lawyer) { // For lawyers
          // Check if user's workshopIds has the workshopId of the damage
          if (!userInfo.workshopIds || !userInfo.workshopIds.includes(damageInfo.workshopId)) {
            return { status: 403, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
          }
        } else {
          return { status: 403, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
        }
      }

      const dbData: Record<string, any> = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };

      let docRef: FirebaseFirestore.DocumentReference;

      if (data.damageInvoiceInfoId) {
        // Update existing invoice info
        const oldInfo = await getDocumentInfo(COLLECTION_DAMAGE_INVOICE_INFO, data.damageInvoiceInfoId);
        if (!oldInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        docRef = damageInvoiceInfoCollection.doc(data.damageInvoiceInfoId);
        dbData.updatedBy = user.uid;
      } else {
        // If invoiceId is already exists in the damage info, return error
        if (damageInfo.invoiceId) {
          return { status: 403, result: QueryResultType.RESULT_ALREADY_EXIST, msg: InvalidParams };
        }
        // Create new invoice info
        docRef = damageInvoiceInfoCollection.doc();
        dbData.damageInvoiceInfoId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
        dbData.creatorId = user.uid;
      }

      await docRef.set(dbData, { merge: true });

      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const uploadDamageRelatedFiles = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [authMiddleware, schemaValidationMiddleware(FileUploadModel)],
    async (request) => {
      logger.info("uploading new file: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as IFileUploadModel;
      const userInfo: any = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      if (!data.damageId || !data.category || !data.subCategory) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      const now = new Date();
      const seconds = Math.round(now.getTime() / 1000);
      const newFile: Record<string, any> = {
        name: data.fileName,
        fileUrl: data.fileUrl,
        creatorId: user.uid,
        creatorRole: userInfo.role,
        uploadedAt: seconds,
      };
      let dbData: Record<string, any> = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      const oldDamageFilesInfo = await getDamageFileInfo(data.damageId, data.category, data.subCategory);
      logger.debug("======Old Damage File Info======", oldDamageFilesInfo);
      let docRef: FirebaseFirestore.DocumentReference;
      if (oldDamageFilesInfo) {
        docRef = damageFileCollection.doc(oldDamageFilesInfo.fileGroupId);
        dbData = { ...oldDamageFilesInfo };
        const originFiles = oldDamageFilesInfo.files;
        const newFiles = [...originFiles, newFile];
        dbData.files = newFiles;
      } else {
        docRef = damageFileCollection.doc();
        dbData = {
          fileGroupId: docRef.id,
          damageId: data.damageId,
          category: data.category,
          subCategory: data.subCategory,
          files: [newFile],
          createdAt: FieldValue.serverTimestamp(),
        };
      }
      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const removeDamageFile = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("remove damage file: ", request.data, { structuredData: true });
      // const user = request.auth!;
      const data = request.data;
      if (!data.fileGroupId || !data.fileUrl) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const fileListInfo: FirebaseFirestore.DocumentData | null | undefined = await getDocumentInfo(COLLECTION_DAMAGE_FILES, data.fileGroupId);
      if (!fileListInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: DoseNotExist };
      }
      const files = fileListInfo.files;
      const newFileList = files.filter((item: Record<string, any>) => item.fileUrl != data.fileUrl);
      const dbData: Record<string, any> = {
        ...fileListInfo,
        files: newFileList,
        updatedAt: FieldValue.serverTimestamp(),
      };
      const docRef = damageFileCollection.doc(data.fileGroupId);
      await docRef.set(dbData, { merge: true });
      // Remove file from storage
      const filePath = getFilePathFromUrl(data.fileUrl);
      if (filePath) {
        await bucket.file(filePath).delete();
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const scanVehicleDoc = onRequest(
  { region: "europe-west3" },
  (req, res) => {
    res.status(200).send("Hello world!");
  }
);

export const removeDamage = onCall(
  { region: "europe-west3" },
  withMiddlewares([damageCreationMiddleWare],
    async (request) => {
      logger.info("remove damage: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data;
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      const userInfo: any = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (oldInfo.userId === userInfo.userId || ADMIN_ROLES.includes(userInfo.role)) { // Only allow Admin or their own data
        await damageCollection.doc(data.damageId).delete();
      } else {
        return { status: 404, result: QueryResultType.RESULT_NOT_OWNER, msg: PermissionDenied };
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const createRepairPlan = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware, schemaValidationMiddleware(createRepairPlanModel)],
    async (request) => {
      logger.info("create repair plan: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as ICreateRepairPlanModel;
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      if (oldInfo === null) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      // Create the repair plan document
      const fileUrl = await generateRepairSchedulePdf(oldInfo, data);
      if (!fileUrl) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: SomethingWentWrong };
      }
      const dbData: Record<string, any> = {
        ...data,
        fileUrl,
        userId: user.uid,
        damageInfo: {
          orderNumber: oldInfo.orderNumber,
          customer: oldInfo.customerFirstName + " " + oldInfo.customerLastName,
          licensePlate: oldInfo.customerVehicleLicensePlate,
          vehicleBrand: oldInfo.customerVehicleBrand,
          customerEmail: oldInfo.customerEmail,
        },
        updatedAt: FieldValue.serverTimestamp(),
      };
      const oldRepairDocInfo = await getFBDocumentWithParam(COLLECTION_REPAIR_DOCUMENTS, "damageId", data.damageId);
      let docRef: FirebaseFirestore.DocumentReference;
      if (oldRepairDocInfo) {
        docRef = repairDocCollection.doc(oldRepairDocInfo.repairPlanDocId);
      } else {
        docRef = repairDocCollection.doc();
        dbData.createdAt = FieldValue.serverTimestamp();
        dbData.repairPlanDocId = docRef.id;
      }
      await docRef.set(dbData, { merge: true });
      await damageCollection.doc(data.damageId).set({ repairScheduleDoc: fileUrl }, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

// Update damage info
export const updateDamageInfo = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("update damage info: ", request.data, { structuredData: true });
      const data = request.data as Record<string, any>;
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      if (oldInfo === null) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      const dbData: Record<string, any> = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (Object.prototype.hasOwnProperty.call(data, "updatePaintShopStatus") && data.updatePaintShopStatus === true) {
        dbData.paintShopOrderStatus = data.paintShopOrderStatus;
      }
      if (Object.prototype.hasOwnProperty.call(data, "addPaintShopPdf")) {
        dbData.paintShopPdfUrl = data.paintShopPdfUrl;
        dbData.paintShopOrderStatus = PaintShopOrderStatus.STARTED;
      }
      await damageCollection.doc(data.damageId).set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const setRepairConfirmation = onCall(
  { region: "europe-west3" },
  withMiddlewares([damageCreationMiddleWare],
    async (request) => {
      logger.info("set repair confirmation: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as ISetRepairConfirmationModel;
      if (!data.damageId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      // Find damage and check if it has repairConfirmId
      const damageInfo: any = await getDocumentInfo(COLLECTION_DAMAGE, data.damageId);
      if (!damageInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
      }
      logger.info("==Damage Info==", damageInfo.repairConfirmId, data.repairConfirmId);
      if (!data.repairConfirmId && damageInfo.repairConfirmId) {
        return { status: 403, result: QueryResultType.RESULT_ALREADY_EXIST, msg: InvalidParams };
      }
      const dbData: Record<string, any> = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.repairConfirmId) { // Update
        const oldInfo = await getDocumentInfo(COLLECTION_REPAIR_CONFIRMATION, data.repairConfirmId);
        if (!oldInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: InvalidParams };
        }
        dbData.userId = oldInfo.userId;
        docRef = repairConfirmationCollection.doc(data.repairConfirmId);
      } else { // Create new
        docRef = repairConfirmationCollection.doc();
        dbData.userId = user.uid;
        dbData.repairConfirmId = docRef.id;
        dbData.createdAt = FieldValue.serverTimestamp();
      }
      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const getDashboardData = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      try {
        const user = request.auth!;
        const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
        if (!userInfo) {
          return { status: 401, result: QueryResultType.RESULT_USER_NOT_EXIST, msg: InvalidParams };
        }
        let damages: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
        if (userInfo.role === UserRole.Admin) {
          damages = await db.collection(COLLECTION_DAMAGE).orderBy("createdAt").get();
        } else {
          damages = await db.collection(COLLECTION_DAMAGE).where("userId", "==", user.uid).orderBy("createdAt").get();
        }
        if (damages.empty) {
          return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS, data: {} };
        }
        const totalDamages = damages.size;
        let controlledDamages = 0;
        let quotations = 0;
        let liabilities = 0;
        let attorneyServices = 0;
        let appraiserServices = 0;
        let carRentalServices = 0;
        let towingServices = 0;
        let paintServices = 0;
        let commercialLiabilityServices = 0;
        let personalLiabilityServices = 0;
        let fullyCom = 0;
        let partiallyCom = 0;
        let appraiserOpenedAll = 0;
        let appraiserFinishedAll = 0;
        let pendingDamages = 0;
        let finishedDamages = 0;
        let rukTotal = 0;
        let repairScheduleTotal = 0;
        let totalPaidDamages = 0;
        let revenue = 0;
        let averageRevenue = 0;
        let diminished = 0;
        let averageDiminished = 0;
        let liabilityRate = 0;
        let averageLiabilityRate = 0;
        let fullyComprehensiveRate = 0;
        let averageFullyComprehensiveRate = 0;
        let controlledInsuranceLossRate = 0;
        let averageControlledInsuranceLossRate = 0;
        let totalLossCount = 0;
        let repairedCount = 0;
        let gasolineCount = 0;
        let electricCount = 0;
        let hybridCount = 0;
        let firstOnTimeCount = 0;
        let secondOnTimeCount = 0;
        let notFirstOnTimeCount = 0;
        let notSecondOnTimeCount = 0;
        const chartData: any[] = [];
        const costData: any[] = [];
        // Get 18hrs and 24hrs notification
        const query18 = db.collection(COLLECTION_SERVICE_TASK)
          .where("status", "==", ServiceTaskStatusTypes.SIGNED)
          .where("taskType", "==", ServiceTaskTypes.APPRAISER_TASK);
        const querySnapshot18 = await query18.get();
        if (!querySnapshot18.empty) {
          querySnapshot18.docs.forEach((doc) => {
            const signedAt = doc.data().signedAt;
            if (signedAt) {
              const signedAtDate = signedAt.toDate();
              const diff = new Date().getTime() - signedAtDate.getTime();
              if (diff > 18 * 3600 * 1000) {
                notFirstOnTimeCount++;
              }
            }
          });
        }
        // Get 24hrs notification
        const query24 = db.collection(COLLECTION_SERVICE_TASK)
          .where("status", "==", ServiceTaskStatusTypes.ACCEPTED)
          .where("taskType", "==", ServiceTaskTypes.APPRAISER_TASK);
        const querySnapshot24 = await query24.get();
        if (!querySnapshot24.empty) {
          querySnapshot24.docs.forEach((doc) => {
            const acceptedAt = doc.data().acceptedAt;
            if (acceptedAt) {
              const acceptedAtDate = acceptedAt.toDate();
              const fileUploadedAt = doc.data().firstFileUploadedAt;
              const signedAt = doc.data().signedAt;
              // Calculate signed and accepted time diff
              if (signedAt) {
                const signedAtDate = signedAt.toDate();
                const diff = acceptedAtDate.getTime() - signedAtDate.getTime();
                if (diff > 18 * 3600 * 1000) {
                  notFirstOnTimeCount++;
                } else {
                  firstOnTimeCount++;
                }
              }
              // Calculate accepted and file uploaded time diff
              if (fileUploadedAt) {
                const fileUploadedAtDate = fileUploadedAt.toDate();
                const diff = fileUploadedAtDate.getTime() - acceptedAtDate.getTime();
                if (diff > 24 * 3600 * 1000) {
                  notSecondOnTimeCount++;
                } else {
                  secondOnTimeCount++;
                }
              } else {
                // Check the time diff between accepted and now
                const diff = new Date().getTime() - acceptedAtDate.getTime();
                if (diff > 24 * 3600 * 1000) {
                  notSecondOnTimeCount++;
                }
              }
            }
          });
        }
        //
        damages.forEach((documentSnapshot) => {
          const damage = documentSnapshot.data();
          let controlled = 0;
          let quotation = 0;
          let liability = 0;
          if (damage.controlled) {
            controlledDamages++;
            controlled = 1;
          }
          if (damage.quotation) {
            quotations++;
            quotation = 1;
          }
          if (damage.insuranceType == InsuranceType.LIABILITY) {
            liabilities++;
            liability = 1;
          }
          if (damage.insuranceType == InsuranceType.FULLY_COMPREHENSIVE) fullyCom++;
          if (damage.insuranceType == InsuranceType.PARTIALLY_COMPREHENSIVE) partiallyCom++;
          if (damage.insuranceType == InsuranceType.COMMERCIAL_LIABILITY) commercialLiabilityServices++;
          if (damage.insuranceType == InsuranceType.PERSONAL_LIABILITY) personalLiabilityServices++;
          if (damage.attorneyId) attorneyServices++;
          if (damage.appraiserId) {
            appraiserServices++;
            if (damage.status === DamageStatusType.FINISHED) {
              appraiserFinishedAll++;
            } else {
              appraiserOpenedAll++;
            }
          }
          if (damage.carRentalId) carRentalServices++;
          if (damage.towingServiceId) towingServices++;
          if (damage.paintShopId) paintServices++;
          if (damage.status !== DamageStatusType.FINISHED) {
            pendingDamages++;
          } else {
            finishedDamages++;
          }
          if (damage.isRkuOn) {
            rukTotal++;
          }
          if (damage.isRepairScheduleOn) {
            repairScheduleTotal++;
          }
          if (damage.costs) {
            totalPaidDamages++;
            revenue += isNaN(damage.costs.revenue) ? 0 : damage.costs.revenue;
            diminished += isNaN(damage.costs.diminished) ? 0 : damage.costs.diminished;
            liabilityRate += isNaN(damage.costs.liabilityRate) ? 0 : damage.costs.liabilityRate;
            fullyComprehensiveRate += isNaN(damage.costs.fullyComprehensiveRate) ? 0 : damage.costs.fullyComprehensiveRate;
            controlledInsuranceLossRate += isNaN(damage.costs.controlledInsuranceLossRate) ? 0 : damage.costs.controlledInsuranceLossRate;
          }
          if (damage.damageCloseStatus) {
            if (damage.damageCloseStatus.totalLoss) {
              totalLossCount++;
            }
            if (damage.damageCloseStatus.isRepaired) {
              repairedCount++;
            }
            if (damage.damageCloseStatus.engineType === VehicleEngineTypes.GASOLINE) {
              gasolineCount++;
            } else if (damage.damageCloseStatus.engineType === VehicleEngineTypes.ELECTRIC) {
              electricCount++;
            } else if (damage.damageCloseStatus.engineType === VehicleEngineTypes.HYBRID) {
              hybridCount++;
            }
          }
          chartData.push({ date: dayjs(damage.createdAt.toDate()).format("DD.MM.YYYY"), total: 1, controlled, quotation, liability });
          costData.push({
            date: dayjs(damage.createdAt.toDate()).format("DD.MM.YYYY"),
            revenue: damage.costs?.revenue || 0,
            diminished: damage.costs?.diminished || 0,
            liabilityRate: damage.costs?.liabilityRate || 0,
            fullyComprehensiveRate: damage.costs?.fullyComprehensiveRate || 0,
            controlledInsuranceLossRate: damage.costs?.controlledInsuranceLossRate || 0,
          });
        });
        const chartDataByDate = {
          total: sumByKey(chartData, "date", "total"),
          controlled: sumByKey(chartData, "date", "controlled"),
          quotation: sumByKey(chartData, "date", "quotation"),
          liability: sumByKey(chartData, "date", "liability"),
        };
        const costDataByDate = {
          revenue: sumByKey(costData, "date", "revenue"),
          diminished: sumByKey(costData, "date", "diminished"),
          liabilityRate: sumByKey(costData, "date", "liabilityRate"),
          fullyComprehensiveRate: sumByKey(costData, "date", "fullyComprehensiveRate"),
          controlledInsuranceLossRate: sumByKey(costData, "date", "controlledInsuranceLossRate"),
        };
        if (totalPaidDamages > 0) {
          // calculate average revenue and average diminished and leave 2 decimal places as number format
          averageRevenue = parseFloat((revenue / totalPaidDamages).toFixed(2));
          averageDiminished = parseFloat((diminished / totalPaidDamages).toFixed(2));
          averageLiabilityRate = parseFloat((liabilityRate / totalPaidDamages).toFixed(2));
          averageFullyComprehensiveRate = parseFloat((fullyComprehensiveRate / totalPaidDamages).toFixed(2));
          averageControlledInsuranceLossRate = parseFloat((controlledInsuranceLossRate / totalPaidDamages).toFixed(2));
        }
        logger.debug("=====Dashboard Data=====", liabilityRate,
          averageLiabilityRate,
          fullyComprehensiveRate,
          averageFullyComprehensiveRate,
          controlledInsuranceLossRate,
          averageControlledInsuranceLossRate,
        );
        return {
          status: StatusCode.Success,
          result: QueryResultType.RESULT_SUCCESS,
          data: {
            totalDamages,
            controlledDamages,
            quotations,
            liabilities,
            attorneyServices,
            appraiserServices,
            carRentalServices,
            fullyCom,
            partiallyCom,
            commercialLiabilityServices,
            personalLiabilityServices,
            towingServices,
            paintServices,
            appraiserOpenedAll,
            appraiserFinishedAll,
            pendingDamages,
            finishedDamages,
            rukTotal,
            repairScheduleTotal,
            chartDataByDate,
            costDataByDate,
            revenue,
            averageRevenue,
            diminished,
            averageDiminished,
            liabilityRate,
            averageLiabilityRate,
            fullyComprehensiveRate,
            averageFullyComprehensiveRate,
            controlledInsuranceLossRate,
            averageControlledInsuranceLossRate,
            totalLossCount,
            repairedCount,
            gasolineCount,
            electricCount,
            hybridCount,
            firstOnTimeCount,
            secondOnTimeCount,
            notFirstOnTimeCount,
            notSecondOnTimeCount,
          },
        };
      } catch (error) {
        return { status: StatusCode.Failure, result: QueryResultType.RESULT_UNKNOWN_ERROR, msg: SomethingWentWrong };
      }
    }
  )
);

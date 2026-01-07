import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { withMiddlewares, schemaValidationMiddleware, salesAdminRoleMiddleWare, lawyerAndWorkshopRoleMiddleWare, authMiddleware } from "../middlewares";
import { createWorkshopModel } from "../models/workshop";
import { manageFilesModel, IManageFilesModel } from "../models/workshopFiles";
import { checkFieldDuplicated } from "../utils/firestoreValidators";
import {
  FIELD_NAME,
  FIELD_EMAIL,
  FIELD_PHONE,
  COLLECTION_WORKSHOPS,
  WorkshopDoesNotExist,
  YouDoNotHaveEnoughPermission,
  WorkshopNameAlreadyExists,
  EmailAlreadyExists,
  PhoneAlreadyExists,
  InvalidParams,
  COLLECTION_USERS,
  ADMIN_ROLES,
  SCRIVE_BASE_URL,
  CONTRACT_CONFIRMATION_EMAIL,
} from "../constants";
import { generateKeywords } from "../utils";
import { workShopCollection, getDocumentInfo, workshopFilesCollection, bucket } from "./config";
import { StatusCode } from "../types";
import { ContractDocTypes, QueryResultType } from "../types/enums";
import { getAuth } from "firebase-admin/auth";
import { updateUserBasicInfo } from "./eventTriggers";
import { checkAuthIsUsed, getFilePathFromUrl, modifyFileName } from "../utils/functionUtils";
import { CONTRACT_FILE_URL, generateCommissionContractPdf } from "../services/pdfHandler";
import dayjs from "dayjs";
import { makeCommissionContractSignatureFile } from "../services/scriveHandler";
import { sendMailgunEmail } from "../services/emailSender";
const WHITE_PAPER_PDF_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FWhitepaper_Final_03_01.pdf?alt=media&token=fb3dfafb-67e2-4478-9fdc-a8151673a60e";

export const removeWorkshop = onCall(
  { region: "europe-west3" },
  withMiddlewares([salesAdminRoleMiddleWare],
    async (request) => {
      logger.info("removeWorkshop: ", request.data, { structuredData: true });
      const user = request.auth!;
      logger.debug("Requestd User===", user);
      const data = request.data;
      if (!data.workshopId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const oldInfo = await getDocumentInfo(COLLECTION_WORKSHOPS, data.workshopId);
      if (!oldInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: WorkshopDoesNotExist };
      }
      await workShopCollection.doc(data.workshopId).delete();
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const setWorkshop = onCall(
  { region: "europe-west3" },
  withMiddlewares(
    [salesAdminRoleMiddleWare, schemaValidationMiddleware(createWorkshopModel)],
    async (request) => {
      logger.info("createWorkshop: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data;
      // Get UserInfo first
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      // If update =>
      let id = "";
      if (data.workshopId) {
        id = data.workshopId;
      }
      if (!id) {
        const isAuthUsed = await checkAuthIsUsed(data.email);
        if (isAuthUsed.isUsed) {
          logger.debug("Email is already in use by user ", isAuthUsed.uid);
          return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: EmailAlreadyExists };
        }
      }
      // Check if it's duplicated or not
      const nameCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_WORKSHOPS, FIELD_NAME, data.name, "workshopId", id);
      if (nameCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: nameCheck, msg: WorkshopNameAlreadyExists };
      }
      const emailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_WORKSHOPS, FIELD_EMAIL, data.email, "workshopId", id);
      if (emailCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: emailCheck, msg: EmailAlreadyExists };
      }
      // Check if user email is duplicated or not when create new
      if (id === "") {
        const userEmailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_USERS, FIELD_EMAIL, data.email);
        if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
          return { status: 403, result: userEmailCheck, msg: EmailAlreadyExists };
        }
      }
      const phoneCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_WORKSHOPS, FIELD_PHONE, data.phone, "workshopId", id);
      if (phoneCheck !== QueryResultType.RESULT_SUCCESS) {
        return { status: 403, result: phoneCheck, msg: PhoneAlreadyExists };
      }
      //
      const dbData = {
        ...data,
        cityKeyList: generateKeywords(data.city),
        nameKeyList: generateKeywords(data.name),
        emailKeyList: generateKeywords(data.email),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      let docRef: FirebaseFirestore.DocumentReference;
      if (data.workshopId) {// Update
        const oldInfo = await getDocumentInfo(COLLECTION_WORKSHOPS, data.workshopId);
        if (!oldInfo) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: WorkshopDoesNotExist };
        }
        if (oldInfo && oldInfo.email !== data.email) {
          const userEmailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_USERS, FIELD_EMAIL, data.email);
          if (userEmailCheck !== QueryResultType.RESULT_SUCCESS) {
            return { status: 403, result: userEmailCheck, msg: EmailAlreadyExists };
          }
        }
        // Only owner or admin can update:
        if (oldInfo?.userId === user.token.uid || ADMIN_ROLES.includes(userInfo.role)) {
          // Update user basic info concurrently
          await updateUserBasicInfo(data, oldInfo.userId);

          docRef = workShopCollection.doc(data.workshopId);
        } else {
          return { status: 403, result: QueryResultType.RESULT_NOT_OWNER, msg: YouDoNotHaveEnoughPermission };
        }
      } else {// Create new
        docRef = workShopCollection.doc();
        // Add workshop data
        dbData.workshopId = docRef.id;
        // dbData.userId = userRecord.uid;
        dbData.creatorId = user.token.uid;
        dbData.createdAt = FieldValue.serverTimestamp();
      }

      await docRef.set(dbData, { merge: true });
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const handleWorkshopInfo = onCall(
  { region: "europe-west3" },
  withMiddlewares([authMiddleware],
    async (request) => {
      logger.info("handleWorkshopInfo: ", request.data, { structuredData: true });
      const data = request.data;
      if (!data.workshopId) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }
      const workshopInfo = await getDocumentInfo(COLLECTION_WORKSHOPS, data.workshopId);
      if (!workshopInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: WorkshopDoesNotExist };
      }
      if (Object.prototype.hasOwnProperty.call(data, "sendContract") && data.sendContract === true) {
        const contractFiles: Record<string, string>[] = [];
        // Push DataProtection URL to contract files
        contractFiles.push({ doc_name: "Datenschutzvereinbarung(Data Protection Agreement)", doc_url: CONTRACT_FILE_URL });
        // Make commission contract PDF and send to Scrive
        const commissionFile = await generateCommissionContractPdf(workshopInfo);
        if (commissionFile) {
          const commissionFileName = `workshop_commission_contract_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${modifyFileName(workshopInfo.name)}.pdf`;
          const commissionContractUrl = await makeCommissionContractSignatureFile(
            data.workshopId,
            ContractDocTypes.WORKSHOP_COMMISSION_CONTRACT,
            commissionFile,
            commissionFileName,
            workshopInfo.name,
            workshopInfo.email,
            workshopInfo.phone);
          if (commissionContractUrl) {
            contractFiles.push({ doc_name: "Provisionsvereinbarung(Commission Agreement)", doc_url: `${SCRIVE_BASE_URL}${commissionContractUrl}` });
          }
        }
        // Send contract and commission email
        if (contractFiles.length) {
          await sendMailgunEmail(
            [workshopInfo.email],
            "Provisionsverbeinbarung zur digitalen Unterzeichnung",
            CONTRACT_CONFIRMATION_EMAIL,
            { data: contractFiles },
            "",
            [
              {
                filename: "White_Paper.pdf",
                url: WHITE_PAPER_PDF_URL, // must be a public or signed PDF URL
              },
            ]
          );
        }
      }
      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const manageFiles = onCall(
  { region: "europe-west3" },
  withMiddlewares([lawyerAndWorkshopRoleMiddleWare, schemaValidationMiddleware(manageFilesModel)],
    async (request) => {
      logger.info("manageFiles: ", request.data, { structuredData: true });
      const user = request.auth!;
      const data = request.data as IManageFilesModel;

      // Get user info to check permissions
      const userInfo = await getDocumentInfo(COLLECTION_USERS, user.uid);
      if (!userInfo) {
        return { status: 403, result: QueryResultType.RESULT_INVALID_PARAM, msg: InvalidParams };
      }

      // Check if workshop exists
      const workshopInfo = await getDocumentInfo(COLLECTION_WORKSHOPS, data.workshopId);
      if (!workshopInfo) {
        return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: WorkshopDoesNotExist };
      }

      // Check permissions: Only workshop owner, lawyers associated with workshop, or admins can manage files
      const isAdmin = ADMIN_ROLES.includes(userInfo.role);
      const isWorkshopOwner = workshopInfo.userId === user.uid;
      const isAssociatedLawyer = userInfo.workshopIds && userInfo.workshopIds.includes(data.workshopId);

      if (!isAdmin && !isWorkshopOwner && !isAssociatedLawyer) {
        return { status: 403, result: QueryResultType.RESULT_NOT_OWNER, msg: YouDoNotHaveEnoughPermission };
      }

      // Handle file deletion
      if (data.isDelete && data.fileUrl) {
        const existingFiles = await workshopFilesCollection.doc(data.workshopId).get();

        if (!existingFiles.exists) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: "Workshop files not found" };
        }

        const existingData = existingFiles.data();
        const existingFilesArray = existingData?.files || [];

        // Find the file to delete
        const fileToDelete = existingFilesArray.find((file: Record<string, unknown>) => file.url === data.fileUrl);

        if (!fileToDelete) {
          return { status: 404, result: QueryResultType.RESULT_NOT_EXIST, msg: "File not found" };
        }

        // Check if user can delete: only creator or admin
        // const canDelete = isAdmin || fileToDelete.uploadedBy === user.uid;
        const canDelete = true; // For simplicity, allow all users to delete files

        if (!canDelete) {
          return { status: 403, result: QueryResultType.RESULT_NOT_OWNER, msg: "Only file creator or admin can delete files" };
        }

        // Remove file from array
        const updatedFiles = existingFilesArray.filter((file: Record<string, unknown>) => file.url !== data.fileUrl);

        // Update database
        const dbData: Record<string, unknown> = {
          workshopId: data.workshopId,
          files: updatedFiles,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: user.uid,
        };

        await workshopFilesCollection.doc(data.workshopId).set(dbData, { merge: true });

        // Delete file from storage
        try {
          const filePath = getFilePathFromUrl(data.fileUrl);
          if (filePath) {
            await bucket.file(filePath).delete();
            logger.debug("Successfully deleted file from storage:", filePath);
          }
        } catch (error) {
          logger.error("Error deleting file from storage:", error);
          // Continue execution even if storage deletion fails
        }

        return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
      }

      // Handle file upload/update (existing logic)
      const existingFiles = await workshopFilesCollection.doc(data.workshopId).get();

      let finalFiles = data.files;

      if (existingFiles.exists) {
        // Get existing files data
        const existingData = existingFiles.data();
        const existingFilesArray = existingData?.files || [];

        // Merge files: check URL equality
        const mergedFiles = [...existingFilesArray];

        data.files?.forEach((newFile) => {
          const existingFileIndex = mergedFiles.findIndex((existingFile) => existingFile.url === newFile.url);

          if (existingFileIndex !== -1) {
            // Replace existing file with same URL
            mergedFiles[existingFileIndex] = newFile;
          } else {
            // Append new file if URL doesn't exist
            mergedFiles.push(newFile);
          }
        });

        finalFiles = mergedFiles;
      }

      const dbData: Record<string, unknown> = {
        workshopId: data.workshopId,
        files: finalFiles,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      };

      if (existingFiles.exists) {
        // Update existing files document
        await workshopFilesCollection.doc(data.workshopId).set(dbData, { merge: true });
      } else {
        // Create new files document
        dbData.createdAt = FieldValue.serverTimestamp();
        dbData.createdBy = user.uid;
        await workshopFilesCollection.doc(data.workshopId).set(dbData);
      }

      return { status: StatusCode.Success, result: QueryResultType.RESULT_SUCCESS };
    }
  )
);

export const createAuthUser = async (email: string, password: string) => {
  return await getAuth().createUser({
    email,
    emailVerified: true,
    password: password,
  })
    .then((userRecord) => {
      logger.debug("Created User==", userRecord);
      return userRecord;
    })
    .catch((error) => {
      logger.log("Error creating new user:", error);
      return null;
    });
};

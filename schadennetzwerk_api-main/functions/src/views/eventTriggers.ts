import {
  onDocumentWritten,
} from "firebase-functions/v2/firestore";

import {
  COLLECTION_SALESMAN,
  COLLECTION_SERVICE_PROVIDERS,
  COLLECTION_USERS,
  COLLECTION_WORKSHOPS,
  COLLECTION_DAMAGE,
  USER_CREATION_EMAIL_TEMP,
  // COLLECTION_SIGNING_DOCS,
  SIGNATURE_REQUESTING_EMAIL,
  SERVICE_ASSIGNMENT,
  SCRIVE_BASE_URL,
  COLLECTION_SERVICE_TASK,
  SITE_URL,
  SERVICE_CONFIRMATION_EMAIL,
  FIELD_USER_ID,
  COLLECTION_COST_ESTIMATES,
  CostEstimationFileKeys,
  COLLECTION_TRANSPORT_DAMAGE,
  TransportDamageFileKeys,
  COLLECTION_SUPPORT,
  COLLECTION_DAMAGE_FILES,
  COLLECTION_USED_CAR,
  FIELD_EMAIL,
  COLLECTION_APPRAISER_INFO,
  APPRAISER_INFO_DETAIL_COMPLETE_EMAIL,
  ORDER_RECEIVED_CONTENT_SID,
  DAMAGE_LINKS_CONTENT_SID,
  DAMAGE_FILE_UPLOAD_NOTIFICATION,
  COLLECTION_REPAIR_DOCUMENTS,
  COLLECTION_AGENT,
  COLLECTION_CHAT_MESSAGE,
  COLLECTION_CHAT_ROOM,
  COLLECTION_CHAT_GROUP,
  YOU_HAVE_NEW_CHAT_MESSAGE,
  APPRAISER_UPLOADED_FILE,
  APPRAISER_COMPLETE_YOUR_INFO,
  COLLECTION_REPAIR_CONFIRMATION,
  KVA_NOTIFICATION,
  APPRAISER_APPROVED_REPAIR_APPROVAL,
  LAWYER_CLOSED_DAMAGE,
  COLLECTION_DAMAGE_INVOICE_INFO,
  REPAIR_APPROVAL_EMAIL,
  INSURANCE_VALUATION_EMAIL,
  OPEN_CLAIM_LEGAL_ACTION_EMAIL,
  COMPLAINT_NOTIFICATION,
  INSURANCE_VALUATION_NOTIFICATION,
  CONTRACT_CONFIRMATION_EMAIL,
  TRANSPORT_DAMAGE_CREATION,
  COLLECTION_SERVICE_ADVISER,
  PAINT_SHOP_ORDER_FROM_SERVICE_ADVISER,
} from "../constants";
import { logger } from "firebase-functions/v1";
import { getUserByEmail, deleteUser } from "./user";
import { checkUserRoleMatchToServiceType, getFilePathFromUrl, getServiceNameFromServiceTaskType, getUserRoleFromServiceType, modifyFileName } from "../utils/functionUtils";
import {
  db,
  usersCollection,
  bucket,
  workShopCollection,
  salesmanCollection,
  serviceProviderCollection,
  getDocumentInfo,
  serviceTaskCollection,
  getFBDocumentWithParam,
  appraiserCollection,
  agentCollection,
  chatRoomCollection,
  chatGroupCollection,
  damageCollection,
  notificationCollection,
  serviceAdviserCollection,
  damageFileCollection,
} from "./config";
import {
  CANCEL_DOC_URL,
  CONTRACT_FILE_URL,
  generateAppraiserPdf,
  generateAttorneyPdf,
  generateCarRentalAssignmentPdf,
  generateCommissionContractPdf,
  generateRcaPdf,
  PRICE_LIST_URL,
} from "../services/pdfHandler";
import { makeCommissionContractSignatureFile, makeSignatureFile } from "../services/scriveHandler";
import {
  ContractDocTypes,
  DamageDocCategory,
  DamageStatusType,
  FileAppraiserCategories,
  FileCategories,
  FileJustizcarCategories,
  FilePaintShopCategories,
  NotificationTypes,
  QueryResultType,
  ServiceProviderType,
  ServiceTaskStatusTypes,
  ServiceTaskTypes,
  UserRole,
} from "../types/enums";
import dayjs from "dayjs";
import { createAuthUser } from "./workshop";
import { generateKeywords, generateRandPassword } from "../utils";
import { FieldValue } from "firebase-admin/firestore";
import { fileAttachType, sendMailgunEmail } from "../services/emailSender";
import { sendSMS, sendWhatsAppSMS, sendWhatsAppWelcomeMessage } from "../services/smsSender";
import { checkFieldDuplicated } from "../utils/firestoreValidators";

export const modifyUser = onDocumentWritten(`${COLLECTION_USERS}/{userId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  try {
    if (!oldInfo && newInfo) { // Creating...
      logger.debug("===Creating Info===");
    }
    if (oldInfo && newInfo) { // Updating...
      logger.debug("===Updating Info===");
      if (!newInfo.isUpdatedFromOthers) {
        const serviceProvider = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, FIELD_USER_ID, newInfo.userId);
        const workshop = await getFBDocumentWithParam(COLLECTION_WORKSHOPS, FIELD_USER_ID, newInfo.userId);
        const salesman = await getFBDocumentWithParam(COLLECTION_SALESMAN, FIELD_USER_ID, newInfo.userId);
        const agent = await getFBDocumentWithParam(COLLECTION_AGENT, FIELD_USER_ID, newInfo.userId);
        const dbData: Record<string, any> = {
          whatsapp: newInfo.whatsapp,
          phone: newInfo.phone,
          street: newInfo.street,
          city: newInfo.city,
          postalCode: newInfo.postalCode,
          country: newInfo.country,
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (serviceProvider) {
          dbData.name = `${newInfo.firstName} ${newInfo.lastName}`;
          await serviceProviderCollection.doc(serviceProvider.serviceProviderId).set(dbData, { merge: true });
        }
        if (salesman) {
          dbData.name = `${newInfo.firstName} ${newInfo.lastName}`;
          await salesmanCollection.doc(salesman.salesmanId).set(dbData, { merge: true });
        }
        if (agent) {
          dbData.firstName = newInfo.firstName;
          dbData.lastName = newInfo.lastName;
          await agentCollection.doc(agent.agentId).set(dbData, { merge: true });
        }
        if (workshop) {
          await workShopCollection.doc(workshop.workshopId).set(dbData, { merge: true });
        }
      }
    }
    if (oldInfo && !newInfo) { // Deleting...
      logger.debug("===Deleting Info===");
      await deleteUser(event.params.userId);
      if (oldInfo.photoURL) {
        const filePath = getFilePathFromUrl(oldInfo.photoURL);
        if (filePath) {
          await bucket.file(filePath).delete();
        }
      }
      // Remove userId from ChatRoom
      const chatRooms = await db.collection(COLLECTION_CHAT_ROOM).where("participants", "array-contains", event.params.userId).get();
      if (!chatRooms.empty) {
        await Promise.all(chatRooms.docs.map(async (doc) => {
          const data = doc.data();
          // If type is ONE_TO_ONE, set as deleted
          if (data.type === "ONE_TO_ONE") {
            await chatRoomCollection.doc(doc.id).update({
              deletedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            if (data.participants.length === 2 || data.creator === event.params.userId) {
              await chatRoomCollection.doc(doc.id).update({
                deletedAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
              });
            } else if (data.participants.length > 2) {
              await chatRoomCollection.doc(doc.id).update({
                participants: FieldValue.arrayRemove(event.params.userId),
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          }
        }));
      }
      // Remove userId from ChatGroup
      const chatGroups = await db.collection(COLLECTION_CHAT_GROUP).where("members", "array-contains", event.params.userId).get();
      if (!chatGroups.empty) {
        await Promise.all(chatGroups.docs.map(async (doc) => {
          const data = doc.data();
          if (data.groupCreator === event.params.userId || data.members.length === 2) {
            // Remove chat group
            await chatGroupCollection.doc(doc.id).delete();
          } else if (data.members.length > 2) {
            await chatGroupCollection.doc(doc.id).update({
              members: FieldValue.arrayRemove(event.params.userId),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }));
      }
    }
  } catch (error) {
    logger.error("===Failed to modify user===", error);
  }
});

export const modifyServiceProvider = onDocumentWritten(`${COLLECTION_SERVICE_PROVIDERS}/{serviceProviderId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Create User
    try {
      const userRole = newInfo.serviceType === ServiceProviderType.APPRAISER && newInfo.isSalesmanToo ?
        UserRole.SalesAppraiser :
        getUserRoleFromServiceType(newInfo.serviceType as ServiceProviderType);
      let uid: string | null = null;
      // If the Appraiser created from the salesman, it just gets the UserId, if not, create new user and get uid
      if (newInfo.isAppraiserToo) {
        // Find user with same email and update workshopIds
        const userInfo = await getUserByEmail(newInfo.email);
        if (userInfo && userInfo.size === 1) {
          uid = userInfo.docs[0].id;
        }
      } else {
        if (newInfo.whatsapp) {
          await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
        }
        uid = await createNewUserAndSendEmail(newInfo, newInfo.workshopIds || [], userRole);
      }
      if (uid) {
        await serviceProviderCollection.doc(newInfo.serviceProviderId).set({ userId: uid }, { merge: true });
      }
      if (newInfo.serviceType === ServiceProviderType.APPRAISER) {
        // If need to create salesman, too
        if (newInfo.isSalesmanToo) {
          await createSalesmanFromAppraiser(event.params.serviceProviderId);
        }
        // Send Appraiser Info detail complete email
        await sendMailgunEmail(
          [newInfo.email],
          "Bitte vervollständigen Sie Ihre Daten -SchadenNetzwerk Portal",
          APPRAISER_INFO_DETAIL_COMPLETE_EMAIL,
          { appraiser_info_url: `${SITE_URL}/appraiser_info` },
        );
        // Make internal notification
        try {
          const notificationData: Record<string, unknown> = {
            title: JSON.stringify({ title: APPRAISER_COMPLETE_YOUR_INFO, name: newInfo.name || "" }),
            type: NotificationTypes.APPRAISER_INFO_COMPLETE,
            senderId: "system",
            senderPhotoURL: null,
            receiverId: uid,
            chatRoomId: null,
            linkUrl: "/appraiser_info",
            isUnread: true,
            isArchived: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          };
          const docRef = notificationCollection.doc();
          notificationData.notificationId = docRef.id;
          await docRef.set(notificationData);
        } catch (error) {
          logger.error("===Failed to create notification===", error);
        }
      }
    } catch (error) {
      logger.error("=== Failed to create new user in Salesman creation ===", error);
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
    // Update user's workshopIds
    await getUserAndUpdateWorkshopIds(newInfo.email, newInfo.workshopIds || []);
    // Check if whatsapp number has changed, if yes, send welcome message
    if (oldInfo.whatsapp !== newInfo.whatsapp && newInfo.whatsapp) {
      await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
    }
    // Check service providers's user role and if has changed, update user's role
    if (oldInfo.serviceType !== newInfo.serviceType) {
      const userInfo = await getDocumentInfo(COLLECTION_USERS, newInfo.userId);
      if (userInfo) {
        const isMatchedRole = checkUserRoleMatchToServiceType(newInfo.serviceType as ServiceProviderType, userInfo.role);
        if (!isMatchedRole) {
          // Update user's role
          await usersCollection.doc(userInfo.userId).update({
            role: getUserRoleFromServiceType(newInfo.serviceType as ServiceProviderType),
            isUpdatedFromOthers: true,
            updatedAt: FieldValue.serverTimestamp(),
          });
          logger.debug("=== Updated user ===");
        }
      }
    }
    // if isDisabled has changed, update user's status and send Email notification
    if (oldInfo.isDisabled !== newInfo.isDisabled) {
      const userInfo = await getDocumentInfo(COLLECTION_USERS, newInfo.userId);
      if (userInfo) {
        await usersCollection.doc(userInfo.userId).update({
          isDisabled: newInfo.isDisabled,
          isUpdatedFromOthers: true,
          updatedAt: FieldValue.serverTimestamp(),
        });
        logger.debug("=== Updated user ===");
      }
      // TODO: - Send email notification
    }
    //
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Remove appraiser Info if provider is Appraiser
    if (oldInfo.serviceType === ServiceProviderType.APPRAISER) {
      const appraiserInfo = await getFBDocumentWithParam(COLLECTION_APPRAISER_INFO, "appraiserId", event.params.serviceProviderId);
      if (appraiserInfo) {
        logger.debug("===Deleting Appraiser Info===");
        await appraiserCollection.doc(appraiserInfo.appraiserInfoId).delete();
      }
    }
    // Get Service Provider User Document
    const userInfo = await getDocumentInfo(COLLECTION_USERS, oldInfo.userId);
    if (userInfo) {
      await usersCollection.doc(userInfo.userId).delete();
      logger.debug("===Deleted user successfully===");
      // Find salesman with same userId and delete
      if (oldInfo.serviceType === ServiceProviderType.APPRAISER) {
        const salesman = await getFBDocumentWithParam(COLLECTION_SALESMAN, FIELD_USER_ID, userInfo.userId);
        if (salesman) {
          logger.debug("===Deleting Salesman concurrently from Appraiser deleting===");
          await salesmanCollection.doc(salesman.salesmanId).delete();
        }
      }
    }
  }
});

export const modifyAgent = onDocumentWritten(`${COLLECTION_AGENT}/{agentId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Create User
    try {
      const uid = await createNewUserAndSendEmail(newInfo, newInfo.workshopIds || [], UserRole.Agent);
      if (uid) {
        await agentCollection.doc(newInfo.agentId).set({ userId: uid }, { merge: true });
      }
      // Send whatsapp welcome message
      if (newInfo.whatsapp) {
        await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
      }
      const contractFiles: Record<string, string>[] = [];
      // Push DataProtection URL to contract files
      contractFiles.push({ doc_name: "Datenschutzvereinbarung(Data Protection Agreement)", doc_url: CONTRACT_FILE_URL });
      // Send commission contract PDF to Scrive
      const commissionFile = await generateCommissionContractPdf(newInfo);
      const fullName = `${newInfo.firstName} ${newInfo.lastName}`;
      if (commissionFile) {
        const commissionFileName = `agent_commission_contract_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${modifyFileName(fullName)}.pdf`;
        const commissionContractUrl = await makeCommissionContractSignatureFile(
          event.params.agentId,
          ContractDocTypes.AGENT_COMMISSION_CONTRACT,
          commissionFile,
          commissionFileName,
          fullName,
          newInfo.email,
          newInfo.phone);
        if (commissionContractUrl) {
          contractFiles.push({ doc_name: "Provisionsvereinbarung(Commission Agreement)", doc_url: `${SCRIVE_BASE_URL}${commissionContractUrl}` });
        }
      }
      // Send contract and commission email
      if (contractFiles.length) {
        await sendMailgunEmail(
          [newInfo.email],
          "Provisionsverbeinbarung zur digitalen Unterzeichnung",
          CONTRACT_CONFIRMATION_EMAIL,
          { data: contractFiles },
        );
      }
    } catch (error) {
      logger.error("=== Failed to create new user in Agent creation ===", error);
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
    // Update user's workshopIds
    await getUserAndUpdateWorkshopIds(newInfo.email, newInfo.workshopIds || []);
    // If whatsapp number has changed, send welcome message
    if (oldInfo.whatsapp !== newInfo.whatsapp && newInfo.whatsapp) {
      await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
    }
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Get Agent User Document
    const userInfo = await getDocumentInfo(COLLECTION_USERS, oldInfo.userId);
    if (userInfo) {
      await usersCollection.doc(userInfo.userId).delete();
      logger.debug("===Deleted user successfully===");
    }
  }
});

export const modifySalesman = onDocumentWritten(`${COLLECTION_SALESMAN}/{salesmanId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Create User
    try {
      // Create Appraisal User
      if (newInfo.isAppraiserToo) {
        await createServiceProviderFromSalesman(event.params.salesmanId);
      }
      let uid: string | null = null;
      const userRole = newInfo.isAppraiserToo ? UserRole.SalesAppraiser : UserRole.Salesman;
      // If salesman created from Appraiser, it just gets the UserId, if not, create new user and get uid
      if (newInfo.isSalesmanToo) {
        const userInfo = await getUserByEmail(newInfo.email);
        if (userInfo && userInfo.size === 1) {
          uid = userInfo.docs[0].id;
        }
      } else {
        uid = await createNewUserAndSendEmail(newInfo, newInfo.workshopIds || [], userRole);
        if (newInfo.whatsapp) {
          await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
        }
      }
      if (uid) {
        await salesmanCollection.doc(newInfo.salesmanId).set({ userId: uid }, { merge: true });
      }
    } catch (error) {
      logger.error("=== Failed to create new user in Salesman creation ===", error);
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
    // Update user's workshopIds
    await getUserAndUpdateWorkshopIds(newInfo.email, newInfo.workshopIds || []);
    // If whatsapp number has changed, send welcome message
    if (oldInfo.whatsapp !== newInfo.whatsapp && newInfo.whatsapp) {
      await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
    }
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Get Salesman User Document
    const userInfo = await getDocumentInfo(COLLECTION_USERS, oldInfo.userId);
    if (userInfo) {
      await usersCollection.doc(userInfo.userId).delete();
      logger.debug("===Deleted user successfully===");
      const serviceProvider = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, FIELD_USER_ID, userInfo.userId);
      if (serviceProvider) {
        await serviceProviderCollection.doc(serviceProvider.serviceProviderId).delete();
        console.log("===Deleted service provider concurrently from salesman deleting===");
      }
    }
  }
});

export const modifyServiceAdviser = onDocumentWritten(`${COLLECTION_SERVICE_ADVISER}/{adviserId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Create User
    try {
      const uid = await createNewUserAndSendEmail(newInfo, [newInfo.workshopId], UserRole.ServiceAdviser);
      if (uid) {
        await serviceAdviserCollection.doc(newInfo.adviserId).set({ userId: uid }, { merge: true });
      }
      // Send whatsapp welcome message
      if (newInfo.whatsapp) {
        await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
      }
    } catch (error) {
      logger.error("=== Failed to create new user in Service Adviser creation ===", error);
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete User Info
    const userInfo = await getDocumentInfo(COLLECTION_USERS, oldInfo.userId);
    if (userInfo) {
      await usersCollection.doc(userInfo.userId).delete();
      logger.debug("===Deleted user successfully===");
    }
  }
});

export const modifyWorkshop = onDocumentWritten(`${COLLECTION_WORKSHOPS}/{workshopId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Create new user and send Email with password:
    try {
      const uid = await createNewUserAndSendEmail(newInfo, [newInfo.workshopId], UserRole.Owner);
      // Update workshop info with user's uid
      if (uid) {
        await workShopCollection.doc(newInfo.workshopId).set({ userId: uid }, { merge: true });
      }
      // Initialize whatsapp number with welcome message
      if (newInfo.whatsapp) {
        await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
      }
      //
    } catch (err) {
      logger.error("====User creation error from workshop creation", err);
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===", oldInfo.whatsapp, newInfo.whatsapp);
    // Check if whatsapp has updated, if yes, send welcome message
    if (oldInfo.whatsapp !== newInfo.whatsapp && newInfo.whatsapp) {
      await sendWhatsAppWelcomeMessage(newInfo.whatsapp);
    }
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related users
    await removeWorkshopIdFromDoc(COLLECTION_SERVICE_PROVIDERS, "workshopIds", event.params.workshopId);
    await removeWorkshopIdFromDoc(COLLECTION_SALESMAN, "workshopIds", event.params.workshopId);
    await removeWorkshopIdFromDoc(COLLECTION_AGENT, "workshopIds", event.params.workshopId);
    // await removeWorkshopIdFromDoc(COLLECTION_USERS, "workshopIds", event.params.workshopId);
    await deleteAllDataWithField(COLLECTION_COST_ESTIMATES, "workshopId", event.params.workshopId);
    await deleteAllDataWithField(COLLECTION_USED_CAR, "workshopId", event.params.workshopId);
    await deleteAllDataWithField(COLLECTION_DAMAGE, "workshopId", event.params.workshopId);
    // Find user by email and delete
    const userInfo = await getUserByEmail(oldInfo.email);
    if (userInfo && userInfo.size === 1) {
      const workshopUser = userInfo.docs[0].data();
      logger.info("===Workshop User===", workshopUser);
      if (workshopUser && workshopUser.workshopIds.includes(event.params.workshopId)) {
        await userInfo.docs[0].ref.delete();
        logger.debug("===Deleted user===");
      }
    }
  }
});

export const modifyCostEstimates = onDocumentWritten(`${COLLECTION_COST_ESTIMATES}/{costEstimationId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Todo: Send Notification Email
    // Send Email to Appraiser
    // Find Appraiser with same workshopId
    const appraisers = await db.collection(COLLECTION_USERS).where("workshopIds", "array-contains", newInfo.workshopId).where("role", "==", UserRole.Appraiser).get();
    if (!appraisers.empty) {
      // Send email notifications to appraisers
      const appraiserEmails: string[] = [];
      appraisers.forEach((doc) => {
        const data = doc.data();
        if (data.email && data.email.length) {
          appraiserEmails.push(data.email);
        }
      });
      if (appraiserEmails.length) {
        await sendMailgunEmail(
          appraiserEmails,
          "Neue Aufgabe im SchadenNetzwerk verfügbar",
          KVA_NOTIFICATION,
          { url: `https://app.schadennetzwerk.com/cost_estimate/${newInfo.costEstimationId}/edit` },
        );
      }
    }
  }
  if (oldInfo && newInfo) { // Updating...
    // If update it, send notification email to workshop owner
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, newInfo.workshopId);
    if (workshop) {
      const email = workshop.email;
      if (email) {
        await sendMailgunEmail(
          [email],
          "Neue Aufgabe im SchadenNetzwerk verfügbar",
          KVA_NOTIFICATION,
          { url: `https://app.schadennetzwerk.com/cost_estimate/${newInfo.costEstimationId}/edit` },
        );
      }
    }
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related files:
    const fileUrls: string[] = [];
    CostEstimationFileKeys.forEach((fileKey) => {
      if (oldInfo[fileKey] && oldInfo[fileKey].length) {
        oldInfo[fileKey].forEach((url: string) => {
          fileUrls.push(url);
        });
      }
    });
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifyUsedCar = onDocumentWritten(`${COLLECTION_USED_CAR}/{usedCarId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Find Appraiser with same workshopId
    const appraisers = await db.collection(COLLECTION_USERS).where("workshopIds", "array-contains", newInfo.workshopId).where("role", "==", UserRole.Appraiser).get();
    if (!appraisers.empty) {
      // Send email notifications to appraisers
      const appraiserEmails: string[] = [];
      appraisers.forEach((doc) => {
        const data = doc.data();
        if (data.email && data.email.length) {
          appraiserEmails.push(data.email);
        }
      });
      if (appraiserEmails.length) {
        await sendMailgunEmail(
          appraiserEmails,
          "Neue Aufgabe im SchadenNetzwerk verfügbar",
          KVA_NOTIFICATION,
          { url: `https://app.schadennetzwerk.com/used_car/${newInfo.usedCarId}/edit` },
        );
      }
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
    // If update it, send notification email to workshop owner
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, newInfo.workshopId);
    if (workshop) {
      const email = workshop.email;
      if (email) {
        await sendMailgunEmail(
          [email],
          "Neue Aufgabe im SchadenNetzwerk verfügbar",
          KVA_NOTIFICATION,
          { url: `https://app.schadennetzwerk.com/used_car/${newInfo.usedCarId}/edit` },
        );
      }
    }
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related files:
    const fileUrls: string[] = [];
    CostEstimationFileKeys.forEach((fileKey) => {
      if (oldInfo[fileKey] && oldInfo[fileKey].length) {
        oldInfo[fileKey].forEach((url: string) => {
          fileUrls.push(url);
        });
      }
    });
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifyTransportDamage = onDocumentWritten(`${COLLECTION_TRANSPORT_DAMAGE}/{transportDamageId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    if (newInfo.receiverEmail) {
      await sendMailgunEmail(
        [newInfo.receiverEmail],
        "Neuer Transportschaden erfolgreich angelegt – jetzt prüfen",
        TRANSPORT_DAMAGE_CREATION,
        { link: "https://app.schadennetzwerk.com/" },
      );
    }
  }
  if (oldInfo && newInfo) { // Updating...
    // Todo: Send notification email
    logger.debug("===Updating Info===");
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related files:
    const fileUrls: string[] = [];
    TransportDamageFileKeys.forEach((fileKey) => {
      if (oldInfo[fileKey] && oldInfo[fileKey].length) {
        oldInfo[fileKey].forEach((url: string) => {
          fileUrls.push(url);
        });
      }
    });
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifySupportTicket = onDocumentWritten(`${COLLECTION_SUPPORT}/{supportId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Todo: Send Notification Email
  }
  if (oldInfo && newInfo) { // Updating...
    // Todo: Send notification email
    logger.debug("===Updating Info===");
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related files:
    const fileUrls: string[] = [];
    ["attachedFiles"].forEach((fileKey) => {
      if (oldInfo[fileKey] && oldInfo[fileKey].length) {
        oldInfo[fileKey].forEach((url: string) => {
          fileUrls.push(url);
        });
      }
    });
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifyDamageFile = onDocumentWritten(`${COLLECTION_DAMAGE_FILES}/{fileGroupId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Check Appraiser task, if yes, update fileUploadedAt time
    if (newInfo.category === FileCategories.APPRAISER && newInfo.subCategory === FileAppraiserCategories.EXPERT_OPINION) {
      const serviceTask = await getFBDocumentWithParam(COLLECTION_SERVICE_TASK, "damageId", newInfo.damageId);
      if (serviceTask && serviceTask.taskType === ServiceTaskTypes.APPRAISER_TASK) {
        await serviceTaskCollection.doc(serviceTask.serviceTaskId).update({ firstFileUploadedAt: FieldValue.serverTimestamp() });
      }
    }
    // Check if Lawyer task and update damage info
    if (newInfo.category === FileCategories.JUSTIZCAR) {
      if (newInfo.subCategory === FileJustizcarCategories.NOTIFICATION_TO_INSURANCE) {
        // Update damage info isInsuranceValuation to true
        await damageCollection.doc(newInfo.damageId).update({ isInsuranceValuation: true });
      }
    }
    // When upload repair approval file, update damage info repairApproved to true(Lawyer, appraiser, workshop and car rental, too)
    if (newInfo.subCategory === FileJustizcarCategories.REPAIR_APPROVAL) {
      // Update damage info isClaimForCompensation to true
      await damageCollection.doc(newInfo.damageId).update({ repairApproved: true });
    }
    sendEmailNotificationForFileUpload(newInfo);
  }
  if (oldInfo && newInfo) { // Updating...
    const oldFileCounts = oldInfo.files.length;
    const newFileCounts = newInfo.files.length;
    if (oldFileCounts < newFileCounts) {
      sendEmailNotificationForFileUpload(newInfo);
    }
    logger.debug("===Updating Info===");
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related files:
    const fileUrls: string[] = [];
    oldInfo.files.forEach((item: Record<string, any>) => {
      if (item.fileUrl) {
        fileUrls.push(item.fileUrl);
      }
    });
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifyDamage = onDocumentWritten(`${COLLECTION_DAMAGE}/{damageId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Creating Damage RKU file signature
    try {
      const signatoryResult: { taskType: string, docType: string, apiUrl: string }[] = [];
      // Check if workshopId is exist and userId is exist
      if (!newInfo.workshopId && !newInfo.insuranceAgent && !newInfo.appraiserRef) {
        // Find service provider info with userId
        const serviceProvider = await getFBDocumentWithParam(COLLECTION_SERVICE_PROVIDERS, FIELD_USER_ID, newInfo.userId);
        if (serviceProvider && serviceProvider.serviceType === ServiceProviderType.APPRAISER) {
          newInfo.appraiserId = serviceProvider.serviceProviderId;
        }
        if (serviceProvider && serviceProvider.serviceType === ServiceProviderType.ATTORNEY) {
          newInfo.attorneyId = serviceProvider.serviceProviderId;
        }
      }
      // Create RKU file
      if (newInfo.isRkuOn && newInfo.workshopId) {
        const rkuFileName = `rku_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${newInfo.orderNumber}.pdf`;
        const file = await generateRcaPdf(newInfo, rkuFileName);
        logger.debug("===Damage File Name===", rkuFileName);
        if (file) {
          const rkuUrl = await makeSignatureFile(newInfo, "", DamageDocCategory.DAMAGE, file, rkuFileName, false);
          if (rkuUrl) {
            signatoryResult.push({ taskType: "Hauptauftrag RKÜ", docType: "", apiUrl: `${SCRIVE_BASE_URL}${rkuUrl}` });
          }
        }
      }
      // Check Service Tasks and make eSign files
      const signedStatus = newInfo.isManualCreating ? ServiceTaskStatusTypes.SIGNED : ServiceTaskStatusTypes.CREATED;
      // && newInfo.isManualCreating => means that don't make any eSign file and don't send email notification because it's already fulfilled manually on paper
      // Attorney
      if (newInfo.attorneyId) {
        await createServiceTask(ServiceTaskTypes.ATTORNEY_TASK, newInfo.descriptionForAttorney, newInfo.attorneyId, newInfo, signedStatus);
        if (!newInfo.isManualCreating) {
          const file = await generateAttorneyPdf(newInfo);
          if (file) {
            const fileName = `rechtsanwalt_abtretung_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${newInfo.orderNumber}.pdf`;
            const deliveryUrl = await makeSignatureFile(newInfo, newInfo.attorneyId, DamageDocCategory.SERVICE_TASK, file, fileName, false, ServiceTaskTypes.ATTORNEY_TASK);
            if (deliveryUrl) {
              signatoryResult.push({ taskType: "Vollmacht Anwalt", docType: "", apiUrl: `${SCRIVE_BASE_URL}${deliveryUrl}` });
            }
          }
        }
      }
      // Appraiser
      if (newInfo.appraiserId) {
        // Check if appraiserInfo is exist
        const appraiserInfo = await getFBDocumentWithParam(COLLECTION_APPRAISER_INFO, "appraiserId", newInfo.appraiserId);
        if (appraiserInfo) {
          await createServiceTask(ServiceTaskTypes.APPRAISER_TASK, newInfo.descriptionForAppraiser, newInfo.appraiserId, newInfo, signedStatus);
          if (!newInfo.isManualCreating) {
            const file = await generateAppraiserPdf(newInfo, appraiserInfo);
            if (file) {
              const fileName = `gutachter_abtretung_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${newInfo.orderNumber}.pdf`;
              const deliveryUrl = await makeSignatureFile(newInfo, newInfo.appraiserId, DamageDocCategory.SERVICE_TASK, file, fileName, false, ServiceTaskTypes.APPRAISER_TASK);
              if (deliveryUrl) {
                signatoryResult.push({ taskType: "Auftrag Gutachter", docType: "", apiUrl: `${SCRIVE_BASE_URL}${deliveryUrl}` });
              }
            }
          }
        } else {
          logger.debug("===Appraiser Info is not exist===");
        }
      }
      // CarRental
      if (newInfo.carRentalId) {
        await createServiceTask(ServiceTaskTypes.CAR_RENTAL_TASK, newInfo.descriptionForCarRental, newInfo.carRentalId, newInfo, signedStatus);
        if (!newInfo.isManualCreating) {
          const assignedFile = await generateCarRentalAssignmentPdf(newInfo);
          if (assignedFile) {
            const fileName = `unfallersatz_abtretung_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${newInfo.orderNumber}.pdf`;
            const deliveryUrl = await makeSignatureFile(newInfo, newInfo.carRentalId, DamageDocCategory.SERVICE_TASK, assignedFile, fileName, false, ServiceTaskTypes.CAR_RENTAL_TASK);
            if (deliveryUrl) {
              signatoryResult.push({ taskType: "Auftrag Unfallersatz", docType: "Abtretung", apiUrl: `${SCRIVE_BASE_URL}${deliveryUrl}` });
            }
          }
        }
      }
      // Create ChatGroup with damage related users
      await createChatGroupFromDamage(newInfo);
      // Send Email and SMS to the customer
      if (signatoryResult.length) {
        const attachedFiles: fileAttachType[] = [];
        if (newInfo.willSendPriceList && newInfo.appraiserId) {
          attachedFiles.push({ filename: "Honorar_Gutachter_neutral.pdf", url: PRICE_LIST_URL });
        }
        if (newInfo.attorneyId) {
          attachedFiles.push({ filename: "Widerruf_Anwalt.pdf", url: CANCEL_DOC_URL });
        }
        if (attachedFiles.length) {
          await sendMailgunEmail(
            [newInfo.customerEmail],
            "Digitale Unterzeichnung erforderlich - Aktion erbeten",
            SIGNATURE_REQUESTING_EMAIL,
            { data: signatoryResult },
            "",
            attachedFiles,
          );
        } else {
          await sendMailgunEmail(
            [newInfo.customerEmail],
            "Digitale Unterzeichnung erforderlich - Aktion erbeten",
            SIGNATURE_REQUESTING_EMAIL,
            { data: signatoryResult },
          );
        }
        // Send SMS or WhatsAPP Message
        let links = "LINKS: ";
        if (newInfo.isRkuOn && newInfo.workshopId) {
          links += `Hauptauftrag RKÜ: ${signatoryResult[0].apiUrl}, `;
        }
        const slicedArr = newInfo.isRkuOn && newInfo.workshopId ? signatoryResult.slice(1) : signatoryResult;
        if (slicedArr.length) {
          slicedArr.forEach((item) => {
            links += `${item.taskType} ${item.docType}: ${item.apiUrl}, `;
          });
        }
        const textContent = {
          1: newInfo.customerVehicleLicensePlate,
          2: newInfo.tortfeasorVehicleLicensePlate,
          3: dayjs(newInfo.damageDate.toDate()).format("DD.MM.YYYY"),
          4: links,
          //5: `https://app.schadennetzwerk.com/damage-overview/${newInfo.damageId}`,
          5: ``
        };
        if (newInfo.customerWhatsapp) {
          await sendWhatsAppSMS(DAMAGE_LINKS_CONTENT_SID, newInfo.customerWhatsapp, textContent);
        } else {
          await sendSMS(DAMAGE_LINKS_CONTENT_SID, newInfo.customerPhone, textContent);
        }
      }
      // Send delayed email to the customer if willSendDelayedReminder is true
      // if (newInfo.willSendDelayedReminder) {
      //   // Send email after 10 Mins to injured party
      //   const scheduledTime = addMinutesToDate(10);
      //   await sendScheduledEmail(
      //     [newInfo.customerEmail],
      //     "Bestätigung Ihres Mandates zu dem KFZ-Haftpflichtschaden - SchadenNetzwerk",
      //     SEND_REMINDER_EMAIL_AFTER_TEN_MINS,
      //     "",
      //     "",
      //     scheduledTime.toUTCString(),
      //   );
      // }
      // Send notification email to Paint shop Service Provider
      if (newInfo.paintShopId) {
        await createServiceTask(ServiceTaskTypes.PAINT_SHOP_TASK, newInfo.descriptionForPaintShop, newInfo.paintShopId, newInfo, signedStatus);
        const serviceProvider = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, newInfo.paintShopId);
        if (!newInfo.isManualCreating) {
          if (serviceProvider) {
            await sendMailgunEmail(
              [serviceProvider.email],
              "Sie haben einen neuen Auftrag",
              SERVICE_ASSIGNMENT,
              {
                customer: `${newInfo.customerFirstName} ${newInfo.customerLastName}`,
                tortfeasor: `${newInfo.tortfeasorFirstName} ${newInfo.tortfeasorLastName}`,
                serviceName: "Lack & Karosserie",
                desc: newInfo.descriptionForPaintShop,
                providerEmail: serviceProvider.email,
              },
            );
          }
        }
      }
      // Send notification email, to Towing Service Provider
      if (newInfo.towingServiceId) {
        await createServiceTask(ServiceTaskTypes.TOWING_SERVICE_TASK, newInfo.descriptionForTowingService, newInfo.towingServiceId, newInfo, signedStatus);
        if (!newInfo.isManualCreating) {
          const serviceProvider = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, newInfo.towingServiceId);
          if (serviceProvider) {
            await sendMailgunEmail(
              [serviceProvider.email],
              "Sie haben einen neuen Auftrag",
              SERVICE_ASSIGNMENT,
              {
                customer: `${newInfo.customerFirstName} ${newInfo.customerLastName}`,
                tortfeasor: `${newInfo.tortfeasorFirstName} ${newInfo.tortfeasorLastName}`,
                serviceName: "Abschleppdienst",
                desc: newInfo.descriptionForTowingService,
                providerEmail: serviceProvider.email,
              },
            );
          }
        }
      }
    } catch (error) {
      logger.error("===Creating Damage Doc Error ===", error);
    }
    //
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
    // Save notification data when update repairApproved to true
    if (newInfo.repairApproved && oldInfo.repairApproved !== newInfo.repairApproved) {
      await sendDamageUpdateNotification(
        newInfo,
        APPRAISER_APPROVED_REPAIR_APPROVAL,
        NotificationTypes.REPAIR_APPROVED,
        REPAIR_APPROVAL_EMAIL
      );
    }
    // Save notfication data when isInsuranceValuation is changed to true
    if (newInfo.isInsuranceValuation && oldInfo.isInsuranceValuation !== newInfo.isInsuranceValuation) {
      await sendDamageUpdateNotification(
        newInfo,
        INSURANCE_VALUATION_NOTIFICATION,
        NotificationTypes.INSURANCE_VALUATION,
        INSURANCE_VALUATION_EMAIL
      );
    }
    // When close the damage, save internal notification data
    if (newInfo.status === DamageStatusType.FINISHED) {
      const workshopId = newInfo.workshopId;
      const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, workshopId);
      if (workshop) {
        // Save internal notification data
        const notificationData: Record<string, unknown> = {
          title: JSON.stringify({ title: LAWYER_CLOSED_DAMAGE, name: "" }),
          type: NotificationTypes.DAMAGE_CLOSED,
          senderId: "system",
          senderPhotoURL: null,
          receiverId: workshop.userId,
          chatRoomId: null,
          linkUrl: "/damages",
          isUnread: true,
          isArchived: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        const docRef = notificationCollection.doc();
        notificationData.notificationId = docRef.id;
        await docRef.set(notificationData);
      }
    }
    // If creator is service adviser, send new email with pdf to paint shop
    if (newInfo.paintShopId && newInfo.paintShopPdfUrl && newInfo.paintShopPdfUrl !== "" && newInfo.paintShopPdfUrl !== oldInfo.paintShopPdfUrl) {
      // Logger
      logger.debug("===Sending Message===");
      // Save to damage file
      const serviceProvider = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, newInfo.paintShopId);
      if (serviceProvider) {
        const paintShopFileName = `paintShop_file_${dayjs(new Date()).format("YYYYMMDDHHmmss")}_${modifyFileName(newInfo.orderNumber)}.pdf`;
        const downloadURL = newInfo.paintShopPdfUrl;
        // Log
        logger.debug("===Paint Shop File URL===", downloadURL);
        // Save to damage files collection
        const now = new Date();
        const seconds = Math.round(now.getTime() / 1000);
        const fileData: Record<string, any> = {
          damageId: newInfo.damageId,
          category: FileCategories.PAINT_SHOP,
          subCategory: FilePaintShopCategories.PAINT_SHOP_ORDER,
          files: [
            {
              name: paintShopFileName,
              fileUrl: downloadURL,
              uploadedAt: seconds,
              creatorRole: UserRole.ServiceAdviser,
              creatorId: newInfo.userId,
            },
          ],
          createdAt: FieldValue.serverTimestamp(),
        };
        const docRef = damageFileCollection.doc();
        fileData.fileGroupId = docRef.id;
        await docRef.set(fileData);
        // Send email to service adviser with pdf attached
        await sendMailgunEmail(
          [serviceProvider.email],
          "Lackierauftrag - SchadenNetzwerk.com",
          PAINT_SHOP_ORDER_FROM_SERVICE_ADVISER,
          "",
          "",
          [{ filename: paintShopFileName, url: downloadURL }],
        );
      }
    }
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Delete related Service Tasks
    await deleteAllDataWithField(COLLECTION_SERVICE_TASK, "damageId", oldInfo.damageId);
    // Delete signing docs which have damageId
    // await deleteAllDataWithField(COLLECTION_SIGNING_DOCS, "damageId", oldInfo.damageId);
    // Delete damage related files info
    // await deleteAllDataWithField(COLLECTION_DAMAGE_FILES, "damageId", oldInfo.damageId);
    // Delete related chat group
    await deleteAllDataWithField(COLLECTION_CHAT_GROUP, "damageId", oldInfo.damageId);
    // Delete related files:
    const fileUrls: string[] = oldInfo.documents;
    const repairScheduleDoc: string | null = oldInfo.repairScheduleDoc;
    if (repairScheduleDoc) {
      fileUrls.push(repairScheduleDoc);
    }
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifyRepairConfirmation = onDocumentWritten(`${COLLECTION_REPAIR_CONFIRMATION}/{repairConfirmId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Info===");
    // Send Email to the customer
    const damage = await getDocumentInfo(COLLECTION_DAMAGE, newInfo.damageId);
    // add repair confirmation id to damage
    if (damage) {
      await damageCollection.doc(damage.damageId).set({ repairConfirmId: newInfo.repairConfirmId }, { merge: true });
    }
  }
  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Info===");
  }
  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Info===");
    // Remove repair confirmation id from damage
    const damage = await getDocumentInfo(COLLECTION_DAMAGE, oldInfo.damageId);
    if (damage) {
      await damageCollection.doc(damage.damageId).set({ repairConfirmId: "" }, { merge: true });
    }
    // Delete related files:
    const { frontImages, closeImages, rearImages, distanceImages, vehicleDocumentImages, otherImages } = oldInfo.images;
    const fileUrls = [...frontImages, ...closeImages, ...rearImages, ...distanceImages, ...vehicleDocumentImages, ...otherImages];
    if (fileUrls.length) {
      try {
        await Promise.all(fileUrls.map(async (fileUrl) => {
          const filePath = getFilePathFromUrl(fileUrl);
          logger.info("===File Path===", filePath);
          if (filePath) {
            await bucket.file(filePath).delete();
          }
        }));
      } catch (error) {
        logger.debug("=====Failed to delete file=====", error);
      }
    }
  }
});

export const modifyServiceTask = onDocumentWritten(`${COLLECTION_SERVICE_TASK}/{serviceTaskId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  try {
    if (!oldInfo && newInfo) { // Creating...
      logger.debug("===Creating Info===");
    }
    if (oldInfo && newInfo) { // Updating...
      logger.debug("===Updating Info===");
      if (oldInfo.status === ServiceTaskStatusTypes.CREATED && newInfo.status === ServiceTaskStatusTypes.SIGNED) {
        // Update service task signedAt time
        if (newInfo.taskType === ServiceTaskTypes.APPRAISER_TASK) {
          await serviceTaskCollection.doc(newInfo.serviceTaskId).set({ signedAt: FieldValue.serverTimestamp() }, { merge: true });
        }
        // Send Email and SMS
        const serviceProvider = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, newInfo.serviceProviderId);
        const damage = await getDocumentInfo(COLLECTION_DAMAGE, newInfo.damageId);
        if (serviceProvider && damage) {
          // Send Email first
          await sendMailgunEmail(
            [serviceProvider.email],
            "Sie haben einen neuen Auftrag",
            SERVICE_ASSIGNMENT,
            {
              customer: `${damage.customerFirstName} ${damage.customerLastName}`,
              tortfeasor: `${damage.tortfeasorFirstName} ${damage.tortfeasorLastName}`,
              serviceName: getServiceNameFromServiceTaskType(newInfo.taskType),
              desc: newInfo.notes,
              providerEmail: serviceProvider.email,
            },
          );
          // Then Send SMS
          // eslint-disable-next-line max-len
          if (serviceProvider.whatsapp) {
            await sendWhatsAppSMS(ORDER_RECEIVED_CONTENT_SID, serviceProvider.whatsapp, { email: serviceProvider.email });
          } else {
            await sendSMS(ORDER_RECEIVED_CONTENT_SID, serviceProvider.phone, { email: serviceProvider.email });
          }
        }
      }
      if (oldInfo.status === ServiceTaskStatusTypes.SIGNED && newInfo.status === ServiceTaskStatusTypes.ACCEPTED) {
        const damage = await getDocumentInfo(COLLECTION_DAMAGE, newInfo.damageId);
        const serviceProvider = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, newInfo.serviceProviderId);
        if (damage && serviceProvider) {
          // if service task is Appraiser task, Update service task acceptedAt time
          if (newInfo.taskType === ServiceTaskTypes.APPRAISER_TASK) {
            await serviceTaskCollection.doc(newInfo.serviceTaskId).set({ acceptedAt: FieldValue.serverTimestamp() }, { merge: true });
          }
          const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damage.workshopId);
          if (workshop) {
            // Send Email
            await sendMailgunEmail(
              [workshop.email],
              "Ihr Auftrag wurde angenommen",
              SERVICE_CONFIRMATION_EMAIL,
              { service_provider: `${getServiceNameFromServiceTaskType(newInfo.taskType)}: ${serviceProvider.name}(${serviceProvider.email})` },
            );
          }
        }
      }
      // if (oldInfo.status === ServiceTaskStatusTypes.ACCEPTED && newInfo.status === ServiceTaskStatusTypes.FINISHED) {
      //   const damage = await getDocumentInfo(COLLECTION_DAMAGE, newInfo.damageId);
      //   // Update damage status to "finished"
      //   if (damage) {
      //     await damageCollection.doc(damage.damageId).set({ status: DamageStatusType.FINISHED, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      //   }
      // }
    }
    if (oldInfo && !newInfo) { // Deleting...
      logger.debug("===Deleting Info===");
    }
  } catch (error) {
    logger.error("===== Modify ServiceTask Error =====", error);
  }
});

export const modifyRepairPlanDoc = onDocumentWritten(`${COLLECTION_REPAIR_DOCUMENTS}/{repairPlanDocId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  try {
    if (oldInfo && newInfo) { // Updating...
      // Remove old file if update the doc
      if (oldInfo.fileUrl !== newInfo.fileUrl) {
        const filePath = getFilePathFromUrl(oldInfo.fileUrl);
        logger.debug("===Repair Plan File Path===", filePath);
        if (filePath) {
          await bucket.file(filePath).delete();
        }
      }
    }
    if (oldInfo && !newInfo) { // Deleting...
      logger.debug("===Deleting Info===");
      // Remove related file
      const filePath = getFilePathFromUrl(oldInfo.fileUrl);
      logger.debug("===Repair Plan File Path===", filePath);
      if (filePath) {
        await bucket.file(filePath).delete();
      }
    }
  } catch (error) {
    logger.error("===== Modify RepairPlanDoc Error =====", error);
  }
});

export const modifyChatRoom = onDocumentWritten(`${COLLECTION_CHAT_ROOM}/{chatRoomId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  try {
    if (!oldInfo && newInfo) { // Creating...
      logger.debug("===Creating Info===");
    }
    if (oldInfo && newInfo) { // Updating...
      logger.debug("===Updating Info===");
    }
    if (oldInfo && !newInfo) { // Deleting...
      logger.debug("===Deleting Info===");
      // Delete related chatMessages
      await deleteAllDataWithField(COLLECTION_CHAT_MESSAGE, "chatRoomId", event.params.chatRoomId);
    }
  } catch (error) {
    logger.error("===== Modify ChatRoom Error =====", error);
  }
});

export const modifyChatMessage = onDocumentWritten(`${COLLECTION_CHAT_MESSAGE}/{chatMessageId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  try {
    if (!oldInfo && newInfo) { // Creating...
      logger.debug("===Creating Info===");
      // Update chatRoom unreadCount and lastMessage
      const chatRoom = await getDocumentInfo(COLLECTION_CHAT_ROOM, newInfo.chatRoomId);
      if (chatRoom) {
        const newUnreadCount = chatRoom.unreadCount + 1;
        let readAts: null | Record<string, any> = null;
        if (chatRoom.participants && chatRoom.participants.includes(newInfo.senderId)) {
          const senderReadAt: Record<string, FieldValue> = {
            [newInfo.senderId]: FieldValue.serverTimestamp(),
          };
          readAts = chatRoom.readAts ? { ...chatRoom.readAts, ...senderReadAt } : senderReadAt;
        }
        const dbData: any = {
          lastMessage: newInfo.message,
          lastSenderId: newInfo.senderId,
          unreadCount: newUnreadCount,
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (readAts) {
          dbData.readAts = readAts;
        }
        await chatRoomCollection.doc(newInfo.chatRoomId).set(dbData, { merge: true });

        // Create internal notification
        // Find receivers
        const receivers = chatRoom.participants.filter((id: string) => id !== newInfo.senderId);
        // Find sender info
        const sender = await getDocumentInfo(COLLECTION_USERS, newInfo.senderId);
        await Promise.all(receivers.map(async (receiverId: string) => {
          // Check if same notification is exist
          const notification = await notificationCollection
            .where("chatRoomId", "==", newInfo.chatRoomId)
            .where("receiverId", "==", receiverId)
            .where("isUnread", "==", true)
            .where("isArchived", "==", false)
            .get();
          if (notification.empty) { // if doesn't exist, create new one
            const notificationData: Record<string, unknown> = {
              title: JSON.stringify({ title: YOU_HAVE_NEW_CHAT_MESSAGE, name: sender?.fullName || `${sender?.firstName} ${sender?.lastName}` || sender?.email }),
              type: NotificationTypes.CHAT,
              senderId: newInfo.senderId,
              senderPhotoURL: sender?.photoURL || null,
              receiverId,
              chatRoomId: newInfo.chatRoomId,
              linkUrl: `/chat?id=${newInfo.chatRoomId}`,
              isUnread: true,
              isArchived: false,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            };
            if (chatRoom.damageId && chatRoom.damageId !== "common") {
              notificationData.damageId = chatRoom.damageId;
              notificationData.linkUrl = `/chat/${chatRoom.damageId}/room?id=${newInfo.chatRoomId}`;
            }
            const docRef = notificationCollection.doc();
            notificationData.notificationId = docRef.id;
            await docRef.set(notificationData);
          }
        }));
      }
    }
    if (oldInfo && newInfo) { // Updating...
      logger.debug("===Updating Info===");
    }
    if (oldInfo && !newInfo) { // Deleting...
      logger.debug("===Deleting Info===");
      // Remove file if exist
      if (oldInfo.attachment) {
        const filePath = getFilePathFromUrl(oldInfo.attachment);
        logger.debug("===Chat Message File Path===", filePath);
        if (filePath) {
          await bucket.file(filePath).delete();
        }
      }
    }
  } catch (error) {
    logger.error("===== Modify ChatMessage Error =====", error);
  }
});

export const modifyChatGroup = onDocumentWritten(`${COLLECTION_CHAT_GROUP}/{chatGroupId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;
  try {
    if (!oldInfo && newInfo) { // Creating...
      logger.debug("===Creating Info===");
      // Add chatGroupId to related damage
      const damage = await getDocumentInfo(COLLECTION_DAMAGE, newInfo.damageId);
      if (damage) {
        await damageCollection.doc(damage.damageId).set({ chatGroupId: newInfo.chatGroupId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
    }
    if (oldInfo && newInfo) { // Updating...
      logger.debug("===Updating Info===");
    }
    if (oldInfo && !newInfo) { // Deleting...
      logger.debug("===Deleting Info===");
      // Delete related chatMessages
    }
  } catch (error) {
    logger.error("===== Modify ChatGroup Error =====", error);
  }
});

export const modifyDamageInvoiceInfo = onDocumentWritten(`${COLLECTION_DAMAGE_INVOICE_INFO}/{damageInvoiceInfoId}`, async (event) => {
  const oldInfo = event.data?.before.exists ? event.data.before.data() : null;
  const newInfo = event.data?.after.exists ? event.data.after.data() : null;

  if (!oldInfo && newInfo) { // Creating...
    logger.debug("===Creating Damage Invoice Info===");
    try {
      // Update damage with invoiceId
      const damage = await getDocumentInfo(COLLECTION_DAMAGE, newInfo.damageId);
      if (damage) {
        await damageCollection.doc(damage.damageId).set({ invoiceId: newInfo.damageInvoiceInfoId }, { merge: true });
        // if legal action is 'no', update damage with isComplaint
        if (newInfo.legalAction === "no") {
          await damageCollection.doc(newInfo.damageId).set({ isComplaint: true }, { merge: true });
        } else if (newInfo.legalAction === "yes") {
          // Save notfication data when isComplaint is changed to true
          await sendDamageUpdateNotification(
            damage,
            COMPLAINT_NOTIFICATION,
            NotificationTypes.COMPLAINT,
            OPEN_CLAIM_LEGAL_ACTION_EMAIL
          );
        }
      } else {
        logger.error("Damage not found for damageId:", newInfo.damageId);
        return;
      }
    } catch (error) {
      logger.error("===Create Damage Invoice Info Error===", error);
    }
  }

  if (oldInfo && newInfo) { // Updating...
    logger.debug("===Updating Damage Invoice Info===");
    try {
      // Check if files were removed and clean them up
      const oldFiles = oldInfo.files || [];
      const newFiles = newInfo.files || [];

      // Find files that were removed
      const removedFiles = oldFiles.filter((oldFile: string) => !newFiles.includes(oldFile));

      // Delete removed files from storage
      if (removedFiles.length > 0) {
        await Promise.all(removedFiles.map(async (fileUrl: string) => {
          const filePath = getFilePathFromUrl(fileUrl);
          if (filePath) {
            try {
              await bucket.file(filePath).delete();
              logger.debug("Deleted file:", filePath);
            } catch (deleteError) {
              logger.error("Error deleting file:", filePath, deleteError);
            }
          }
        }));
      }
    } catch (error) {
      logger.error("===Update Damage Invoice Info Error===", error);
    }
  }

  if (oldInfo && !newInfo) { // Deleting...
    logger.debug("===Deleting Damage Invoice Info===");
    try {
      // Clean up all associated files
      const files = oldInfo.files || [];
      if (files.length > 0) {
        await Promise.all(files.map(async (fileUrl: string) => {
          const filePath = getFilePathFromUrl(fileUrl);
          if (filePath) {
            try {
              await bucket.file(filePath).delete();
              logger.debug("Deleted file:", filePath);
            } catch (deleteError) {
              logger.error("Error deleting file:", filePath, deleteError);
            }
          }
        }));
      }
    } catch (error) {
      logger.error("===Delete Damage Invoice Info Error===", error);
    }
  }
});

const deleteAllDataWithField = async (collectionName: string, fieldPath: string, value: string) => {
  const querySnap = await db.collection(collectionName).where(fieldPath, "==", value).get();
  querySnap.forEach((documentSnap) => {
    documentSnap.ref.delete();
  });
};

const removeWorkshopIdFromDoc = async (collectionName: string, fieldPath: string, value: string) => {
  const querySnap = await db.collection(collectionName).where(fieldPath, "array-contains", value).get();
  const promises: unknown[] = [];
  querySnap.forEach((documentSnap) => {
    const data = documentSnap.data();
    const workshopIds = data.workshopIds;
    if (workshopIds && workshopIds.length) {
      const newWorkshopIds = workshopIds.filter((id: string) => id !== value);
      promises.push(documentSnap.ref.set({ workshopIds: newWorkshopIds, updatedAt: FieldValue.serverTimestamp() }, { merge: true }));
    }
  });
  await Promise.all(promises);
};

const createNewUserAndSendEmail = async (data: Record<string, any>, workshopIds: string[], role: UserRole) => {
  const password = generateRandPassword();
  const userRecord = await createAuthUser(data.email, password);
  // Get first and last name from full name
  let firstName = "";
  let lastName = "";
  let fullName = "";
  if (data.firstName && data.lastName) {
    firstName = data.firstName;
    lastName = data.lastName;
  } else {
    const splitedName = data.name.split(" ");
    if (splitedName.length === 2) {
      firstName = splitedName[0];
      lastName = splitedName[1];
    } else if (splitedName.length === 1) {
      firstName = splitedName[0];
    } else {
      firstName = data.name;
    }
  }
  fullName = `${firstName} ${lastName}`;
  if (userRecord) {
    const userDocData = {
      userId: userRecord.uid,
      email: data.email,
      emailKeyList: generateKeywords(data.email),
      firstName,
      lastName,
      fullName,
      whatsapp: data.whatsapp,
      phone: data.phone,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      workshopIds,
      role,
      isDisabled: false,
      deletedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await usersCollection.doc(userRecord.uid).set(userDocData);
    // Send email
    const emailAccounts: string[] = [data.email];
    if (role === UserRole.Owner) {
      emailAccounts.push(data.otherEmails.ceoEmail);
    }
    await sendMailgunEmail(
      emailAccounts,
      "Willkommen im SchadenNetzwerk, dem innovativen Portal für Schadenmanagement",
      USER_CREATION_EMAIL_TEMP,
      { email: data.email, password },
    );
    return userRecord.uid;
  }
  return null;
};

export const updateUserBasicInfo = async (data: Record<string, any>, userId: string, hasFullName = false) => {
  try {
    let firstName = "";
    let lastName = "";
    if (!hasFullName) {
      const splitedName = data.name.split(" ");
      if (splitedName.length === 2) {
        firstName = splitedName[0];
        lastName = splitedName[1];
      } else if (splitedName.length === 1) {
        firstName = splitedName[0];
      }
    } else {
      firstName = data.firstName;
      lastName = data.lastName;
    }
    const userDocData = {
      firstName,
      lastName,
      whatsapp: data.whatsapp,
      phone: data.phone,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      isUpdatedFromOthers: true,
      updatedAt: FieldValue.serverTimestamp(),
    };
    await usersCollection.doc(userId).set(userDocData, { merge: true });
  } catch (error) {
    logger.error("=== Update User Basic Info Error ===", error);
  }
};

const createServiceTask = async (taskType: ServiceTaskTypes, notes: string, serviceProviderId: string, damageInfo: FirebaseFirestore.DocumentData, signedStatus = ServiceTaskStatusTypes.CREATED) => {
  const docRef = serviceTaskCollection.doc();
  const dbData: Record<string, any> = {
    serviceTaskId: docRef.id,
    taskType,
    notes,
    serviceProviderId,
    damageId: damageInfo.damageId,
    orderNumber: damageInfo.orderNumber,
    orderNumberKeyList: damageInfo.orderNumberKeyList,
    customerName: `${damageInfo.customerFirstName} ${damageInfo.customerLastName}`,
    damageDate: damageInfo.damageDate,
    cLicensePlate: damageInfo.customerVehicleLicensePlate,
    status: signedStatus,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (damageInfo.workshopId) {
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
    if (workshop) {
      logger.debug("===Can find workshop===", workshop);
      const workshopInfo = {
        workshopId: workshop.workshopId,
        workshopName: workshop.name,
        workshopStreet: workshop.street,
        workshopCity: workshop.city,
        workshopPostalCode: workshop.postalCode,
        workshopEmail: workshop.email,
        workshopPhone: workshop.phone,
        workshopWhatsapp: workshop.whatsapp,
      };
      logger.debug("===Workshop Info in Servie Task===", workshopInfo);
      dbData.workshopInfo = workshopInfo;
    }
  }
  logger.debug("=== Updated DB data ===", dbData);
  await docRef.set(dbData, { merge: true });
};

const createServiceProviderFromSalesman = async (salesmanId: string) => {
  const salesmanInfo = await getDocumentInfo(COLLECTION_SALESMAN, salesmanId);
  if (salesmanInfo) {
    // Check if same email already exists
    const emailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SERVICE_PROVIDERS, FIELD_EMAIL, salesmanInfo.email);
    if (emailCheck === QueryResultType.RESULT_SUCCESS) {
      delete salesmanInfo.numberKeyList;
      delete salesmanInfo.nameKeyList;
      const dbData: Record<string, unknown> = {
        ...salesmanInfo,
        serviceType: ServiceProviderType.APPRAISER,
        nameKeyList: generateKeywords(salesmanInfo.name),
        emailKeyList: generateKeywords(salesmanInfo.email),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      const docRef = serviceProviderCollection.doc();
      dbData.serviceProviderId = docRef.id;
      await docRef.set(dbData, { merge: true });
    }
  }
};

export const updateServiceProviderFromSalesman = async (salesmanInfo: Record<string, any>, serviceProviderInfo: Record<string, any>) => {
  const dbData: Record<string, unknown> = {
    ...salesmanInfo,
    serviceType: ServiceProviderType.APPRAISER,
    nameKeyList: generateKeywords(salesmanInfo.name),
    emailKeyList: generateKeywords(salesmanInfo.email),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const docRef = serviceProviderCollection.doc(serviceProviderInfo.serviceProviderId);
  await docRef.update(dbData);
};

const createSalesmanFromAppraiser = async (serviceProviderId: string) => {
  const serviceProviderInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, serviceProviderId);
  if (serviceProviderInfo) {
    // Check if same email already exists
    const emailCheck: QueryResultType = await checkFieldDuplicated(COLLECTION_SALESMAN, FIELD_EMAIL, serviceProviderInfo.email);
    if (emailCheck === QueryResultType.RESULT_SUCCESS) {
      delete serviceProviderInfo.nameKeyList;
      delete serviceProviderInfo.emailKeyList;
      const dbData: Record<string, unknown> = {
        ...serviceProviderInfo,
        nameKeyList: generateKeywords(serviceProviderInfo.name),
        numberKeyList: generateKeywords(serviceProviderInfo.salesmanNumber),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      };
      const docRef = salesmanCollection.doc();
      dbData.salesmanId = docRef.id;
      await docRef.set(dbData, { merge: true });
    }
  }
};

export const updateSalesmanFromAppraiser = async (serviceProviderInfo: Record<string, any>, salesmanInfo: Record<string, any>) => {
  const dbData: Record<string, unknown> = {
    ...serviceProviderInfo,
    nameKeyList: generateKeywords(serviceProviderInfo.name),
    numberKeyList: generateKeywords(serviceProviderInfo.salesmanNumber),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const docRef = salesmanCollection.doc(salesmanInfo.salesmanId);
  await docRef.update(dbData);
};

const getUserAndUpdateWorkshopIds = async (email: string, workshopIds: string[]) => {
  const userInfo = await getUserByEmail(email);
  if (userInfo && userInfo.size === 1) {
    let userId = "";
    userInfo.forEach((documentSnapshot) => {
      const info = documentSnapshot.data();
      userId = info.userId;
    });
    if (userId !== "") {
      await usersCollection.doc(userId).set({
        workshopIds,
        isUpdatedFromOthers: true,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  }
};

const sendEmailNotificationForFileUpload = async (fileGroupInfo: Record<string, any>) => {
  // Send email when Appraiser uploads files
  if (fileGroupInfo.category === FileCategories.APPRAISER) {
    // Find workshop
    const damage = await getFBDocumentWithParam(COLLECTION_DAMAGE, "damageId", fileGroupInfo.damageId);
    // Find appraiser
    const appraiser = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damage?.appraiserId);
    const appraiserUser = await getDocumentInfo(COLLECTION_USERS, appraiser?.userId);
    if (damage && appraiser && appraiserUser) {
      const receiverList = [];
      const workshop = await getFBDocumentWithParam(COLLECTION_WORKSHOPS, "workshopId", damage.workshopId);
      const lawyer = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damage.attorneyId);
      if (workshop) {
        receiverList.push({ email: workshop.email, id: workshop.userId });
      }
      if (lawyer) {
        receiverList.push({ email: lawyer.email, id: lawyer.userId });
      }
      await sendAppraiserNotificationsAndEmail(receiverList, damage, appraiser, appraiserUser);
    }
  }
};

export const sendAppraiserNotificationsAndEmail = async (
  receiverList: Array<{ email: string; id: string }>,
  damage: FirebaseFirestore.DocumentData,
  appraiser?: FirebaseFirestore.DocumentData,
  appraiserUser?: FirebaseFirestore.DocumentData
) => {
  // Create internal notification
  try {
    if (receiverList.length) {
      await Promise.all(receiverList.map(async (receiver) => {
        const notificationData: Record<string, unknown> = {
          title: JSON.stringify({ title: APPRAISER_UPLOADED_FILE, name: appraiser?.name || "" }),
          type: NotificationTypes.FILE_UPLOAD,
          senderId: appraiser?.userId || "",
          senderPhotoURL: appraiserUser?.photoURL || null,
          receiverId: receiver.id,
          chatRoomId: null,
          linkUrl: `/damages/${damage.damageId}/detail`,
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
    logger.error("===Internal Notification Error===", error);
  }
  // Send email
  try {
    if (receiverList.length) {
      const receiverEmails = receiverList.map((item) => item.email);
      logger.debug("===Receiver Emails===", receiverEmails);
      await sendMailgunEmail(
        receiverEmails,
        "Wichtiger Download bereit - bitte loggen Sie sich beim SchadenNetzwerk ein",
        DAMAGE_FILE_UPLOAD_NOTIFICATION,
        { detail_url: `https://app.schadennetzwerk.com/damages/${damage.damageId}/detail` },
      );
    }
  } catch (error) {
    logger.error("===Email Sending Error===", error);
  }
};

const createChatGroupFromDamage = async (damageInfo: Record<string, any>) => {
  const groupCreator = damageInfo.userId;
  const members = [groupCreator];
  if (damageInfo.workshopId) {
    // Check if workshopId is exists in members
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
    if (workshop && workshop.userId && !members.includes(workshop.userId)) {
      members.push(workshop.userId);
    }
  }
  if (damageInfo.appraiserId) {
    // Check if appraiserId is exists in members
    const appraiserInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.appraiserId);
    if (appraiserInfo && appraiserInfo.userId && !members.includes(appraiserInfo.userId)) {
      members.push(appraiserInfo.userId);
    }
  }
  if (damageInfo.attorneyId) {
    // Check if attorneyId is exists in members
    const attorneyInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.attorneyId);
    if (attorneyInfo && attorneyInfo.userId && !members.includes(attorneyInfo.userId)) {
      members.push(attorneyInfo.userId);
    }
  }
  if (damageInfo.carRentalId) {
    // Check if carRentalId is exists in members
    const carRentalInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.carRentalId);
    if (carRentalInfo && carRentalInfo.userId && !members.includes(carRentalInfo.userId)) {
      members.push(carRentalInfo.userId);
    }
  }
  if (damageInfo.paintShopId) {
    // Check if paintShopId is exists in members
    const paintShopInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.paintShopId);
    if (paintShopInfo && paintShopInfo.userId && !members.includes(paintShopInfo.userId)) {
      members.push(paintShopInfo.userId);
    }
  }
  if (damageInfo.towingServiceId) {
    // Check if towingServiceId is exists in members
    const towingServiceInfo = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.towingServiceId);
    if (towingServiceInfo && towingServiceInfo.userId && !members.includes(towingServiceInfo.userId)) {
      members.push(towingServiceInfo.userId);
    }
  }
  const docRef = chatGroupCollection.doc();
  const dbData = {
    chatGroupId: docRef.id,
    damageId: damageInfo.damageId,
    groupCreator,
    members,
    createdAt: FieldValue.serverTimestamp(),
  };
  try {
    await docRef.set(dbData);
  } catch (error) {
    logger.error("===Create Chat Group Error===", error);
  }
};

const sendDamageUpdateNotification = async (
  newInfo: Record<string, any>,
  notificationTitle: string,
  notificationType: string,
  emailTitle: string
) => {
  const notificationData: Record<string, unknown> = {
    title: JSON.stringify({ title: notificationTitle, name: "" }),
    type: notificationType,
    senderId: "system",
    senderPhotoURL: null,
    receiverId: "",
    chatRoomId: null,
    linkUrl: `/damages/${newInfo.damageId}/detail`,
    isUnread: true,
    isArchived: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const workshopId = newInfo.workshopId;
  const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, workshopId);
  const emails: string[] = [];

  if (workshop) {
    notificationData.receiverId = workshop.userId;
    const docRef = notificationCollection.doc();
    notificationData.notificationId = docRef.id;
    await docRef.set(notificationData);
    if (workshop.email && workshop.email.length) {
      emails.push(workshop.email);
    }
  }

  // Find Lawyer and send same notification
  if (newInfo.attorneyId) {
    const lawyer = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, newInfo.attorneyId);
    if (lawyer) {
      notificationData.receiverId = lawyer.userId;
      const docRef = notificationCollection.doc();
      notificationData.notificationId = docRef.id;
      await docRef.set(notificationData);
      if (lawyer.email && lawyer.email.length) {
        emails.push(lawyer.email);
      }
    }
  }

  // Send email notification to workshop owner and lawyer
  if (emails.length) {
    await sendMailgunEmail(
      emails,
      "Wichtige Nachricht für Sie im SchadenNetzwerk- bitte prüfen!",
      emailTitle,
      {
        identifier: newInfo.customerVehicleLicensePlate || newInfo.customerVehicleVINNumber,
      },
    );
  }
};

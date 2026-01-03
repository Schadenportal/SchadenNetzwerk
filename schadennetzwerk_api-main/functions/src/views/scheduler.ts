import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { db, getDocumentInfo } from "./config";
import { COLLECTION_DAMAGE_FILES, COLLECTION_SERVICE_PROVIDERS, COLLECTION_SERVICE_TASK, REMINDER_18_HOURS, REMINDER_24_HOURS } from "../constants";
import { FileAppraiserCategories, FileCategories, ServiceTaskStatusTypes, ServiceTaskTypes } from "../types/enums";
import { Timestamp } from "firebase-admin/firestore";
import { sendMailgunEmail } from "../services/emailSender";

// Run every hour, location is europe-west3
export const sendNotificationToAppraiser = onSchedule({ region: "europe-west3", timeZone: "Europe/Berlin", schedule: "0 * * * *" } /* every hour */, async () => {
  logger.info("========= Scheduler Started At =========", new Date());
  // Get all service tasks which is the status is "accepted"
  try {
    await send18HoursNotification();
    await send24HoursNotification();
  } catch (error) {
    logger.error("=== Scheduler Error ===", error);
  }
});

const send18HoursNotification = async () => {
  const query = db.collection(COLLECTION_SERVICE_TASK)
    .where("status", "==", ServiceTaskStatusTypes.SIGNED)
    .where("taskType", "==", ServiceTaskTypes.APPRAISER_TASK);
  const querySnapshot = await query.get();
  if (querySnapshot.empty) {
    logger.info("No matching documents.");
    return;
  }
  await Promise.all(querySnapshot.docs.map(async (doc) => {
    logger.info(doc.id, " => ", doc.data().serviceTaskId);
    if (doc.data().signedAt) {
      const signedAt = doc.data().signedAt as Timestamp;
      const signedAtDate = signedAt.toDate();
      // Plus 18 hours to updatedAtDate
      signedAtDate.setHours(signedAtDate.getHours() + 18);
      // Get the difference between updatedAtDate and now
      const diff = new Date().getTime() - signedAtDate.getTime();
      if (diff >= 0 && diff < 3600 * 1000) {
        logger.info("Send notification to appraiser");
        const appraiser = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, doc.data().serviceProviderId);
        // Send mailgun notification to appraiser
        if (appraiser) {
          await sendMailgunEmail(
            [appraiser.email],
            "Bestätigung Ihres Auftrags über SchadenNetzwerk erforderlich",
            REMINDER_18_HOURS,
            ""
          );
        }
      }
    }
  }));
};

const send24HoursNotification = async () => {
  const query = db.collection(COLLECTION_SERVICE_TASK)
    .where("status", "==", ServiceTaskStatusTypes.ACCEPTED)
    .where("taskType", "==", ServiceTaskTypes.APPRAISER_TASK);
  const querySnapshot = await query.get();
  if (querySnapshot.empty) {
    logger.info("No matching documents.");
    return;
  }
  await Promise.all(querySnapshot.docs.map(async (doc) => {
    logger.info(doc.id, " => ", doc.data().serviceTaskId);
    if (doc.data().acceptedAt) {
      const acceptedAt = doc.data().acceptedAt as Timestamp;
      const acceptedAtDate = acceptedAt.toDate();
      // Plus 18 hours to updatedAtDate
      acceptedAtDate.setHours(acceptedAtDate.getHours() + 24);
      // Get the difference between updatedAtDate and now
      const diff = new Date().getTime() - acceptedAtDate.getTime();
      if (diff >= 0 && diff < 3600 * 1000) {
        // Send notification to appraiser
        logger.info("Send notification to appraiser");
        const q = db.collection(COLLECTION_DAMAGE_FILES)
          .where("damageId", "==", doc.data().damageId)
          .where("category", "==", FileCategories.APPRAISER)
          .where("subCategory", "==", FileAppraiserCategories.EXPERT_OPINION);
        const querySnap = await q.get();
        if (querySnap.empty) {
          logger.info("=== No matching documents ===");
          // Send email notification to appraiser
          const appraiser = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, doc.data().serviceProviderId);
          if (appraiser) {
            await sendMailgunEmail(
              [appraiser.email],
              "Ausstehende Gutachtensübermittlung im SchadenNetzwerk",
              REMINDER_24_HOURS,
              ""
            );
          }
        }
      }
    }
  }));
};

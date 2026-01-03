import { logger } from "firebase-functions/v1";
import { Twilio } from "twilio";
import { WELCOME_CONTENT_SID } from "../constants";

const senderId = "Schaden";
const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
const messagingServiceSid = process.env.TWILIO_SERVICE_SID;
const twilioClient = new Twilio(sid, token);
const businessNumber = "+4915755569363";

export const sendSMS = async (contentSid: string, to: string, data: Record<string, unknown>) => {
  await twilioClient.messages.create({
    contentSid,
    from: senderId,
    to,
    messagingServiceSid,
    contentVariables: JSON.stringify(data),
  })
    .then((res) => {
      logger.info("===Twilio Messaging Result===", res);
    })
    .catch((err) => {
      logger.debug("===Twilio Messaging Error===", err);
    });
};

export const sendWhatsAppSMS = async (contentSid: string, to: string, data: Record<string, unknown>) => {
  await twilioClient.messages.create({
    contentSid,
    from: `whatsapp:${businessNumber}`,
    to: `whatsapp:${to}`,
    messagingServiceSid,
    contentVariables: JSON.stringify(data),
  })
    .then((res) => {
      logger.info("===Twilio Messaging Result===", res);
    })
    .catch((err) => {
      logger.debug("===Twilio Messaging Error===", err);
    });
};

export const sendWhatsAppWelcomeMessage = async (to: string) => {
  await sendWhatsAppSMS(WELCOME_CONTENT_SID, to, {});
};

import { logger } from "firebase-functions/v1";
import { createTransport } from "nodemailer";
import FormData = require("form-data");
import Mailgun from "mailgun.js";
import path from "path";
import os from "os";
import fs from "fs";
import { downloadFile } from "../utils/functionUtils";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: `${process.env.MAILGUN_KEY}`,
  url: "https://api.eu.mailgun.net",
});
const mailDomain = "mail.schadennetzwerk.com";
const from = "SchadenNetzwerk <schaden@schadennetzwerk.com>";

const transporter = createTransport({
  host: "mail.your-server.de",
  port: 587,
  auth: {
    user: "noreply@schadennetzwerk.com",
    pass: "Testtest!",
  },
});

export const sendEmailToUser = async (from: string, to: string, subject: string, context: string) => {
  const mailOptions = {
    from,
    to,
    subject,
    html: context,
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    logger.info("=====Sent Email Successfully===", result);
  } catch (error) {
    logger.error("=====Sending Email Error===", error);
  }
};
export type fileAttachType = {
  filename: string,
  url: string,
};

export const sendMailgunEmail = async (
  to: string[],
  subject: string,
  template: string,
  variables: Record<string, any> | "",
  replyTo = "",
  attachedFiles: fileAttachType[] | null = null
) => {
  const data: any = {
    from,
    to,
    subject,
    template,
    "h:X-Mailgun-Variables": JSON.stringify(variables),
    "h:Reply-To": replyTo,
  };
  if (attachedFiles) {
    // Promise async/await for file download
    const files: fs.ReadStream[] = [];
    await Promise.all(attachedFiles.map(async (file) => {
      const tempFilePath = path.join(os.tmpdir(), file.filename);
      await downloadFile(file.url, tempFilePath);
      files.push(fs.createReadStream(tempFilePath));
      // data.attachment.push(fs.createReadStream(tempFilePath));
    }));
    data.attachment = files;
  }
  await mg.messages.create(mailDomain, data)
    .then((msg) => {
      logger.info("=====Email Sending Result=====", msg);
    }) // logs response data
    .catch((err) => {
      logger.error("==Failed to send email==", err);
    });
};

export const sendScheduledEmail = async (
  to: string[],
  subject: string,
  template: string,
  variables: Record<string, any> | "",
  replyTo = "",
  scheduledTime: string) => {
  await mg.messages.create(mailDomain, {
    "from": from,
    to,
    subject,
    template,
    "h:X-Mailgun-Variables": JSON.stringify(variables),
    "h:Reply-To": replyTo,
    "o:deliverytime": scheduledTime,
  })
    .then((msg) => {
      logger.info("===== Scheduled Email Sending Result=====", msg);
    }) // logs response data
    .catch((err) => {
      logger.error("==Failed to send scheduled email==", err);
    });
};

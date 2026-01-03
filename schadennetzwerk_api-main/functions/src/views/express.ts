import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { getSignCallback, scanDoc, whatsAppCallback } from "../expressControllers/doc";

const app = express();

app.use(cors({ origin: true }));

app.post("/scan_doc", scanDoc);
app.post("/sign_doc", getSignCallback);
app.post("/whatsapp_callback", whatsAppCallback);

export const apis = onRequest(app);

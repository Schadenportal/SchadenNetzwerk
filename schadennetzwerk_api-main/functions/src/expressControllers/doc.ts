import { logger } from "firebase-functions/v1";
import { COLLECTION_CONTRACT_DOCS, COLLECTION_SERVICE_TASK, COLLECTION_SIGNING_DOCS, SomethingWentWrong } from "../constants";
import { Request, Response } from "express";
import axios from "axios";
import busboy = require("busboy");
import FormData = require("form-data");
import { contractDocCollection, damageCollection, db, serviceTaskCollection, signingDocCollection } from "../views/config";
import { FieldValue } from "firebase-admin/firestore";
import { DamageDocCategory, DamageStatusType, DocumentTypes, ServiceTaskStatusTypes } from "../types/enums";
import { fetchAndSaveDocFile, fetchAndSaveDocFileForContract } from "../services/scriveHandler";
// import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

const SCAN_BASE_API = "https://api.fahrzeugschein-scanner.de/";

export const scanDoc = async (req: Request, res: Response) => {
  try {
    const bb = busboy({ headers: req.headers });
    bb.on("file", (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );
      file.on("data", async (data: any) => {
        await scanCarDoc(data, info.filename)
          .then((response: any) => {
            res.status(200).send({ ...response });
          })
          .catch((err) => {
            logger.debug("===Catching Error===", err);
            res.status(400).send({ message: "Unprocessable entry" });
          });
      }).on("close", () => {
        console.log(`File [${name}] done`);
      });
    });
    // bb.on("field", (name, val, info) => {
    //   console.log(`Field [${name}]: value: %j`, val);
    // });
    // bb.on("close", () => {
    //   console.log("Done parsing form!");
    //   res.status(200).send({ message: "Done parsing form!" });
    // });

    return bb.end(req.body);
  } catch (err) {
    logger.error("===Error===", err);
    return res.status(400).send({ message: SomethingWentWrong });
  }
};

export const getSignCallback = async (req: Request, res: Response) => {
  try {
    const params = req.body;
    logger.debug("=== Callback params ===", params);
    if (params.document_signed_and_sealed !== "true") {
      logger.error("====It's not signed and sealed", params.document_signed_and_sealed);
      return res.status(500).send({ error: "Failed to processing " });
    }
    const fileName = JSON.parse(params.document_json).title;
    const documentId = params.document_id;
    logger.debug("=== File Name ===", fileName, documentId);
    // Update document status to 'signed'
    const signDocInfos = await getSignDocByScriveRef(documentId);
    if (signDocInfos && signDocInfos.size === 1) {
      const signDocInfo = signDocInfos.docs[0].data();
      // If the document is already signed, return success
      if (signDocInfo.status === DocumentTypes.SIGNED) {
        return res.status(200).send({ message: "Der Auftragsstatus wurde erfolgreich aktualisiert!" });
      }
      // Update document status to 'signed'
      signDocInfo.updatedAt = FieldValue.serverTimestamp();
      signDocInfo.status = DocumentTypes.SIGNED;
      await signingDocCollection.doc(signDocInfo.signingDocId).set(signDocInfo, { merge: true });
      // Check entity type(docCategory) and update the entity to 'signed'

      // Update Damage status to 'signed'
      if (signDocInfo.docCategory === DamageDocCategory.DAMAGE) {
        await damageCollection.doc(signDocInfo.damageId).set({ status: DamageStatusType.SIGNED }, { merge: true });
      }
      // Update Service Task status to 'signed'
      if (signDocInfo.docCategory === DamageDocCategory.SERVICE_TASK) {
        const serviceTask = await getServiceTaskByDamageId(signDocInfo.damageId, signDocInfo.serviceType);
        if (serviceTask) {
          await serviceTaskCollection
            .doc(serviceTask.serviceTaskId)
            .set({
              status: ServiceTaskStatusTypes.SIGNED,
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
        }
      }
      // Fetch and Save file to storage
      await fetchAndSaveDocFile(fileName, documentId, signDocInfo.signingDocId, signDocInfo.damageId);
      return res.status(200).send({ message: "Der Auftragsstatus wurde erfolgreich aktualisiert!" });
    }

    // Contract Doc Callback Processing
    const contractDocs = await getContractDocByScriveRef(documentId);
    if (contractDocs && contractDocs.size === 1) {
      const contractDoc = contractDocs.docs[0].data();
      // If the document is already signed, return success
      if (contractDoc.status === DocumentTypes.SIGNED) {
        return res.status(200).send({ message: "Der Auftragsstatus wurde erfolgreich aktualisiert!" });
      }
      contractDoc.updatedAt = FieldValue.serverTimestamp();
      contractDoc.status = DocumentTypes.SIGNED;
      await contractDocCollection.doc(contractDoc.contractDocId).set(contractDoc, { merge: true });
      // Fetch and Save file to storage
      await fetchAndSaveDocFileForContract(fileName, documentId, contractDoc.contractDocId);
      return res.status(200).send({ message: "Der Auftragsstatus wurde erfolgreich aktualisiert!" });
    }

    return res.status(500).send({ message: "Something went wrong!" });
  } catch (error) {
    logger.error("=== Failed to process Scrive Callback ===", error);
    return res.status(500).send({ error: "Es ist ein Fehler aufgetreten" });
  }
};

export const getServiceTaskByDamageId = async (damageId: string, taskType: string) => {
  const query = db.collection(COLLECTION_SERVICE_TASK)
    .where("damageId", "==", damageId)
    .where("taskType", "==", taskType);
  const querySnap = await query.get();
  if (querySnap.empty) {
    return null;
  }
  if (querySnap.size === 1) {
    return querySnap.docs[0].data();
  }
  return null;
};

const getSignDocByScriveRef = async (refId: string) => {
  const query = db.collection(COLLECTION_SIGNING_DOCS)
    .where("scriveDocRef", "==", refId);
  const querySnap = await query.get();
  if (querySnap.empty) {
    return null;
  }
  return querySnap;
};

const getContractDocByScriveRef = async (refId: string) => {
  const query = db.collection(COLLECTION_CONTRACT_DOCS)
    .where("scriveDocRef", "==", refId);
  const querySnap = await query.get();
  if (querySnap.empty) {
    return null;
  }
  return querySnap;
};

const scanCarDoc = async (file: any, filename: string) => {
  logger.info("===== form data type =====", typeof file);
  const formData = new FormData();
  formData.append("file", file, { filename });
  formData.append("access_key", `${process.env.FAHRZEUGSCHEIN_SCANNER_ACCESS_KEY}`);
  formData.append("show_cuts", "true");
  return await axios.post(SCAN_BASE_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((res: any) => {
      logger.error("=====Response====", res.data);
      return res.data;
    })
    .catch((error) => {
      logger.error("===Request Error===", error);
      throw error;
    });
};

export const whatsAppCallback = async (req: Request, res: Response) => {
  try {
    const incomingMessage = req.body.Body;
    logger.info("===WhatsApp Callback===", incomingMessage);
    // const twiml = new MessagingResponse();
    // twiml.message("Thank you for your message!");
    // res.writeHead(200, { "Content-Type": "text/xml" });
    // res.end(twiml.toString());
    res.status(200).send("Thank you for your message!");
  } catch (error) {
    logger.error("===Error===", error);
    res.status(400).send("Something went wrong!");
  }
};

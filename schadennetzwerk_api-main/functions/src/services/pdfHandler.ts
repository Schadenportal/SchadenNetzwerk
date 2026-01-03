import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { bucket, damageCollection, getDocumentInfo } from "../views/config";
import { logger } from "firebase-functions/v1";
import { getDownloadURL } from "firebase-admin/storage";
import { COLLECTION_SERVICE_PROVIDERS, COLLECTION_USERS, COLLECTION_WORKSHOPS } from "../constants";
import dayjs from "dayjs";
import { InsuranceType, UserRole } from "../types/enums";
// import { euro } from "../utils/functionUtils";
import { uploadBufferFile } from "./firebasStorage";
import { ICreateRepairPlanModel } from "../models/damage";

// eslint-disable-next-line max-len
const RSP_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Freparaturablaufplan.pdf?alt=media&token=7aa9f74d-804f-48d7-97c8-0bc2f3898de5&_gl=1*mt3b18*_ga*MTc1MzM5MDg3My4xNjk1NzEwNDY3*_ga_CW55HF8NVT*MTY5OTM0Mjc3MS4xOTEuMS4xNjk5MzQzNjc0LjYwLjAuMA..";
// eslint-disable-next-line max-len
const RKU_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Fnew_rku.pdf?alt=media&token=a5eec37e-56ad-4953-910a-083f028551c4";
// eslint-disable-next-line max-len
const ATTORNEY_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FVollmacht_Anwalt_09062025.pdf?alt=media&token=7cb89132-2246-4661-9bd4-99ebd45ccbca";
// eslint-disable-next-line max-len
const APPRAISER_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Fappraiser_06102025.pdf?alt=media&token=410743ce-7495-4e0e-b669-edc1838bc796";
// eslint-disable-next-line max-len
const CAR_RENTAL_ASSIGN_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Funfallersatz_abtretung.pdf?alt=media&token=a1d0fdbf-8289-45f0-9a1a-f5ac52e6d282";
// eslint-disable-next-line max-len
const CAR_RENTAL_CONTRACT_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Funfallersatz_mietvertrag.pdf?alt=media&token=447bafd7-bb61-442f-8f34-dfed6d4082b8";
// eslint-disable-next-line max-len
export const CONTRACT_FILE_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FAnlage_Datenschutz.pdf?alt=media&token=864a4508-09e0-466b-b079-32befda51af7";
// eslint-disable-next-line max-len
const COMMISSION_CONTRACT_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FPreisvereinbarung.pdf?alt=media&token=0bfd425c-d0e9-4b5b-9374-012117749b3f";
// eslint-disable-next-line max-len
export const PRICE_LIST_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FHonorar_Gutachter_neutral.pdf?alt=media&token=3c5b6e42-fd1b-424b-9811-b4b872b08fed";
// eslint-disable-next-line max-len
export const CANCEL_DOC_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FWiderrufsformular.pdf?alt=media&token=36580ea8-1605-481e-b12b-5f2ad2e96ace";
// eslint-disable-next-line max-len
const PAINT_SHOP_PDF_URL = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FLacker_PDF.pdf?alt=media&token=4d0f57e6-2e90-4f68-9a9f-b626545c0852";
const fontUrl = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/assets%2FRoboto-Regular.ttf?alt=media&token=46d83b92-f7ff-4af5-954c-2fcdb8ccb64d";

export const generateRepairSchedulePdf = async (damageInfo: Record<string, any>, planValues?: ICreateRepairPlanModel) => {
  try {
    const existingPdfBytes = await fetch(RSP_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);
    logger.info("=====Downloaded and covert PDF=====");

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const damageDate = damageInfo.damageDate ? dayjs(damageInfo.damageDate).format("DD.MM.YYYY") : "";

    firstPage.drawText(damageInfo.orderNumber, { x: 180, y: 700, size: 10, font: customFont });
    firstPage.drawText(`${damageInfo.customerVehicleLicensePlate} ${damageInfo?.customerVehicleBrand || ""} ${damageInfo?.customerVehicleModel || ""}`, { x: 180, y: 682, size: 10, font: customFont });
    firstPage.drawText(`${damageInfo.customerFirstName} ${damageInfo.customerLastName}`, { x: 180, y: 664, size: 10, font: customFont });
    firstPage.drawText(damageDate, { x: 440, y: 620, size: 10, font: customFont });

    if (planValues) {
      // Section 2
      firstPage.drawText(planValues.expertReport ? dayjs(planValues.expertReport).format("DD.MM.YYYY") : "", { x: 430, y: 593, size: 10, font: customFont });
      firstPage.drawText(planValues.expertInspection ? dayjs(planValues.expertInspection).format("DD.MM.YYYY") : "", { x: 430, y: 575, size: 10, font: customFont });
      firstPage.drawText(planValues.expertReportReceiptDate ? dayjs(planValues.expertReportReceiptDate).format("DD.MM.YYYY") : "", { x: 430, y: 557, size: 10, font: customFont });

      // Section 3
      firstPage.drawText(planValues.decisionFrom ? dayjs(planValues.decisionFrom).format("DD.MM.YYYY") : "", { x: 330, y: 530, size: 10, font: customFont });
      firstPage.drawText(planValues.decisionTo ? dayjs(planValues.decisionTo).format("DD.MM.YYYY") : "", { x: 460, y: 530, size: 10, font: customFont });

      // Section 4
      firstPage.drawText(planValues.entryToWorkshop ? dayjs(planValues.entryToWorkshop).format("DD.MM.YYYY") : "", { x: 460, y: 505, size: 10, font: customFont });
      firstPage.drawText(planValues.repairOrder ? dayjs(planValues.repairOrder).format("DD.MM.YYYY") : "", { x: 460, y: 487, size: 10, font: customFont });
      firstPage.drawText(planValues.orderOfParts ? dayjs(planValues.orderOfParts).format("DD.MM.YYYY") : "", { x: 460, y: 469, size: 10, font: customFont });
      firstPage.drawText(planValues.arrivalOfParts ? dayjs(planValues.arrivalOfParts).format("DD.MM.YYYY") : "", { x: 460, y: 451, size: 10, font: customFont });
      firstPage.drawText(planValues.repairStartDate ? dayjs(planValues.repairStartDate).format("DD.MM.YYYY") : "", { x: 460, y: 433, size: 10, font: customFont });

      firstPage.drawText(planValues.repairInterruptionFrom ? dayjs(planValues.repairInterruptionFrom).format("DD.MM.YYYY") : "", { x: 330, y: 415, size: 10, font: customFont });
      firstPage.drawText(planValues.repairInterruptionTo ? dayjs(planValues.repairInterruptionTo).format("DD.MM.YYYY") : "", { x: 460, y: 415, size: 10, font: customFont });

      firstPage.drawText(planValues.repairResume ? dayjs(planValues.repairResume).format("DD.MM.YYYY") : "", { x: 460, y: 397, size: 10, font: customFont });
      firstPage.drawText(planValues.entryToPaintShop ? dayjs(planValues.entryToPaintShop).format("DD.MM.YYYY") : "", { x: 460, y: 379, size: 10, font: customFont });
      firstPage.drawText(planValues.paintStartDate ? dayjs(planValues.paintStartDate).format("DD.MM.YYYY") : "", { x: 460, y: 361, size: 10, font: customFont });
      firstPage.drawText(planValues.paintEndDate ? dayjs(planValues.paintEndDate).format("DD.MM.YYYY") : "", { x: 460, y: 343, size: 10, font: customFont });
      firstPage.drawText(planValues.repairCompletion ? dayjs(planValues.repairCompletion).format("DD.MM.YYYY") : "", { x: 460, y: 327, size: 10, font: customFont });
      firstPage.drawText(planValues.pickupReadyDate ? dayjs(planValues.pickupReadyDate).format("DD.MM.YYYY") : "", { x: 460, y: 312, size: 10, font: customFont });
      firstPage.drawText(planValues.pickupDate ? dayjs(planValues.pickupDate).format("DD.MM.YYYY") : "", { x: 460, y: 296, size: 10, font: customFont });

      // Section 5
      firstPage.drawText(planValues.totalRepairPeriodFrom ? dayjs(planValues.totalRepairPeriodFrom).format("DD.MM.YYYY") : "", { x: 307, y: 280, size: 10, font: customFont });
      firstPage.drawText(planValues.totalRepairPeriodTo ? dayjs(planValues.totalRepairPeriodTo).format("DD.MM.YYYY") : "", { x: 460, y: 280, size: 10, font: customFont });

      // Section Description
      firstPage.drawText(planValues.reasonDesc || "", { x: 75, y: 210, maxWidth: 500, lineHeight: 15, size: 10, font: customFont });
      firstPage.drawText(planValues.pointDesc || "", { x: 75, y: 145, maxWidth: 500, lineHeight: 15, size: 10, font: customFont });
    }

    const pdfBytes = await pdfDoc.save();

    const filePath = !planValues ?
      `repair_schedule_doc/repair_${damageInfo.orderNumber}.pdf` :
      `repair_schedule_doc/manual_repair_${damageInfo.orderNumber}_${dayjs(new Date()).format("YYYYMMDDHHmmss")}.pdf`;
    logger.info("=====Saved Bytes PDF=====", filePath);
    const buffer = Buffer.from(pdfBytes);
    const fileRef = bucket.file(filePath);
    await fileRef.save(buffer);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    logger.error("=====Failed to processing RSPDF====", error);
    return null;
  }
};

export const generateRcaPdf = async (damageInfo: Record<string, any>, fileName: string) => {
  try {
    const existingPdfBytes = await fetch(RKU_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // Register fontkit to pdf-lib
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    logger.info("=====Downloaded and covert PDF=====");

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get workshop Info
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);

    if (!workshop) {
      return null;
    }

    const damageDate = damageInfo.damageDate ? dayjs(damageInfo.damageDate.toDate()).format("DD.MM.YYYY") : "";

    // Insurance
    firstPage.drawText(damageInfo?.insuranceName || "", { x: 58, y: 812, size: 8, font: customFont });

    // Workshop
    firstPage.drawText(workshop.name, { x: 58, y: 730, size: 8, font: customFont });
    firstPage.drawText(workshop.street, { x: 58, y: 720, size: 8, font: customFont });
    firstPage.drawText(workshop.postalCode, { x: 58, y: 710, size: 8, font: customFont });
    firstPage.drawText(workshop.email, { x: 58, y: 675, size: 8, font: customFont });
    // Customer
    firstPage.drawText(`${damageInfo.customerFirstName} ${damageInfo.customerLastName}`, { x: 58, y: 610, size: 8, font: customFont });
    firstPage.drawText(damageInfo.customerStreet, { x: 58, y: 600, size: 8, font: customFont });
    firstPage.drawText(damageInfo.customerPostalCode, { x: 58, y: 590, size: 8, font: customFont });
    firstPage.drawText(damageInfo.customerCountry, { x: 58, y: 580, size: 8, font: customFont });
    // Damage date
    firstPage.drawText(damageDate, { x: 417, y: 645, size: 8, font: customFont });
    // If damage.insurance type == Liablity
    if (damageInfo.insuranceType === InsuranceType.LIABILITY) {
      const tortfeasorFullName = `${damageInfo.tortfeasorFirstName} ${damageInfo.tortfeasorLastName}`;
      firstPage.drawText(tortfeasorFullName, { x: 323, y: 610, size: 8, font: customFont });
      firstPage.drawText(damageInfo.tortfeasorStreet, { x: 323, y: 600, size: 8, font: customFont });
      firstPage.drawText(damageInfo.tortfeasorPostalCode, { x: 323, y: 590, size: 8, font: customFont });
      firstPage.drawText(damageInfo.tortfeasorCountry, { x: 323, y: 580, size: 8, font: customFont });
      // License and Insurance
      firstPage.drawText(damageInfo.tortfeasorVehicleLicensePlate, { x: 320, y: 520, size: 10, font: customFont });
      firstPage.drawText(damageInfo.insuranceNumber, { x: 450, y: 520, size: 10, font: customFont });
    }
    // Customer car
    // const firstRegistration = damageInfo?.customerVehicleFirstRegistration !== null && damageInfo.customerVehicleFirstRegistration !== "" ?
    //   dayjs(damageInfo.customerVehicleFirstRegistration).format("DD.MM.YYYY") : "";
    // const excess = damageInfo.customerVehicleExcess !== "" ? euro.format(parseInt(damageInfo.customerVehicleExcess)) : "";

    // firstPage.drawText(excess, { x: 90, y: 585, size: 8 });
    firstPage.drawText(damageInfo.customerVehicleBrand, { x: 56, y: 468, size: 10, font: customFont });
    firstPage.drawText(damageInfo.customerVehicleLicensePlate, { x: 185, y: 468, size: 10, font: customFont });
    // firstPage.drawText(firstRegistration, { x: 40, y: 520, size: 10 });
    // firstPage.drawText("X", { x: 38, y: 492, size: 9 });
    // firstPage.drawText("X", { x: 38, y: 467.5, size: 9 });

    firstPage.drawText(dayjs(new Date()).format("DD.MM.YYYY"), { x: 223, y: 195, size: 10, font: customFont });
    //
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    const filePath = `assignment_docs/${fileName}`;
    const downloadUrl = await uploadBufferFile(filePath, buffer);
    await damageCollection.doc(damageInfo.damageId).set({ assignmentDoc: downloadUrl }, { merge: true });
    return buffer;
  } catch (error) {
    logger.error("=====RCA Generating error=====", error);
    return null;
  }
};

export const generateAttorneyPdf = async (damageInfo: Record<string, any>) => {
  try {
    const existingPdfBytes = await fetch(ATTORNEY_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page4 = pages[3];
    // Get service provider and workshop
    const service = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.attorneyId);
    if (!service) {
      throw new Error("Can't find service provider");
    }
    // const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
    // if (!workshop) {
    //   throw new Error("Can't find workshop");
    // }
    const customerName = `${damageInfo.customerFirstName} ${damageInfo.customerLastName}`;
    const customerFullAddress = `${damageInfo.customerStreet}, ${damageInfo.customerCity}`;
    // const customerFullInfo = `${customerName}, ${customerFullAddress}, ${damageInfo.customerEmail}, ${damageInfo.customerVehicleLicensePlate}`;
    const providerPhones = `${service.phone}, ${service.telephone || ""}`;

    // const tortfeasorName = `${damageInfo.tortfeasorFirstName} ${damageInfo.tortfeasorLastName}`;
    // let tortfeasorFullAddress = "";
    // if (damageInfo.tortfeasorStreet) {
    //   tortfeasorFullAddress += damageInfo.tortfeasorStreet;
    // }
    // if (damageInfo.tortfeasorPostalCode) {
    //   tortfeasorFullAddress += `, ${damageInfo.tortfeasorPostalCode}`;
    // }
    // if (damageInfo.tortfeasorCity) {
    //   tortfeasorFullAddress += `, ${damageInfo.tortfeasorCity}`;
    // }
    // const tortfeasorFullInfo = `${tortfeasorName}, ${tortfeasorFullAddress}, ${damageInfo.tortfeasorVehicleLicensePlate}`;

    // Customer Info
    page1.drawText(customerName, { x: 70, y: 695, size: 10, font: customFont });
    page1.drawText("", { x: 70, y: 647, size: 10, font: customFont }); // Customer Birthday
    page1.drawText(customerFullAddress, { x: 70, y: 605, size: 10, font: customFont });
    page1.drawText(damageInfo.customerEmail, { x: 70, y: 558, size: 10, font: customFont });
    page1.drawText(damageInfo.customerPhone || damageInfo.customerTelephone, { x: 70, y: 512, size: 10, font: customFont });

    // Lawyer Info
    page1.drawText(service.name, { x: 70, y: 400, size: 10, font: customFont });
    page1.drawText("", { x: 70, y: 355, size: 10, font: customFont }); // Lawyer Firm Name
    page1.drawText(service.street, { x: 70, y: 310, size: 10, font: customFont });
    page1.drawText(`${service.postalCode} ${service.city}`, { x: 70, y: 265, size: 10, font: customFont });
    page1.drawText(service.email, { x: 70, y: 220, size: 10, font: customFont });
    page1.drawText(providerPhones, { x: 70, y: 177, size: 10, font: customFont });
    page1.drawText("", { x: 70, y: 131, size: 10, font: customFont }); // Lawyer Fax

    // Date time
    page4.drawText(`${service?.city || ""}, ${dayjs(new Date()).format("DD.MM.YYYY")}`, { x: 130, y: 288, size: 10, font: customFont });
    const pdfBytes = await pdfDoc.save();
    //
    const filePath = `attorney_docs/doc_${damageInfo.orderNumber}.pdf`;
    logger.info("=====Saved Bytes PDF=====", filePath);
    const buffer = Buffer.from(pdfBytes);
    const fileRef = bucket.file(filePath);
    await fileRef.save(buffer);
    //
    logger.info("===== Created PDF file =====");
    return buffer;
  } catch (error) {
    logger.error("=====Failed to processing attorney pdf ====", error);
    return null;
  }
};

export const generateAppraiserPdf = async (damageInfo: Record<string, any>, appraiseInfo: Record<string, any>) => {
  try {
    const existingPdfBytes = await fetch(APPRAISER_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // Register font
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page2 = pages[1];
    // Get service provider and workshop
    const service = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.appraiserId);
    if (!service) {
      throw new Error("Can't find service provider");
    }
    logger.info("=====Downloaded and covert PDF=====", appraiseInfo);
    // Write service provider info at the top
    page1.drawText(`Name: ${service.name}`, {
      x: 100,
      y: 800,
      maxWidth: 400,
      size: 9,
      font: customFont,
    });
    page1.drawText(`Email: ${service.email}`, {
      x: 100,
      y: 790,
      maxWidth: 400,
      size: 9,
      font: customFont,
    });
    page1.drawText(`Mobile: ${service.phone}`, {
      x: 100,
      y: 780,
      maxWidth: 400,
      size: 9,
      font: customFont,
    });
    page1.drawText(`Address: ${service.postalCode}, ${service.street}, ${service.city}`, {
      x: 100,
      y: 770,
      maxWidth: 400,
      size: 9,
      font: customFont,
    });
    // Customer info
    page1.drawText(`${damageInfo.customerFirstName} ${damageInfo.customerLastName}`, { x: 100, y: 670, size: 10, font: customFont });
    page1.drawText(`${damageInfo.customerStreet} ${damageInfo.customerPostalCode}`, { x: 100, y: 650, size: 10, font: customFont });
    page1.drawText(damageInfo.customerCity, { x: 100, y: 630, size: 10, font: customFont });
    page1.drawText(damageInfo.customerVehicleLicensePlate, { x: 135, y: 610, size: 10, font: customFont });
    page1.drawText(`${damageInfo.customerLandline ? damageInfo.customerLandline : damageInfo.customerPhone}`, { x: 80, y: 575, size: 10, font: customFont });
    page1.drawText(damageInfo.customerEmail, { x: 90, y: 555, size: 10, font: customFont });
    // Check marks
    if (damageInfo.customerTaxDeduction === 1) {
      page1.drawText("X", { x: 66, y: 477, size: 10, font: customFont });
    }
    if (damageInfo.customerTaxDeduction === 0) {
      page1.drawText("X", { x: 129, y: 477, size: 10, font: customFont });
    }
    // tortfeasor info
    page1.drawText(`${damageInfo.tortfeasorFirstName} ${damageInfo.tortfeasorLastName}`, { x: 350, y: 670, size: 10, font: customFont });
    page1.drawText(`${damageInfo.tortfeasorStreet} ${damageInfo.tortfeasorPostalCode}`, { x: 350, y: 650, size: 10, font: customFont });
    page1.drawText(damageInfo.tortfeasorCity, { x: 360, y: 630, size: 10, font: customFont });
    page1.drawText(damageInfo.tortfeasorVehicleLicensePlate, { x: 390, y: 610, size: 10, font: customFont });
    // Date and towns
    const damageDate = damageInfo.damageDate ? dayjs(damageInfo.damageDate.toDate()).format("DD.MM.YYYY") : "";
    const townAndCity = `${damageInfo.customerCity || ""}, ${damageDate}`;
    page1.drawText(townAndCity, { x: 113, y: 318, size: 10, font: customFont });
    page1.drawText(townAndCity, { x: 113, y: 258, size: 10, font: customFont });
    page1.drawText(townAndCity, { x: 113, y: 125, size: 10, font: customFont });
    page1.drawText("X", { x: 68, y: 170, size: 10, font: customFont });
    page1.drawText("X", { x: 68, y: 180, size: 10, font: customFont });
    page2.drawText(townAndCity, { x: 105, y: 93, size: 10, font: customFont });

    const pdfBytes = await pdfDoc.save();
    logger.info("===== Created PDF file =====");
    const buffer = Buffer.from(pdfBytes);
    return buffer;
  } catch (error) {
    logger.error("=====Failed to processing appraiser pdf ====", error);
    return null;
  }
};

export const generateCarRentalAssignmentPdf = async (damageInfo: Record<string, any>) => {
  try {
    const existingPdfBytes = await fetch(CAR_RENTAL_ASSIGN_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    // Get service provider and workshop
    const service = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.carRentalId);
    if (!service) {
      throw new Error("Can't find service provider");
    }
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
    // if (!workshop) {
    //   throw new Error("Can't find workshop");
    // }
    const damageDate = damageInfo.damageDate ? dayjs(damageInfo.damageDate.toDate()).format("DD.MM.YYYY") : "";
    // Page 1
    const serviceName = service.name;
    const serviceAddress = service.street;
    const servicePostcode = `${service.postalCode} ${service.city}`;
    const serviceNameWidth = helveticaFont.widthOfTextAtSize(serviceName, 10);
    const serviceAddressWidth = helveticaFont.widthOfTextAtSize(serviceAddress, 10);
    const servicePostcodeWidth = helveticaFont.widthOfTextAtSize(servicePostcode, 10);
    // Service Info
    page1.drawText(serviceName, { x: page1.getWidth() / 2 - serviceNameWidth / 2, y: 230, size: 10, font: customFont });
    page1.drawText(serviceAddress, { x: page1.getWidth() / 2 - serviceAddressWidth / 2, y: 220, size: 10, font: customFont });
    page1.drawText(servicePostcode, { x: page1.getWidth() / 2 - servicePostcodeWidth / 2, y: 210, size: 10, font: customFont });

    if (damageInfo.insuranceType === InsuranceType.FULLY_COMPREHENSIVE) {
      page1.drawText("X", { x: 127, y: 760, size: 9, font: customFont });
    } else {
      page1.drawText("X", { x: 73, y: 760, size: 9, font: customFont });
    }
    // damage info
    page1.drawText(damageDate, { x: 186, y: 758, size: 10, font: customFont });
    page1.drawText(damageInfo.damageCity, { x: 300, y: 758, size: 10, font: customFont });
    page1.drawText(damageInfo.damageNumber, { x: 424, y: 758, size: 10, font: customFont });
    // customer info
    page1.drawText(damageInfo.customerFirstName, { x: 72, y: 710, size: 10, font: customFont });
    page1.drawText(damageInfo.customerLastName, { x: 72, y: 680, size: 10, font: customFont });
    page1.drawText(damageInfo.customerStreet, { x: 72, y: 650, size: 10, font: customFont });
    page1.drawText(`${damageInfo.customerPostalCode} ${damageInfo.customerCity}`, { x: 72, y: 620, size: 10, font: customFont });
    // customer vehicle info
    page1.drawText(damageInfo.customerVehicleLicensePlate, { x: 72, y: 575, size: 10, font: customFont });
    page1.drawText(damageInfo.customerVehicleBrand, { x: 185, y: 585, size: 10, font: customFont });
    page1.drawText(damageInfo.customerVehicleModel, { x: 185, y: 575, size: 10, font: customFont });
    if (damageInfo.customerVehicleFirstRegistration) {
      page1.drawText(dayjs(damageInfo.customerVehicleFirstRegistration.toDate()).format("DD.MM.YYYY"), { x: 72, y: 545, size: 10, font: customFont });
    }
    if (damageInfo.insuranceType === InsuranceType.FULLY_COMPREHENSIVE) {
      page1.drawText("X", { x: 76, y: 524, size: 10, font: customFont });
    }
    page1.drawText(damageInfo.customerVehicleExcess ? damageInfo.customerVehicleExcess : "", { x: 185, y: 515, size: 10, font: customFont });
    // tortfeasor and vehicle info
    page1.drawText(`${damageInfo.tortfeasorFirstName} ${damageInfo.tortfeasorLastName}`, { x: 72, y: 440, size: 10, font: customFont });
    page1.drawText(`${damageInfo.tortfeasorStreet} ${damageInfo.tortfeasorPostalCode} ${damageInfo.tortfeasorCity}`, { x: 72, y: 410, size: 10, font: customFont });
    page1.drawText(damageInfo.tortfeasorVehicleLicensePlate, { x: 72, y: 380, size: 10, font: customFont });
    page1.drawText(damageInfo.tortfeasorVehicleBrand, { x: 185, y: 380, size: 10, font: customFont });
    // Date and time
    page1.drawText(`${workshop?.city || ""}, ${dayjs(new Date()).format("DD.MM.YYYY")}`, { x: 72, y: 33, size: 10, font: customFont });

    const pdfBytes = await pdfDoc.save();
    logger.info("===== Created PDF file =====");
    const buffer = Buffer.from(pdfBytes);
    return buffer;
  } catch (error) {
    logger.error("=====Failed to processing attorney pdf ====", error);
    return null;
  }
};

export const generateCarRentalContractPdf = async (damageInfo: Record<string, any>) => {
  try {
    const existingPdfBytes = await fetch(CAR_RENTAL_CONTRACT_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    // Get service provider and workshop
    const service = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.carRentalId);
    if (!service) {
      throw new Error("Can't find service provider");
    }
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
    // if (!workshop) {
    //   throw new Error("Can't find workshop");
    // }

    // page1.drawText("Contract number", { x: 101, y: 766.5, size: 10 });
    page1.drawText(damageInfo.customerVehicleLicensePlate, { x: 231, y: 766.5, size: 10, font: customFont });

    page1.drawText(damageInfo.customerLastName, { x: 125, y: 716, size: 8, font: customFont });
    page1.drawText(damageInfo.customerFirstName, { x: 125, y: 707, size: 8, font: customFont });
    page1.drawText(damageInfo.customerStreet, { x: 125, y: 698, size: 8, font: customFont });
    page1.drawText(`${damageInfo.customerPostalCode} ${damageInfo.customerCity}`, { x: 125, y: 689, size: 8, font: customFont });
    page1.drawText(damageInfo.customerDriverLicenseNumber, { x: 125, y: 662, size: 8, font: customFont });
    page1.drawText(damageInfo.customerLandline || damageInfo.customerPhone, { x: 125, y: 642, size: 8, font: customFont });
    page1.drawText(workshop?.city || "", { x: 175, y: 128, size: 10, font: customFont });
    page1.drawText(dayjs(new Date()).format("DD.MM.YYYY"), { x: 40, y: 128, size: 10, font: customFont });

    const pdfBytes = await pdfDoc.save();
    logger.info("===== Created PDF file =====");
    const buffer = Buffer.from(pdfBytes);
    return buffer;
  } catch (error) {
    logger.error("=====Failed to processing attorney pdf ====", error);
    return null;
  }
};

export const generateCommissionContractPdf = async (info: Record<string, any>) => {
  try {
    const existingPdfBytes = await fetch(COMMISSION_CONTRACT_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page4 = pages[3];
    const page5 = pages[4];
    const name = info.firstName && info.lastName ? `${info.firstName} ${info.lastName}` : info.name;

    // Create the user's address
    const dealerNameAndAddress = `${name}, ${info.street}, ${info.postalCode} ${info.city}`;
    const commission = info.commission ? String(info.commission) : "";
    const setupFee = info.setupFee ? String(info.setupFee) : "";
    const adminTownAndTime = `${dayjs(new Date()).format("DD.MM.YYYY")}, Wermelskirchen`;
    const dealerTownAndTime = `${dayjs(new Date()).format("DD.MM.YYYY")}, ${info.city}`;

    // Draw Provider/Workshop Info
    page1.drawText(dealerNameAndAddress, {
      x: 70,
      y: 552,
      size: 10,
      maxWidth: 420,
      lineHeight: 10,
      font: customFont,
    });
    // Draw Commission Info
    page4.drawText(commission, { x: 72, y: 590, size: 10, lineHeight: 12, font: customFont });
    page4.drawText(setupFee, { x: 72, y: 548, size: 10, lineHeight: 12, font: customFont });
    // Draw Date and Town
    page5.drawText(adminTownAndTime, { x: 70, y: 665, size: 10, lineHeight: 12, font: customFont });
    page5.drawText(dealerTownAndTime, { x: 118, y: 565, size: 10, lineHeight: 12, font: customFont });

    const pdfBytes = await pdfDoc.save();
    logger.info("===== Created PDF file =====");
    const buffer = Buffer.from(pdfBytes);
    return buffer;
  } catch (error) {
    logger.error("=====Failed to processing attorney pdf ====", error);
    return null;
  }
};

export const generatePaintShopPdf = async (damageInfo: Record<string, any>) => {
  try {
    const existingPdfBytes = await fetch(PAINT_SHOP_PDF_URL).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const page1 = pages[0];

    // Get user from damage userId
    const userInfo = await getDocumentInfo(COLLECTION_USERS, damageInfo.userId);
    if (!userInfo) {
      throw new Error("Can't find user");
    }
    if (userInfo.role !== UserRole.ServiceAdviser || !userInfo.workshopIds || !userInfo.workshopIds.includes(damageInfo.workshopId)) {
      throw new Error("User is not service adviser");
    }
    // Get workshop Info
    const workshop = await getDocumentInfo(COLLECTION_WORKSHOPS, damageInfo.workshopId);
    if (!workshop) {
      throw new Error("Can't find workshop");
    }
    // Get service provider Info
    const serviceProvider = await getDocumentInfo(COLLECTION_SERVICE_PROVIDERS, damageInfo.paintShopId);
    if (!serviceProvider) {
      throw new Error("Can't find service provider");
    }
    // Create the user's address
    const dealerNameAndAddress = `${workshop.street}, ${workshop.postalCode} ${workshop.city}`;
    const serviceProviderAddress = `${serviceProvider.street}, ${serviceProvider.postalCode} ${serviceProvider.city}`;

    page1.drawText(workshop.name, { x: 125, y: 595, size: 10, font: customFont });
    page1.drawText(workshop.phone, { x: 82, y: 582, size: 10, font: customFont });
    page1.drawText(workshop.email, { x: 80, y: 563, size: 10, font: customFont });
    page1.drawText(dealerNameAndAddress, { x: 87, y: 548, size: 10, font: customFont });
    // -------
    page1.drawText(serviceProvider.name || "", { x: 125, y: 514, size: 10, font: customFont });
    page1.drawText(serviceProvider.phone || "", { x: 82, y: 498, size: 10, font: customFont });
    page1.drawText(serviceProvider.email || "", { x: 80, y: 485, size: 10, font: customFont });
    page1.drawText(serviceProviderAddress, { x: 87, y: 465, size: 10, font: customFont });
    // -------
    page1.drawText(damageInfo.customerVehicleModel || "", { x: 110, y: 430, size: 10, font: customFont });
    page1.drawText(damageInfo.customerVehicleVINNumber || "", { x: 85, y: 415, size: 10, font: customFont });
    page1.drawText(damageInfo.customerVehicleLicensePlate || "", { x: 128, y: 397, size: 10, font: customFont });

    const pdfBytes = await pdfDoc.save();
    logger.info("===== Created PDF file =====");
    const buffer = Buffer.from(pdfBytes);
    return buffer;
  } catch (error) {
    logger.error("=====Failed to processing attorney pdf ====", error);
    return null;
  }
};

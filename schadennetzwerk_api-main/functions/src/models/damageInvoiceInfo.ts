import * as Joi from "@hapi/joi";
import "joi-extract-type";

const defaultValues = {
  invoiceTotal: 0,
  deductionAmount: 0,
  invoiceNumber: "",
  claimNumber: "",
  insuranceCompany: "",
  workshopName: "",
  vehicleOwner: "",
  invoiceDate: null,
  deductionDate: null,
  deductionReason: "",
  insuranceContact: "",
  legalAction: "",
  files: [],
  decisionComment: "",
};

export const damageInvoiceInfoModel = Joi.object({
  "damageInvoiceInfoId": Joi.string().optional(),
  "damageId": Joi.string().required(),
  "invoiceTotal": Joi.number().default(defaultValues.invoiceTotal),
  "deductionAmount": Joi.number().default(defaultValues.deductionAmount),
  "invoiceNumber": Joi.string().allow("").default(defaultValues.invoiceNumber),
  "claimNumber": Joi.string().allow("").default(defaultValues.claimNumber),
  "insuranceCompany": Joi.string().allow("").default(defaultValues.insuranceCompany),
  "workshopName": Joi.string().allow("").default(defaultValues.workshopName),
  "vehicleOwner": Joi.string().allow("").default(defaultValues.vehicleOwner),
  "invoiceDate": Joi.date().optional().allow(null).default(defaultValues.invoiceDate),
  "deductionDate": Joi.date().optional().allow(null).default(defaultValues.deductionDate),
  "deductionReason": Joi.string().allow("").default(defaultValues.deductionReason),
  "insuranceContact": Joi.string().allow("").default(defaultValues.insuranceContact),
  "legalAction": Joi.string().allow("").default(defaultValues.legalAction),
  "files": Joi.array().default(defaultValues.files),
  "decisionComment": Joi.string().allow("").default(defaultValues.decisionComment),
  "isForNotification": Joi.boolean().optional().default(false),
});

export type IDamageInvoiceInfoModel = Joi.extractType<typeof damageInvoiceInfoModel>;

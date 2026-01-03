import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const editSalesmanModel = Joi.object({
  "salesmanId": Joi.string().optional(),
  "workshopIds": Joi.array().optional(),
  "name": Joi.string().required(),
  "email": Joi.string().email().required(),
  "phone": Joi.string().required(),
  "commission": Joi.number().optional().default(0),
  "whatsapp": Joi.string().allow(""),
  "salesmanNumber": Joi.string().required(),
  "street": Joi.string().required(),
  "country": Joi.string().required(),
  "city": Joi.string().required(),
  "postalCode": Joi.string().required(),
  "isAppraiserToo": Joi.boolean().default(false),
  "needSendContract": Joi.boolean().default(false),
});

export type IEditSalesmanModel = Joi.extractType<typeof editSalesmanModel>;

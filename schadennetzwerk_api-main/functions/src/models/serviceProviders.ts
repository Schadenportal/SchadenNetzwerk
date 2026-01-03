import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const editServiceProviderModel = Joi.object({
  "serviceProviderId": Joi.string().optional(),
  // "workshopIds": Joi.array().required(),
  "serviceType": Joi.string().required(),
  "name": Joi.string().required(),
  "email": Joi.string().email().required(),
  "phone": Joi.string().required(),
  "telephone": Joi.string().allow(""),
  "commission": Joi.number().optional().default(0),
  "setupFee": Joi.number().optional().default(0),
  "whatsapp": Joi.string().allow(""),
  "street": Joi.string().required(),
  "country": Joi.string().required(),
  "city": Joi.string().required(),
  "postalCode": Joi.string().required(),
  "isSalesmanToo": Joi.boolean().default(false),
  "salesmanNumber": Joi.string().allow(""),
  "needSendContract": Joi.boolean().default(false),
  "isDisabled": Joi.boolean().default(false),
});

export const updateWorkshopInfoModel = Joi.object({
  "isAdd": Joi.boolean().required(),
  "workshopId": Joi.string().required(),
  "serviceProviderIds": Joi.array().required(),
});

export const disableActionModel = Joi.object({
  isDisabled: Joi.boolean().required(),
  serviceProviderId: Joi.string().required(),
});

export type IEditServiceProviderModel = Joi.extractType<typeof editServiceProviderModel>;
export type IUpdateWorkshopInfoModel = Joi.extractType<typeof updateWorkshopInfoModel>;
export type IDisableActionModel = Joi.extractType<typeof disableActionModel>;

import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const editAgentModel = Joi.object({
  "agentId": Joi.string().optional(),
  "workshopIds": Joi.array().optional(),
  "firstName": Joi.string().required(),
  "lastName": Joi.string().required(),
  "email": Joi.string().email().required(),
  "phone": Joi.string().required(),
  "commission": Joi.number().required().default(0),
  "commissionType": Joi.string().required(),
  "whatsapp": Joi.string().allow(""),
  "street": Joi.string().required(),
  "country": Joi.string().required(),
  "city": Joi.string().required(),
  "postalCode": Joi.string().required(),
});

export type IEditAgentModel = Joi.extractType<typeof editAgentModel>;

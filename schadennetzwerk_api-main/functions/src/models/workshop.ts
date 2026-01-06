import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const createWorkshopModel = Joi.object({
  "workshopId": Joi.string().optional(),
  "name": Joi.string().required(),
  "email": Joi.string().email().required(),
  "phone": Joi.string().required(),
  "whatsapp": Joi.string().allow(""),
  "street": Joi.string().required(),
  "country": Joi.string().required(),
  "city": Joi.string().required(),
  "postalCode": Joi.string().required(),
  "otherEmails": Joi.object({
    "transportEmail": Joi.string().email().allow(""),
    "ceoEmail": Joi.string().email().required(),
    "otherEmail": Joi.string().email().allow(""),
  }),
  "commission": Joi.number().optional().default(0),
  "setupFee": Joi.number().optional().default(0),
  "monthlyBaseFee": Joi.number().optional().default(0),
});

export type ICreateWorkshopModel = Joi.extractType<typeof createWorkshopModel>;

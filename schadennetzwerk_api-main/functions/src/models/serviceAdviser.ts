import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const ServiceAdviserModel = Joi.object({
  "adviserId": Joi.string().optional().allow(""),
  "workshopId": Joi.string().required(),
  "firstName": Joi.string().required(),
  "lastName": Joi.string().required(),
  "email": Joi.string().email().required(),
  "phone": Joi.string().required(),
  "whatsapp": Joi.string().allow(""),
  "street": Joi.string().required(),
  "country": Joi.string().required(),
  "city": Joi.string().required(),
  "postalCode": Joi.string().required(),
});

export type IServiceAdviserModel = Joi.extractType<typeof ServiceAdviserModel>;

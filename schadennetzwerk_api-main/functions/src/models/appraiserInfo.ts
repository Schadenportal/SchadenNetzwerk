import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const AppraiserInfoModel = Joi.object({
  "appraiserInfoId": Joi.string().optional(),
  "appraiserId": Joi.string().required(),
  "name": Joi.string().required(),
  "companyName": Joi.string().optional().allow(""),
  "email": Joi.string().email().required(),
  "phone": Joi.string().required(),
  "address": Joi.object({
    "street": Joi.string().required(),
    "country": Joi.string().required(),
    "city": Joi.string().required(),
    "postalCode": Joi.string().required(),
  }).required(),
});

export type IAppraiserInfoModel = Joi.extractType<typeof AppraiserInfoModel>;

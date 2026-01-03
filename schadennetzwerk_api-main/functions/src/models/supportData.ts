import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const supportModel = Joi.object({
  "supportId": Joi.string().optional(),
  "name": Joi.string().required(),
  "email": Joi.string().email().required(),
  "subject": Joi.string().required(),
  "content": Joi.string().required(),
  "attachedFiles": Joi.array(),
  "status": Joi.string(),
});

export type ISupportModel = Joi.extractType<typeof supportModel>;

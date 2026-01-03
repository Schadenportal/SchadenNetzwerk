import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const manageFilesModel = Joi.object({
  "workshopId": Joi.string().required(),
  "isDelete": Joi.boolean().optional().default(false),
  "fileUrl": Joi.string().uri().optional(),
  "files": Joi.array().items(
    Joi.object({
      "id": Joi.string().required(),
      "name": Joi.string().required(),
      "size": Joi.number().required(),
      "type": Joi.string().required(),
      "uploadedAt": Joi.date().required(),
      "uploadedBy": Joi.string().required(),
      "url": Joi.string().uri().required(),
    })
  ).optional(),
});

export type IManageFilesModel = Joi.extractType<typeof manageFilesModel>;

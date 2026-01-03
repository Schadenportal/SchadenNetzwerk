import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const transportDamageModel = Joi.object({
  transportDamageId: Joi.string().optional(),
  workshopId: Joi.string().required(),
  employee: Joi.string().required(),
  isWaybillAvailable: Joi.boolean().default(false),
  waybillNumber: Joi.string().allow(""),
  manufacturer: Joi.string().required(),
  vin: Joi.string().allow(""),
  vinImage: Joi.array(),
  transportDoc: Joi.array(),
  isVehicleDamaged: Joi.boolean().default(false),
  otherFiles: Joi.array(),
  receiverEmail: Joi.string().required(),
});

export type ITransportDamageModel = Joi.extractType<typeof transportDamageModel>;

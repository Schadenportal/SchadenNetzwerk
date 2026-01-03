import * as Joi from "@hapi/joi";
import "joi-extract-type";

import { USER_ROLE_OPTIONS } from "../types/enums";

export const createUserModel = Joi.object({
  "role": Joi.string().valid(...USER_ROLE_OPTIONS).required(),
  "firstName": Joi.string().required(),
  "lastName": Joi.string().required(),
});

export const updateUserModel = Joi.object({
  "firstName": Joi.string().required(),
  "lastName": Joi.string().required(),
  "email": Joi.string().email().required(),
  "whatsapp": Joi.string().allow(""),
  "phone": Joi.string().required(),
  "photoURL": Joi.string().allow(null),
  "street": Joi.string().allow(""),
  "country": Joi.string().allow(""),
  "city": Joi.string().allow(""),
  "postalCode": Joi.string().allow(""),
  "isPublic": Joi.boolean().default(false),
  "about": Joi.string().allow(""),
});

export const userAuthModel = Joi.object({
  password: Joi.string().allow(null),
  isDisable: Joi.boolean().allow(null).default(false),
});

export type ICreateUserModel = Joi.extractType<typeof createUserModel>;
export type IUpdateUserModel = Joi.extractType<typeof updateUserModel>;
export type IUserAuthModel = Joi.extractType<typeof userAuthModel>;

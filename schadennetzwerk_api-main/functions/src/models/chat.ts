import * as Joi from "@hapi/joi";
import "joi-extract-type";

export const chatRoomModel = Joi.object({
  chatRoomId: Joi.string().optional(),
  damageId: Joi.string().required(),
  type: Joi.string().required(),
  creator: Joi.string().required(),
  unreadCount: Joi.number().required().default(0),
  lastMessage: Joi.string().required(),
  lastSenderId: Joi.string().required(),
  participants: Joi.array().required(),
});

export const chatMessageModel = Joi.object({
  chatMessageId: Joi.string().optional(),
  chatRoomId: Joi.string().required(),
  senderId: Joi.string().required(),
  message: Joi.string().required(),
  contentType: Joi.string().required(),
  attachment: Joi.string().allow(""),
  isRead: Joi.boolean().required().default(false),
});

export type IChatRoomModel = Joi.extractType<typeof chatRoomModel>;
export type IChatMessageModel = Joi.extractType<typeof chatMessageModel>;

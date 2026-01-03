import { Timestamp } from "firebase/firestore";

class ChatMessageModel {
  chatMessageId: string;

  chatRoomId: string;

  senderId: string;

  message: string;

  contentType: string;

  attachment: string;

  isRead: boolean;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.chatMessageId = data.chatMessageId as string;
    this.chatRoomId = data.chatRoomId as string;
    this.senderId = data.senderId as string;
    this.message = data.message as string;
    this.contentType = data.contentType as string;
    this.attachment = data.attachment as string;
    this.isRead = data.isRead as boolean;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default ChatMessageModel;

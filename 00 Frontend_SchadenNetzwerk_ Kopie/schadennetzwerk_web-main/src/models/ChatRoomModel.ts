import { Timestamp } from "firebase/firestore";

class ChatRoomModel {
  chatRoomId: string;

  damageId: string;

  type: string;

  unreadCount: number;

  creator: string;;

  lastMessage: string;

  lastSenderId: string;

  participants: string[];

  readAts: Record<string, Timestamp>;

  createdAt: Timestamp;

  updatedAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.chatRoomId = data.chatRoomId as string;
    this.damageId = data.damageId as string;
    this.type = data.type as string;
    this.unreadCount = data.unreadCount as number;
    this.creator = data.creator as string;
    this.lastMessage = data.lastMessage as string;
    this.lastSenderId = data.lastSenderId as string;
    this.participants = data.participants as string[];
    this.readAts = data.readAts as Record<string, Timestamp>;
    this.createdAt = data.createdAt as Timestamp;
    this.updatedAt = data.updatedAt as Timestamp;

    Object.freeze(this);
  }
}

export default ChatRoomModel;

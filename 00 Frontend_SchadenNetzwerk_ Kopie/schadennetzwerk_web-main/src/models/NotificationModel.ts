import { Timestamp } from "firebase/firestore";

import { NotificationTypes } from "src/types/enums";

class NotificationModel {
  notificationId: string;

  chatRoomId?: string;

  damageId?: string;

  type: NotificationTypes;

  title: string;

  senderId: string;

  receiverId: string;

  senderPhotoURL?: string;

  linkUrl?: string;

  isArchived: boolean;

  isUnread: boolean;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.notificationId = data.notificationId as string;
    this.chatRoomId = data?.chatRoomId as string;
    this.damageId = data?.damageId as string;
    this.type = data.type as NotificationTypes;
    this.title = data.title as string;
    this.senderId = data.senderId as string;
    this.receiverId = data.receiverId as string;
    this.senderPhotoURL = data.senderPhotoURL as string;
    this.linkUrl = data.linkUrl as string;
    this.isArchived = data.isArchived as boolean;
    this.isUnread = data.isUnread as boolean;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default NotificationModel;

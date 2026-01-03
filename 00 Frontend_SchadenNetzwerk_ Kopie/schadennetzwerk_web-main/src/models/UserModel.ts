import { Timestamp } from "firebase/firestore";

interface UserStatus {
  isOnline: boolean;
  lastLoginAt: Timestamp;
}
class UserModel {

  userId: string;

  firstName: string;

  lastName: string;

  fullName: string;

  email: string;

  phone: string;

  photoURL: string;

  role: string;

  isOnline: boolean;

  city: string;

  street: string;

  postalCode: string;

  lastOnlineAt: Timestamp;

  userStatus?: UserStatus;

  createdAt: Timestamp;

  constructor(data: Record<string, any>) {
    this.userId = data.userId as string;
    this.firstName = data.firstName as string;
    this.lastName = data.lastName as string;
    this.fullName = data.fullName as string;
    this.photoURL = data.photoURL as string;
    this.email = data.email as string;
    this.phone = data.phone as string;
    this.role = data.role as string;
    this.isOnline = data.isOnline as boolean;
    this.city = data.city as string;
    this.street = data.street as string;
    this.postalCode = data.postalCode as string;
    this.lastOnlineAt = data.lastOnlineAt as Timestamp;
    this.userStatus = data.userStatus as UserStatus;
    this.createdAt = data.createdAt as Timestamp;

    Object.freeze(this);
  }
}

export default UserModel;

import { db } from "../views/config";
import { logger } from "firebase-functions/v1";
import {
  rkuPlacement,
  attorneyTaskPlacement,
  appraiserTaskPlacement,
  carRentalAssignmentPlacement,
  carRentalContractPlacement,
  COLLECTION_DAMAGE,
  FIELD_ORDER_NUMBER,
} from "../constants";
import { ServiceProviderType, ServiceTaskTypes, UserRole } from "../types/enums";
import { getAuth } from "firebase-admin/auth";
import axios from "axios";
import fs from "fs";

const orderInitNumber = "010110";

export const getDamageUniqueNumber = async () => {
  try {
    const query = db.collection(COLLECTION_DAMAGE).orderBy(FIELD_ORDER_NUMBER, "desc").limit(1);
    const querySnap = await query.get();
    if (!querySnap.empty && querySnap.size === 1) {
      const damage = querySnap.docs[0].data();
      const curNumber = parseInt(damage.orderNumber);
      const newNumber = ("000" + (curNumber + 1)).slice(-6);
      return newNumber;
    }
    return orderInitNumber;
  } catch (error) {
    logger.info("Dublication Validatiion Error: ==", error);
    return null;
  }
};

export const generateUniqueId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const getScriveDocPlacement = (isContract = false, serviceType?: ServiceTaskTypes) => {
  if (serviceType) {
    switch (serviceType) {
      case ServiceTaskTypes.APPRAISER_TASK:
        return appraiserTaskPlacement;
      case ServiceTaskTypes.ATTORNEY_TASK:
        return attorneyTaskPlacement;
      case ServiceTaskTypes.CAR_RENTAL_TASK:
        if (isContract) {
          return carRentalContractPlacement;
        }
        return carRentalAssignmentPlacement;
      default:
        return;
    }
  } else {
    return rkuPlacement;
  }
};

export const getFilePathFromUrl = (url: string) => {
  if (!url) {
    return null;
  }
  let suffix = "";
  if (url.includes(".jpg")) {
    suffix = ".jpg";
  } else if (url.includes(".png")) {
    suffix = ".png";
  } else if (url.includes(".bmp")) {
    suffix = ".bmp";
  } else if (url.includes(".gif")) {
    suffix = ".gif";
  } else if (url.includes(".mp3")) {
    suffix = ".mp3";
  } else if (url.includes(".mp4")) {
    suffix = ".mp4";
  } else if (url.includes(".pdf")) {
    suffix = ".pdf";
  } else {
    return null;
  }
  let mediaPath = "";
  let spliter1 = "";
  let spliter2 = "";
  if (url.includes("?alt")) {
    spliter1 = "?alt";
    if (url.startsWith("https://firebasestorage.googleapis.com:443/v0/b/schadennetzwerk-7dc39.appspot.com/o/")) {
      spliter2 = "https://firebasestorage.googleapis.com:443/v0/b/schadennetzwerk-7dc39.appspot.com/o/";
    } else {
      spliter2 = "https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/";
    }
  } else if (url.includes("?GoogleAccessId")) {
    spliter1 = "?GoogleAccessId";
    spliter2 = "https://storage.googleapis.com/schadennetzwerk-7dc39.appspot.com/";
  } else {
    return null;
  }
  url.split(spliter1).forEach((piece1) => {
    if (piece1.startsWith(spliter2)) {
      piece1.split(spliter2).forEach((piece2) => {
        if (piece2.endsWith(suffix)) {
          if (piece2.includes("%2F")) {
            mediaPath = piece2.split("%2F").join("/");
          } else {
            mediaPath = piece2;
          }
        }
      });
    }
  });
  return mediaPath;
};

// format number to US dollar
export const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// format number to British pounds
export const pounds = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// format number to Indian rupee
export const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

// format number to Euro
export const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export const sumByKey = (arr: any[], key: string, value: string) => {
  const map = new Map();
  for (const obj of arr) {
    const currSum = map.get(obj[key]) || 0;
    map.set(obj[key], currSum + obj[value]);
  }
  const res = Array.from(map, ([k, v]) => ({ [key]: k, [value]: v }));
  return res;
};

export const getServiceNameFromServiceTaskType = (taskType: ServiceTaskTypes) => {
  switch (taskType) {
    case ServiceTaskTypes.APPRAISER_TASK:
      return "Gutachter";
    case ServiceTaskTypes.ATTORNEY_TASK:
      return "Rechtsanwalt";
    case ServiceTaskTypes.CAR_RENTAL_TASK:
      return "Unfallersatz";
    case ServiceTaskTypes.PAINT_SHOP_TASK:
      return "Lack & Karosserie";
    case ServiceTaskTypes.TOWING_SERVICE_TASK:
      return "Abschleppdienst";
    default:
      return "";
  }
};

export const getUserRoleFromServiceType = (serviceType: ServiceProviderType) => {
  switch (serviceType) {
    case ServiceProviderType.APPRAISER:
      return UserRole.Appraiser;
    case ServiceProviderType.ATTORNEY:
      return UserRole.Lawyer;
    case ServiceProviderType.CAR_RENTAL:
      return UserRole.CarRenter;
    case ServiceProviderType.PAINT_SHOP:
      return UserRole.PaintShop;
    default:
      return UserRole.TowingService;
  }
};

export const checkUserRoleMatchToServiceType = (serviceType: ServiceProviderType, userRole: UserRole) => {
  switch (serviceType) {
    case ServiceProviderType.APPRAISER:
      return userRole === UserRole.Appraiser;
    case ServiceProviderType.ATTORNEY:
      return userRole === UserRole.Lawyer;
    case ServiceProviderType.CAR_RENTAL:
      return userRole === UserRole.CarRenter;
    case ServiceProviderType.PAINT_SHOP:
      return userRole === UserRole.PaintShop;
    default:
      return userRole === UserRole.TowingService;
  }
};

export const modifyFileName = (fileName: string) => fileName.replace(/ /g, "_");

// Add time to current date time
export const addTimeToDate = (time: number) => {
  const date = new Date();
  date.setHours(date.getHours() + time);
  return date;
};

// Add minutes to current date time
export const addMinutesToDate = (minutes: number) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

// Check if Auth already used
export const checkAuthIsUsed = async (email: string) => {
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    console.log(`Email ${email} is already in use by user ${userRecord.uid}`);
    return { isUsed: true, uid: userRecord.uid };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      console.log(`Email ${email} is available.`);
    } else {
      console.error("Error checking email:", error);
    }
    return { isUsed: false, uid: "" };
  }
};

export const downloadFile = async (url: string, filePath: string) => {
  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

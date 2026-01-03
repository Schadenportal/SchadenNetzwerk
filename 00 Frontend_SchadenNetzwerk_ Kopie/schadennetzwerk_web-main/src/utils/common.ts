import Papa from 'papaparse';
import { saveAs } from 'file-saver';

import { getFileNameFromURL } from "src/services/firebase/firebaseStorage";

import { ServiceProviderType, ServiceTaskStatusTypes } from "src/types/enums";

export const exportToCSV = (data: any, filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

export const modifyFileName = (fileName: string) => fileName.replace(/ /g, "_");

export const trimPhoneNumber = (phoneNumber: string) => phoneNumber.replace(/[^0-9+]/g, '');

export const checkAndTrimWhatsAppNumber = (whatsappNumber: string) => {
  if (!whatsappNumber || whatsappNumber === "+49") {
    return "";
  }
  return trimPhoneNumber(whatsappNumber);
}

export const API_ROOT = () => {
  if (import.meta.env.MODE === 'development') {
    return "http://127.0.0.1:5001/schadennetzwerk-7dc39/europe-west3/apis/";
  }
  return "https://apis-x77ef4jf7q-ey.a.run.app/";
}

export const downloadFileFromStorage = (fileUrl: string) => {
  fetch(fileUrl)
    .then(response => {
      response.blob().then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getFileNameFromURL(fileUrl);
        a.click();
      });
    }).catch((err) => {
      console.log("==Download error===", err);
    })
}

export const getCityAndPostCode = (address: string) => {
  const addressArr = address.split(" ");
  if (addressArr.length >= 2) {
    const postCode = addressArr[0];
    addressArr.shift();
    const city = addressArr.join(" ");
    return { postCode, city }
  }
  return { postCode: "", city: "" };
}

export const getServiceName = (service: ServiceProviderType) => {
  switch (service) {
    case ServiceProviderType.ATTORNEY:
      return "Rechtsanwalt"
    case ServiceProviderType.APPRAISER:
      return "Gutachter"
    case ServiceProviderType.CAR_RENTAL:
      return "Unfallersatz"
    case ServiceProviderType.PAINT_SHOP:
      return "Lack & Karosserie"
    case ServiceProviderType.TOWING_SERVICE:
      return "Abschleppdienst"
    default:
      return ""
  }
}

export const getSigningDocStatus = (type: ServiceTaskStatusTypes) => {
  switch (type) {
    case ServiceTaskStatusTypes.CREATED:
      return { label: "erstellt", color: "primary" };
    case ServiceTaskStatusTypes.SIGNED:
      return { label: "unterzeichnet", color: "secondary" };
    case ServiceTaskStatusTypes.ACCEPTED:
      return { label: "akzeptiert", color: "info" };
    case ServiceTaskStatusTypes.FINISHED:
      return { label: "fertig", color: "success" };
    default:
      return { label: "", color: "" };
  }
}

export const getUserTypeLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "admin"
    case "owner":
      return "workshop"
    case "lawyer":
      return "attorney"
    case "appraiser":
      return "appraiser"
    case "carRenter":
      return "car_rental"
    case "towingService":
      return "towing_service"
    case "paintShop":
      return "paint_shop"
    case "salesman":
      return "salesman"
    case "salesAppraiser":
      return "sales_appraiser"
    case "agent":
      return "agent"
    default:
      return ""
  }
}

export const haveCommonElement = (arr1: string[], arr2: string[]) => arr1.some(item => arr2.includes(item));

import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

import {
  FUNCTION_SET_AGENT,
  FUNCTION_DECODE_VIN,
  FUNCTION_SET_DAMAGE,
  FUNCTION_CREATE_USER,
  FUNCTION_UPDATE_USER,
  FUNCTION_REMOVE_AGENT,
  FUNCTION_SET_WORKSHOP,
  FUNCTION_SET_SALESMAN,
  FUNCTION_MANAGE_FILES,
  FUNCTION_REMOVE_DAMAGE,
  FUNCTION_SET_CHAT_ROOM,
  FUNCTION_GET_CAR_MODELS,
  FUNCTION_REMOVE_MESSAGE,
  FUNCTION_REMOVE_WORKSHOP,
  FUNCTION_REMOVE_SALESMAN,
  FUNCTION_REMOVE_USED_CAR,
  FUNCTION_COMPLETE_DAMAGE,
  FUNCTION_CHANGE_AUTH_USER,
  FUNCTION_SET_CHAT_MESSAGE,
  FUNCTION_DELETE_CHAT_ROOM,
  FUNCTION_SET_USED_CAR_DATA,
  FUNCTION_GET_CHAT_PARTNERS,
  FUNCTION_GET_DASHBOARD_DATA,
  FUNCTION_SET_SUPPORT_TICKET,
  FUNCTION_REMOVE_DAMAGE_FILE,
  FUNCTION_SET_APPRAISER_INFO,
  FUNCTION_CREATE_REPAIR_PLAN,
  FUNCTION_UPDATE_USER_STATUS,
  FUNCTION_UPDATE_DAMAGE_INFO,
  FUNCTION_SET_SERVICE_ADVISER,
  FUNCTION_SET_SERVICE_PROVIDER,
  FUNCTION_SET_TRANSPORT_DAMAGE,
  FUNCTION_HANDLE_WORKSHOP_INFO,
  FUNCTION_UPDATE_CHAT_READ_TIME,
  FUNCTION_REMOVE_COST_ESTIMATION,
  FUNCTION_UPDATE_DAMAGE_APPROVAL,
  FUNCTION_SET_INVOICE_FOR_DAMAGE,
  FUNCTION_REMOVE_SERVICE_ADVISER,
  FUNCTION_REMOVE_SERVICE_PROVIDER,
  FUNCTION_SET_REPAIR_CONFIRMATION,
  FUNCTION_SET_COST_ESTIMATION_DATA,
  FUNCTION_UPDATE_PROVIDER_WORKSHOP,
  FUNCTION_DISABLE_SERVICE_PROVIDER,
  FUNCTION_REMOVE_TRANSACTION_DAMAGE,
  FUNCTION_UPDATE_SERVICE_TASK_STATUS,
  FUNCTION_UPDATE_NOTIFICATION_STATUS,
  FUNCTION_UPLOAD_DAMAGE_RELATED_FILES,
  FUNCTION_SET_CALCULATION_DEFAULT_DATA,
  FUNCTION_HANDLE_SERVICE_PROVIDER_INFO,
} from "src/constants/firebase";

import firebaseApp from "./firebaseApp";

const functions = getFunctions(firebaseApp, "europe-west3");
if (import.meta.env.MODE === 'development') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export const getDashboardData = httpsCallable(functions, FUNCTION_GET_DASHBOARD_DATA);
export const createUserFunc = httpsCallable(functions, FUNCTION_CREATE_USER);
export const updateUserFunc = httpsCallable(functions, FUNCTION_UPDATE_USER);
export const updateRepairApproval = httpsCallable(functions, FUNCTION_UPDATE_DAMAGE_APPROVAL);
export const changeAuthUser = httpsCallable(functions, FUNCTION_CHANGE_AUTH_USER);
export const setWorkshopFunc = httpsCallable(functions, FUNCTION_SET_WORKSHOP);
export const handleWorkshopInfoFunc = httpsCallable(functions, FUNCTION_HANDLE_WORKSHOP_INFO);
export const removeWorkshopFunc = httpsCallable(functions, FUNCTION_REMOVE_WORKSHOP);
export const setServiceProviderFunc = httpsCallable(functions, FUNCTION_SET_SERVICE_PROVIDER);
export const handleServiceProviderInfoFunc = httpsCallable(functions, FUNCTION_HANDLE_SERVICE_PROVIDER_INFO);
export const disableServiceProviderFunc = httpsCallable(functions, FUNCTION_DISABLE_SERVICE_PROVIDER);
export const removeServiceProviderFunc = httpsCallable(functions, FUNCTION_REMOVE_SERVICE_PROVIDER);
export const setSalesman = httpsCallable(functions, FUNCTION_SET_SALESMAN);
export const setAgent = httpsCallable(functions, FUNCTION_SET_AGENT);
export const removeAgent = httpsCallable(functions, FUNCTION_REMOVE_AGENT);
export const setServiceAdviser = httpsCallable(functions, FUNCTION_SET_SERVICE_ADVISER);
export const removeServiceAdviser = httpsCallable(functions, FUNCTION_REMOVE_SERVICE_ADVISER);
export const removeSalesman = httpsCallable(functions, FUNCTION_REMOVE_SALESMAN);
export const getCarModels = httpsCallable(functions, FUNCTION_GET_CAR_MODELS);
export const decodeVIN = httpsCallable(functions, FUNCTION_DECODE_VIN);
export const setDamage = httpsCallable(functions, FUNCTION_SET_DAMAGE);
export const completeDamage = httpsCallable(functions, FUNCTION_COMPLETE_DAMAGE);
export const createRepairPlan = httpsCallable(functions, FUNCTION_CREATE_REPAIR_PLAN);
export const removeDamage = httpsCallable(functions, FUNCTION_REMOVE_DAMAGE);
export const updateServiceTaskStatus = httpsCallable(functions, FUNCTION_UPDATE_SERVICE_TASK_STATUS);
export const setCalculationDefaultData = httpsCallable(functions, FUNCTION_SET_CALCULATION_DEFAULT_DATA);
export const setCostEstimationData = httpsCallable(functions, FUNCTION_SET_COST_ESTIMATION_DATA);
export const removeCostEstimation = httpsCallable(functions, FUNCTION_REMOVE_COST_ESTIMATION);
export const setUsedCarData = httpsCallable(functions, FUNCTION_SET_USED_CAR_DATA);
export const removeUsedCar = httpsCallable(functions, FUNCTION_REMOVE_USED_CAR);
export const setTransportDamageData = httpsCallable(functions, FUNCTION_SET_TRANSPORT_DAMAGE);
export const removeTransportDamage = httpsCallable(functions, FUNCTION_REMOVE_TRANSACTION_DAMAGE);
export const createSupportTicket = httpsCallable(functions, FUNCTION_SET_SUPPORT_TICKET);
export const uploadDamageRelatedFiles = httpsCallable(functions, FUNCTION_UPLOAD_DAMAGE_RELATED_FILES);
export const removeDamageFile = httpsCallable(functions, FUNCTION_REMOVE_DAMAGE_FILE);
export const setAppraiserInfo = httpsCallable(functions, FUNCTION_SET_APPRAISER_INFO);
export const updateProviderWorkshop = httpsCallable(functions, FUNCTION_UPDATE_PROVIDER_WORKSHOP);
export const setChatRoom = httpsCallable(functions, FUNCTION_SET_CHAT_ROOM);
export const setChatMessage = httpsCallable(functions, FUNCTION_SET_CHAT_MESSAGE);
export const removeMessage = httpsCallable(functions, FUNCTION_REMOVE_MESSAGE);
export const getMyChatPartners = httpsCallable(functions, FUNCTION_GET_CHAT_PARTNERS);
export const updateChatReadTime = httpsCallable(functions, FUNCTION_UPDATE_CHAT_READ_TIME);
export const deleteChatRoom = httpsCallable(functions, FUNCTION_DELETE_CHAT_ROOM);
export const updateNotificationStatus = httpsCallable(functions, FUNCTION_UPDATE_NOTIFICATION_STATUS);
export const updateUserStatus = httpsCallable(functions, FUNCTION_UPDATE_USER_STATUS);
export const setRepairConfirmation = httpsCallable(functions, FUNCTION_SET_REPAIR_CONFIRMATION);
export const setInvoiceInfoForDamage = httpsCallable(functions, FUNCTION_SET_INVOICE_FOR_DAMAGE);
export const manageFiles = httpsCallable(functions, FUNCTION_MANAGE_FILES);
export const updateDamageInfo = httpsCallable(functions, FUNCTION_UPDATE_DAMAGE_INFO);

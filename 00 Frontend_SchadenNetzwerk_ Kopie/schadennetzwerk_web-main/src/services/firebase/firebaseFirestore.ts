import {
  doc,
  where,
  query,
  limit,
  getDoc,
  getDocs,
  orderBy,
  Timestamp,
  collection,
  onSnapshot,
  getFirestore,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";

import UserModel from "src/models/UserModel";
import AgentModel from "src/models/AgentModel";
import DamageModel from "src/models/DamageModel";
import UsedCarModel from "src/models/UsedCarModel";
import WorkshopModel from "src/models/WorkshopModel";
import SalesmanModel from "src/models/SalesmanModel";
import ChatRoomModel from "src/models/ChatRoomModel";
import { FileInfo } from "src/models/WorkshopFileModel";
import SigningDocsModel from "src/models/SigningDocsModel";
import ServiceTaskModel from "src/models/ServiceTaskModel";
import ChatMessageModel from "src/models/ChatMessageModel";
import CostEstimateModel from "src/models/CostEstimateModel";
import NotificationModel from "src/models/NotificationModel";
import AppraiserInfoModel from "src/models/AppraiserInfoModel";
import RepairPlanDocModel from "src/models/RepairPlanDocModel";
import ServiceAdviserModel from "src/models/ServiceAdviserModel";
import ServiceProviderModel from "src/models/ServiceProviderModel";
import TransportDamageModel from "src/models/TransportDamageModel";
import {
  CHAT_LIMIT,
  COLLECTION_AGENT,
  COLLECTION_USERS,
  COLLECTION_DAMAGE,
  COLLECTION_SALESMAN,
  COLLECTION_USED_CAR,
  COLLECTION_WORKSHOPS,
  COLLECTION_CHAT_ROOM,
  COLLECTION_SIGNING_DOCS,
  COLLECTION_SERVICE_TASK,
  COLLECTION_DAMAGE_FILES,
  COLLECTION_CHAT_MESSAGE,
  COLLECTION_NOTIFICATION,
  COLLECTION_COST_ESTIMATES,
  COLLECTION_APPRAISER_INFO,
  COLLECTION_WORKSHOP_FILES,
  COLLECTION_SERVICE_ADVISER,
  COLLECTION_CALCULATION_DATA,
  COLLECTION_TRANSPORT_DAMAGE,
  COLLECTION_REPAIR_PLAN_DOCS,
  COLLECTION_SERVICE_PROVIDERS,
} from "src/constants/firebase";

import { IDamageTableFilters } from "src/types/damage";
import { IWorkshopTableFilters } from "src/types/workshop";
import { ISalesmanTableFilters } from "src/types/salesman";
import { IServiceAdviserTableFilters } from "src/types/serviceAdviser";
import { IServiceAssignmentFilters, IServiceProviderTableFilters } from "src/types/service-providers";
import { DamageStatusType, ServiceTaskTypes, COST_ESTIMATE_TYPES, ServiceProviderType } from "src/types/enums";

import firebaseApp from "./firebaseApp";

const firebaseFirestore = getFirestore(firebaseApp);

export const getDocument = async<T>(
  collectionName: string,
  documentId: string,
  ResultClass: { new(data: DocumentData): T },
  additionalData?: Record<string, any>
) => {
  const docRef = doc(firebaseFirestore, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    if (additionalData) {
      return new ResultClass({ ...docSnap.data(), ...additionalData });
    }
    return new ResultClass(docSnap.data());
  }
  return null;
}

export const getWorkshops = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_WORKSHOPS), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const workshops: WorkshopModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    workshops.push(new WorkshopModel(documentSnapshot.data()));
  });
  return workshops;
}

export const searchWorkshop = async (searchParams: IWorkshopTableFilters, workshopIds?: string[]) => {
  const queries: QueryConstraint[] = [];
  if (searchParams.name !== "") queries.push(where("nameKeyList", 'array-contains', searchParams.name));
  if (searchParams.city !== "") queries.push(where('cityKeyList', 'array-contains', searchParams.city));
  if (searchParams.email !== "") queries.push(where('emailKeyList', 'array-contains', searchParams.email));
  if (workshopIds) queries.push(where('workshopId', 'in', workshopIds));
  queries.push(where('deletedAt', '==', null));
  queries.push(orderBy('createdAt', "desc"));

  const workshops = await getWorkshops(queries);
  return workshops;
}

export const getUserList = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_USERS), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const userList: UserModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    userList.push(new UserModel(documentSnapshot.data()));
  });
  return userList;
}

export const searchUserByEmail = async (email: string) => {
  const queries: QueryConstraint[] = [];
  if (email !== "") queries.push(where('emailKeyList', 'array-contains', email));
  queries.push(where('deletedAt', '==', null));
  queries.push(orderBy('createdAt', "desc"));

  const users = await getUserList(queries);
  return users;
}

export const getServiceProviders = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_PROVIDERS), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const serviceProviders: ServiceProviderModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    serviceProviders.push(new ServiceProviderModel(documentSnapshot.data()));
  });
  return serviceProviders;
}

export const getAgentList = async () => {
  const q = query(collection(firebaseFirestore, COLLECTION_AGENT), where('deletedAt', '==', null));

  const querySnapshot = await getDocs(q);
  const agentList: AgentModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    agentList.push(new AgentModel(documentSnapshot.data()));
  });
  return agentList;
}

export const searchServiceProviders = async (searchParams: IServiceProviderTableFilters, workshopIds?: string[]) => {
  const queries: QueryConstraint[] = [];
  if (searchParams.name !== "") queries.push(where("nameKeyList", 'array-contains', searchParams.name));
  if (searchParams.serviceType !== "") queries.push(where('serviceType', '==', searchParams.serviceType));
  if (searchParams.email !== "") queries.push(where('emailKeyList', 'array-contains', searchParams.email));
  queries.push(where('deletedAt', '==', null));

  const serviceProviders = await getServiceProviders(queries);
  if (workshopIds && serviceProviders.length > 0) {
    const providers: ServiceProviderModel[] = [];
    serviceProviders.forEach(provider => {
      if (provider.workshopIds.sort().join(",") === workshopIds.sort().join(",")) providers.push(provider);
    });
    return providers;
  }
  return serviceProviders;
}

export const getServiceProvidersByWorkshopId = async (workshopId: string) => {
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_PROVIDERS), where('workshopIds', 'array-contains', workshopId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const serviceProviders: ServiceProviderModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    serviceProviders.push(new ServiceProviderModel(documentSnapshot.data()));
  });
  return serviceProviders;
}

export const getSalesmanList = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_SALESMAN), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const salesmanList: SalesmanModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    salesmanList.push(new SalesmanModel(documentSnapshot.data()));
  });
  return salesmanList;
}

export const searchSalesman = async (searchParams: ISalesmanTableFilters, workshopIds?: string[]) => {
  const queries: QueryConstraint[] = [];
  if (searchParams.name !== "") queries.push(where("nameKeyList", 'array-contains', searchParams.name));
  if (searchParams.salesmanNumber !== "") queries.push(where('numberKeyList', 'array-contains', searchParams.salesmanNumber));
  queries.push(where('deletedAt', '==', null));

  const salesmanList = await getSalesmanList(queries);
  if (workshopIds && salesmanList.length > 0) {
    const salesmen: SalesmanModel[] = [];
    salesmanList.forEach(salesman => {
      if (salesman.workshopIds.sort().join(",") === workshopIds.sort().join(",")) salesmen.push(salesman);
    });
    return salesmen;
  }
  return salesmanList;
}

export const getCustomerList = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_ADVISER), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const customerList: ServiceAdviserModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    customerList.push(new ServiceAdviserModel(documentSnapshot.data()));
  });
  return customerList;
}

export const searchCustomer = async (searchParams: IServiceAdviserTableFilters, workshopIds?: string[]) => {
  const queries: QueryConstraint[] = [];
  if (searchParams.name !== "") queries.push(where("nameKeyList", 'array-contains', searchParams.name));
  if (searchParams.name !== "") queries.push(where("emailKeyList", 'array-contains', searchParams.email));
  // if (searchParams.email !== "") queries.push(where('emailKeyList', 'array-contains', searchParams.email));
  if (workshopIds) queries.push(where('workshopId', 'in', workshopIds));
  queries.push(where('deletedAt', '==', null));
  queries.push(orderBy('createdAt', "desc"));

  const customerList = await getCustomerList(queries);
  return customerList;
}

export const getDamageList = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_DAMAGE), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const damageList: DamageModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    damageList.push(new DamageModel(documentSnapshot.data()));
  });
  return damageList;
}

export const searchDamage = async (searchParams: IDamageTableFilters, workshopIds?: string[]) => {
  const queries: QueryConstraint[] = [];
  // if (searchParams.orderNumber !== "") queries.push(where("orderNumberKeyList", 'array-contains', searchParams.orderNumber));
  if (searchParams.licensePlate !== "") queries.push(where('cLicenseKeyList', 'array-contains', searchParams.licensePlate));
  if (searchParams.orderStatus !== "") {
    const status = searchParams.orderStatus;
    if (status === "open") {
      queries.push(where("status", "!=", DamageStatusType.FINISHED));
    } else if (status === "closed") {
      queries.push(where("status", "==", DamageStatusType.FINISHED));
    }
  }
  if (workshopIds) queries.push(where('workshopId', 'in', workshopIds));
  queries.push(where('deletedAt', '==', null));

  const damageList = await getDamageList(queries);
  return damageList;
}

export const getServiceTasks = async (queryConstraints: QueryConstraint[]) => {
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_TASK), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const serviceTasks: ServiceTaskModel[] = [];
  querySnapshot.forEach((documentSnapshot) => {
    serviceTasks.push(new ServiceTaskModel(documentSnapshot.data()));
  });
  return serviceTasks;
}

export const searchServiceTask = async (searchParams: IServiceAssignmentFilters, serviceProviderId: string = "") => {
  const queries: QueryConstraint[] = [];
  if (searchParams.orderNumber !== "") queries.push(where('orderNumberKeyList', 'array-contains', searchParams.orderNumber));
  if (searchParams.serviceStatus !== "") queries.push(where('status', '==', searchParams.serviceStatus));
  queries.push(where('serviceProviderId', '==', serviceProviderId));
  queries.push(orderBy('createdAt', "desc"));

  const serviceTaskList = await getServiceTasks(queries);
  return serviceTaskList;
}

export const getSigningDoc = async (damageId: string, serviceType: ServiceTaskTypes | string) => {
  try {
    const queries: QueryConstraint[] = [];
    queries.push(where('damageId', '==', damageId));
    queries.push(where('serviceType', '==', serviceType));
    const q = query(collection(firebaseFirestore, COLLECTION_SIGNING_DOCS), ...queries);
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const signingDocList: SigningDocsModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      signingDocList.push(new SigningDocsModel(documentSnapshot.data()));
    });
    return signingDocList;
  } catch (error) {
    return null;
  }
}

export const getServiceProviderByUserId = async (userId: string) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_PROVIDERS), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: ServiceProviderModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(new ServiceProviderModel(documentSnapshot.data()));
    });
    return list;
  } catch (error) {
    return null;
  }
}

export const getServiceTasksByDamageId = async (damageId: string, providerId: string = "") => {
  try {
    const queries: QueryConstraint[] = [];
    if (providerId !== "") queries.push(where('serviceProviderId', '==', providerId));
    queries.push(where('damageId', '==', damageId));
    const serviceTaskList = await getServiceTasks(queries);
    return serviceTaskList;
  } catch (error) {
    return null;
  }
}

export const getDefaultCalculationData = async (userId: string, calculationType: COST_ESTIMATE_TYPES) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_CALCULATION_DATA), where('userId', '==', userId), where('calculationType', '==', calculationType));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: any[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(documentSnapshot.data());
    });
    return list;
  } catch (error) {
    return null;
  }
}

export const getCostEstimationList = async (workshopIds: string[]) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_COST_ESTIMATES), where('workshopId', 'in', workshopIds), orderBy('createdAt', "desc"));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: CostEstimateModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(new CostEstimateModel(documentSnapshot.data()));
    });
    return list;
  } catch (error) {
    return null;
  }
}

export const getUsedCarList = async (workshopIds: string[]) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_USED_CAR), where('workshopId', 'in', workshopIds), orderBy('createdAt', "desc"));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: UsedCarModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(new UsedCarModel(documentSnapshot.data()));
    });
    return list;
  } catch (error) {
    return null;
  }
}

export const getTransportDamageList = async (workshopIds: string[]) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_TRANSPORT_DAMAGE), where('workshopId', 'in', workshopIds), orderBy('createdAt', "desc"));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: TransportDamageModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(new TransportDamageModel(documentSnapshot.data()));
    });
    return list;
  } catch (error) {
    return null;
  }
}

export const getServiceByUserId = async (userId: string) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_PROVIDERS), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: ServiceProviderModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(new ServiceProviderModel(documentSnapshot.data()));
    });
    return list;
  } catch (error) {
    return null;
  }
}

export const getDamageFilesByDamageId = (damageId: string, onSuccess: (list: Record<string, any>[]) => void) => {
  const q = query(collection(firebaseFirestore, COLLECTION_DAMAGE_FILES), where('damageId', '==', damageId));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: Record<string, any>[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(documentSnapshot.data());
    });
    onSuccess(list);
  });
  return unsubscribe
}

export const getServiceProviderSnapInfo = (workshopIds: string[] | undefined, onSuccess: (list: ServiceProviderModel[]) => void) => {
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_PROVIDERS), where('deletedAt', '==', null), orderBy('createdAt', "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: ServiceProviderModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new ServiceProviderModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getWorkshopSnapInfo = (userId: string | undefined, onSuccess: (list: WorkshopModel[]) => void) => {
  const queries: QueryConstraint[] = [];
  queries.push(where('deletedAt', '==', null));
  if (userId) {
    queries.push(where('creatorId', '==', userId))
  }
  queries.push(orderBy('createdAt', 'desc'));
  const q = query(collection(firebaseFirestore, COLLECTION_WORKSHOPS), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: WorkshopModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new WorkshopModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getDamageSnapInfo = (
  userId: string | undefined,
  workshopId: string | undefined,
  onSuccess: (list: DamageModel[]) => void,
  providerId: string | undefined = undefined,
  providerType: string | undefined = undefined
) => {
  const queries: QueryConstraint[] = [];
  queries.push(where('deletedAt', '==', null));
  if (userId) {
    queries.push(where('userId', '==', userId))
  } else if (workshopId) {
    queries.push(where('workshopId', '==', workshopId))
  } else if (providerId && providerType) {
    switch (providerType) {
      case ServiceProviderType.ATTORNEY:
        queries.push(where('attorneyId', '==', providerId));
        break;
      case ServiceProviderType.APPRAISER:
        queries.push(where('appraiserId', '==', providerId));
        break;
      case ServiceProviderType.CAR_RENTAL:
        queries.push(where('carRentalId', '==', providerId));
        break;
      case ServiceProviderType.PAINT_SHOP:
        queries.push(where('paintShopId', '==', providerId));
        break;
      case ServiceProviderType.TOWING_SERVICE:
        queries.push(where('towingServiceId', '==', providerId));
        break;
      default:
        break;
    }
  }
  queries.push(orderBy('createdAt', 'desc'));
  const q = query(collection(firebaseFirestore, COLLECTION_DAMAGE), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: DamageModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new DamageModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getServiceTaskSnapInfo = (onSuccess: (list: ServiceTaskModel[]) => void, serviceProviderId: string = "") => {
  const queries: QueryConstraint[] = [];
  // if (serviceProviderId !== "lawyer") {
  //   queries.push(where('serviceProviderId', '==', serviceProviderId));
  // }
  queries.push(where('serviceProviderId', '==', serviceProviderId));
  queries.push(orderBy('createdAt', "desc"));
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_TASK), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: ServiceTaskModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new ServiceTaskModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getServiceAdviserSnapInfo = (workshopId: string, onSuccess: (list: ServiceAdviserModel[]) => void) => {
  const queries: QueryConstraint[] = [];
  if (workshopId !== "") {
    queries.push(where('workshopId', '==', workshopId));
  }
  queries.push(where('deletedAt', '==', null));
  queries.push(orderBy('createdAt', "desc"));
  const q = query(collection(firebaseFirestore, COLLECTION_SERVICE_ADVISER), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: ServiceAdviserModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new ServiceAdviserModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getRepairPlanDocTaskSnapInfo = (onSuccess: (list: RepairPlanDocModel[]) => void, userId: string = "") => {
  const queries: QueryConstraint[] = [];
  if (userId !== "") {
    queries.push(where('userId', '==', userId));
  }
  queries.push(orderBy('createdAt', "desc"));
  const q = query(collection(firebaseFirestore, COLLECTION_REPAIR_PLAN_DOCS), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: RepairPlanDocModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new RepairPlanDocModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getMySnapInfo = (userId: string, onSuccess: (list: UserModel) => void) => {
  const q = query(collection(firebaseFirestore, COLLECTION_USERS), where('userId', '==', userId));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    if (!querySnapshot.empty && querySnapshot.size === 1) {
      querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
        onSuccess(new UserModel(documentSnapshot.data()));
      });
    }
  });
  return unsubscribe;
}

export const getAgentSnapInfo = (onSuccess: (list: AgentModel[]) => void) => {
  const queries: QueryConstraint[] = [];
  queries.push(where('deletedAt', '==', null));
  queries.push(orderBy('createdAt', 'desc'));
  const q = query(collection(firebaseFirestore, COLLECTION_AGENT), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: AgentModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new AgentModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getUserSnapInfo = (userId: string | undefined, onSuccess: (list: UserModel[]) => void) => {
  const queries: QueryConstraint[] = [];
  if (userId && userId !== "") {
    queries.push(where('userId', '==', userId));
  }
  queries.push(where('isDisabled', '==', false));
  queries.push(orderBy('createdAt', 'desc'));
  const q = query(collection(firebaseFirestore, COLLECTION_USERS), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: UserModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      const user = new UserModel(documentSnapshot.data());
      if (user.fullName || user.firstName || user.lastName) {
        list.push(new UserModel(documentSnapshot.data()));
      }
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getChatMessageSnapInfo = (chatRoomId: string, onSuccess: (list: ChatMessageModel[]) => void, lastCreatedAt?: Timestamp) => {
  const queries: QueryConstraint[] = [];
  queries.push(where('chatRoomId', '==', chatRoomId));
  if (lastCreatedAt) {
    queries.push(where('createdAt', '<', lastCreatedAt.toDate()));
  }
  queries.push(orderBy('createdAt', "desc"));
  queries.push(limit(CHAT_LIMIT));
  const q = query(collection(firebaseFirestore, COLLECTION_CHAT_MESSAGE), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: ChatMessageModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new ChatMessageModel(documentSnapshot.data()));
    });
    // Reverse array to show latest message at the bottom
    onSuccess(list.reverse());
  });
  return unsubscribe;
}

export const getChatRoomSnapInfo = (userId: string, onSuccess: (list: ChatRoomModel[]) => void, damageId = "common", isAdmin?: boolean) => {
  const queries: QueryConstraint[] = [];
  if (!isAdmin) {
    queries.push(where('participants', 'array-contains', userId));
  }
  queries.push(where('damageId', '==', damageId));
  queries.push(where('deletedAt', '==', null));
  queries.push(orderBy('createdAt', "desc"));
  const q = query(collection(firebaseFirestore, COLLECTION_CHAT_ROOM), ...queries);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: ChatRoomModel[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      list.push(new ChatRoomModel(documentSnapshot.data()));
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getNotificationSnapInfo = (userId: string, onSuccess: (list: NotificationModel[]) => void) => {
  // Get notifications with in 3 months
  const q = query(collection(firebaseFirestore, COLLECTION_NOTIFICATION),
    where('receiverId', '==', userId),
    where('createdAt', '>', new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000)),
    orderBy('createdAt', "desc"),
  );
  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const list: NotificationModel[] = [];
    querySnapshot.forEach(async (documentSnapshot) => {
      const notificationData = new NotificationModel(documentSnapshot.data());
      list.push(notificationData);
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getWorkshopFilesSnapInfo = (workshopId: string, onSuccess: (list: FileInfo[]) => void) => {
  const q = query(collection(firebaseFirestore, COLLECTION_WORKSHOP_FILES), where('workshopId', '==', workshopId));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const list: FileInfo[] = [];
    querySnapshot.forEach((documentSnapshot: { data: () => Record<string, any>; }) => {
      const data = documentSnapshot.data();
      if (data.files && data.files.length > 0) {
        data.files.forEach((file: FileInfo) => {
          list.push({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: file.uploadedAt,
            uploadedBy: file.uploadedBy,
            url: file.url,
          });
        });
      }
    });
    onSuccess(list);
  });
  return unsubscribe;
}

export const getChatUnreadCount = async (chatRoomId: string, userId: string, lastReadAt?: Timestamp) => {
  try {
    const queries: QueryConstraint[] = [];
    queries.push(where('chatRoomId', '==', chatRoomId));
    if (lastReadAt) {
      queries.push(where('createdAt', '>', lastReadAt.toDate()));
    }
    const querySnapshot = await getDocs(query(collection(firebaseFirestore, COLLECTION_CHAT_MESSAGE), ...queries));
    return querySnapshot.size;
  } catch (error) {
    return 0;
  }
}

export const getAppraiserInfoByProviderId = async (providerId: string) => {
  try {
    const q = query(collection(firebaseFirestore, COLLECTION_APPRAISER_INFO), where('appraiserId', '==', providerId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const list: AppraiserInfoModel[] = [];
    querySnapshot.forEach(documentSnapshot => {
      list.push(new AppraiserInfoModel(documentSnapshot.data()));
    });
    if (list.length > 0) return list[0];
    return null;
  } catch (error) {
    return null;
  }
}

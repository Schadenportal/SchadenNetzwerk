import { useMemo, useState, ReactNode, useEffect, useContext, useCallback, createContext } from "react";

import { useAuthContext } from "src/auth/hooks";
import WorkshopModel from "src/models/WorkshopModel";
import { PROVIDER_ROLES } from "src/constants/viewConstants";
import ServiceProviderModel from "src/models/ServiceProviderModel";
import { searchWorkshop, getServiceByUserId } from "src/services/firebase/firebaseFirestore";

import { UserRole } from "src/types/enums";

type Props = {
  children: ReactNode;
}

const DataProviderContext = createContext<{
  workshopInfo: WorkshopModel[];
  serviceProvider?: ServiceProviderModel;
}>({
  workshopInfo: [],
  serviceProvider: undefined
});

const useMainData = () => useContext(DataProviderContext);

const MainDataProvider = ({ children }: Props) => {
  const { user } = useAuthContext();
  const [workshops, setWorkshops] = useState<WorkshopModel[]>([]);
  const [serviceProvider, setServiceProvider] = useState<ServiceProviderModel | undefined>(undefined);

  const getWorkshops = useCallback(async () => {
    const workshopList = await searchWorkshop({ name: "", email: "", city: "" });
    if (user && [...PROVIDER_ROLES, UserRole.Owner].includes(user.role)) {
      const { workshopIds } = user;
      setWorkshops(workshopList.filter((workshop) => workshopIds.includes(workshop.workshopId)));
    } else {
      setWorkshops(workshopList);
    }
  }, [user]);

  const getServiceProviderInfo = useCallback(async () => {
    if (!user) {
      return;
    }
    const providers = await getServiceByUserId(user.userId);
    if (providers && providers.length > 0) {
      setServiceProvider(providers[0]);
    } else {
      setServiceProvider(undefined);
    }
  }, [user]);


  useEffect(() => {
    getWorkshops();
    getServiceProviderInfo();
  }, [getServiceProviderInfo, getWorkshops]);

  const contextValue = useMemo(
    () => ({
      workshopInfo: workshops,
      serviceProvider
    }),
    [serviceProvider, workshops]);

  return (
    <DataProviderContext.Provider value={contextValue}>{children}</DataProviderContext.Provider>
  )
}

export { useMainData, MainDataProvider }

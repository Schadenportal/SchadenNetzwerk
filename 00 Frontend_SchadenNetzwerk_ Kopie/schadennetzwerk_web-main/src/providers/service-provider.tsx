import { useMemo, useState, ReactNode, useContext, useCallback, createContext } from "react";

import ServiceProviderModel from "src/models/ServiceProviderModel";

type Props = {
  children: ReactNode;
}

const ServiceProviderContext = createContext<{
  setServiceProviderInfo: (info: ServiceProviderModel) => void;
  serviceProviderInfo: ServiceProviderModel;
}>({
  setServiceProviderInfo: () => { },
  serviceProviderInfo: new ServiceProviderModel({})
});
const useServiceProviderInfo = () => useContext(ServiceProviderContext);

const ServiceProvider = ({ children }: Props) => {
  const [docData, setDocData] = useState<ServiceProviderModel>(new ServiceProviderModel({}));

  const setServiceProviderInfo = useCallback((info: ServiceProviderModel) => {
    setDocData(info);
  }, []);

  const contextValue = useMemo(
    () => ({
      setServiceProviderInfo,
      serviceProviderInfo: docData,
    }),
    [docData, setServiceProviderInfo]);

  return (
    <ServiceProviderContext.Provider value={contextValue}>{children}</ServiceProviderContext.Provider>
  )
}

export { ServiceProvider, useServiceProviderInfo }

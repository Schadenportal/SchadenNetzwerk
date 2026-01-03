import { useMemo, useState, ReactNode, useContext, useCallback, createContext } from "react";

type Props = {
  children: ReactNode;
}

const DocScanContext = createContext<{
  setDocInfo: (info: Record<string, any>) => void;
  docInfo: Record<string, any>;
}>({
  setDocInfo: () => { },
  docInfo: {}
});
const useDocScanData = () => useContext(DocScanContext);

const DocScanDataProvider = ({ children }: Props) => {
  const [docData, setDocData] = useState({});

  const setDocInfo = useCallback((info: Record<string, any>) => {
    setDocData(info);
  }, []);

  const contextValue = useMemo(
    () => ({
      setDocInfo,
      docInfo: docData,
    }),
    [docData, setDocInfo]);

  return (
    <DocScanContext.Provider value={contextValue}>{children}</DocScanContext.Provider>
  )
}

export { useDocScanData, DocScanDataProvider }

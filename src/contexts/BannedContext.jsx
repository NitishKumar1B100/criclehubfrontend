import { createContext, useContext, useState } from "react";

const BannedContext = createContext();

export const BannedProvider = ({ children }) => {
  const [selectedBanned, setSelectedBanned] = useState(null);

  return (
    <BannedContext.Provider value={{ selectedBanned, setSelectedBanned }}>
      {children}
    </BannedContext.Provider>
  );
};

export const useBanned = () => useContext(BannedContext);

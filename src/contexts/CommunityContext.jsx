import { createContext, useContext, useState } from "react";

const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const [selectedCommunity, setSelectedCommunity] = useState({id:'', name:''});

  return (
    <CommunityContext.Provider value={{ selectedCommunity, setSelectedCommunity }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => useContext(CommunityContext);

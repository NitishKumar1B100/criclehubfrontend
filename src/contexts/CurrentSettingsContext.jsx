import { createContext, useContext, useState } from "react";

const CurrentSetting = createContext();

export const CurrentSettingsProvider = ({ children }) => {
  const [selectedCurrentSettings, setSelectedCurrentSettings] = useState({type:'account'});

  return (
    <CurrentSetting.Provider value={{ selectedCurrentSettings, setSelectedCurrentSettings }}>
      {children}
    </CurrentSetting.Provider>
  );
};

export const useCurrentSettings = () => useContext(CurrentSetting);

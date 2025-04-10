import { createContext, useState, useContext } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [activeOption, setActiveOption] = useState("friends");
  return (
    <DashboardContext.Provider value={{ activeOption, setActiveOption }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);


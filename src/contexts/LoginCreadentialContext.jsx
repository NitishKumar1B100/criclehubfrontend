import { createContext, useContext, useState } from "react";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [LoginData, setLoginData] = useState(null);

  return (
    <LoginContext.Provider value={{ LoginData, setLoginData}}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);

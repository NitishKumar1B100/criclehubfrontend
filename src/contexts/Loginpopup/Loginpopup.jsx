import { createContext, useContext, useState } from "react";

const LoginPupUpContext = createContext();

export const LoginPopUpProvider = ({ children }) => {
  const [LoginPopUp, setLoginPopUp] = useState(true);


  return (
    <LoginPupUpContext.Provider value={{ LoginPopUp, setLoginPopUp }}>
      {children}
    </LoginPupUpContext.Provider>
  );
};

export const useLoginPopUp = () => useContext(LoginPupUpContext);

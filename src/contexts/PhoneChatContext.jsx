import { createContext, useContext, useState } from "react";

const PhoneChat = createContext();

export const PhoneChatProvider = ({ children }) => {
  const [selectedPhoneChat, setSelectedPhoneChat] = useState(false);

  return (
    <PhoneChat.Provider value={{ selectedPhoneChat, setSelectedPhoneChat }}>
      {children}
    </PhoneChat.Provider>
  );
};

export const usePhoneChat = () => useContext(PhoneChat);

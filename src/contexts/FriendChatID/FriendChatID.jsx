import { createContext, useContext, useState } from "react";

const FriendChatIdContext = createContext();

export const FreindChatIdProvider = ({ children }) => {
  const [FreindChatId, setFreindChatId] = useState('');
  
  return (
    <FriendChatIdContext.Provider value={{ FreindChatId, setFreindChatId}}>
      {children}
    </FriendChatIdContext.Provider>
  );
};

export const useFreindChatId = () => useContext(FriendChatIdContext);

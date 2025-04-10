import { createContext, useContext, useState } from "react";

const FriendListContext = createContext();

export const FriendListProvider = ({ children }) => {
  const [FriendList, setFriendList] = useState([]);
  
  return (
    <FriendListContext.Provider value={{ FriendList, setFriendList}}>
      {children}
    </FriendListContext.Provider>
  );
};

export const useFriendList = () => useContext(FriendListContext);

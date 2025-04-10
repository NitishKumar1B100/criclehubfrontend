import { createContext, useContext, useState } from "react";

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
  const [selectedFriend, setSelectedFriend] = useState({type: '', id: '', name:'', image:''});


  return (
    <FriendContext.Provider value={{ selectedFriend, setSelectedFriend }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => useContext(FriendContext);

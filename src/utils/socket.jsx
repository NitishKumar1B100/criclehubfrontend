import { io } from "socket.io-client";

let roomSocket = null;
let chatSocket = null;

export const getRoomSocket = () => {
  if (!roomSocket) {
    roomSocket = io(`${import.meta.env.VITE_BASE_URL}/rooms`, {
      transports: ["websocket"],
    });
  }
  return roomSocket;
};

export const getChatSocket = () => {
  if (!chatSocket) {
    chatSocket = io(`${import.meta.env.VITE_BASE_URL}/chat`, {
      transports: ["websocket"],
    });
  }
  return chatSocket;
};

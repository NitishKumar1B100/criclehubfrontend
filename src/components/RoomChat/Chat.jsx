import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import AgoraRTC from "agora-rtc-sdk-ng";
import { IoChatbubblesSharp } from "react-icons/io5";
import { getChatSocket } from "../../utils/socket";

import RoomPeople from "./RoomPeople";
import RoomFeatures from "./RoomFeatures";
import Inbox from "./Inbox";
import Loadingscreen from "../LoadingScr/Loadingscreen";
import VideoCall from "./VideoCall";
import { flushSync } from "react-dom";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

function Chat({ roomId, userId, roomInfo, currentUserInfo }) {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [usersJoined, setUsersJoined] = useState([]);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [roomToken, setRoomToken] = useState(null);
  const [tracks, setTracks] = useState({ mic: null, cam: null });
  const [remoteTracks, setRemoteTracks] = useState({});
  const [localAudioEnabled, setLocalAudioEnabled] = useState(false);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(false);

  const agoraClientRef = useRef(null);
  const socket = getChatSocket();
  const navigate = useNavigate();

  const joinRoom = () => {
    const payload = {
      uid: userId.uid,
      roomId,
      userDetails: {
        name: currentUserInfo.name,
        image: currentUserInfo.img,
        uid: userId.uid,
      },
    };
    socket.connect();
    socket.emit("join_room", payload);
  };

  const leaveAgoraSession = async () => {
    try {
      if (tracks.cam) {
        tracks.cam.stop();
        tracks.cam.close();
        await agoraClientRef.current.unpublish(tracks.cam);
        setLocalVideoEnabled(false);
      }
      if (tracks.mic) {
        tracks.mic.stop();
        tracks.mic.close();
        await agoraClientRef.current.unpublish(tracks.mic);
        setLocalAudioEnabled(false);
      }
      await agoraClientRef.current?.leave();
      setRoomToken(null);
    } catch (error) {
      toast.error("Error disconnecting.");
    }
  };

  useEffect(() => {
    if (!socket || !userId || !roomId) return;

    joinRoom();

    socket.on("user_joined", ({ users, joinedUser, token }) => {
      setUsersJoined(users);
      setRoomToken(token);
      toast.info(`${joinedUser.name} joined.`);
    });

    socket.on("receive_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    socket.on("user_left", ({ users, message }) => {
      handleRoomDisconnect(users);
      setUsersJoined(users);
      toast.info(`${message} left.`);
    });

    return () => {
      socket.off("user_joined");
      socket.off("receive_message");
      socket.off("user_left");
    };
  }, [roomId, userId]);

  useEffect(() => {
    if (!roomToken) return;

    const initAgora = async () => {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      await client.join(APP_ID, roomId, roomToken, `${userId.uid}__${currentUserInfo.name}`);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        const [uid, displayName] = user.uid.split("__");

        setRemoteTracks((prev) => ({
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            videoTrack: mediaType === "video" ? user.videoTrack : prev[user.uid]?.videoTrack,
            displayName: displayName || `User ${uid}`,
          },
        }));

        if (mediaType === "audio" && user.audioTrack) user.audioTrack.play();
      });

      client.on("user-unpublished", (user, mediaType) => {
        setRemoteTracks((prev) => {
          const updated = { ...prev };
          if (updated[user.uid]) {
            if (mediaType === "video") updated[user.uid].videoTrack = null;
            if (mediaType === "audio") updated[user.uid].audioTrack = null;
          }
          return updated;
        });
      });
    };

    initAgora();

    return () => {
      leaveAgoraSession();
    };
  }, [roomToken]);

  const handleMicToggle = async () => {
    if (!agoraClientRef.current) return;
    if (localAudioEnabled) {
      tracks.mic?.stop();
      await agoraClientRef.current.unpublish(tracks.mic);
      setLocalAudioEnabled(false);
    } else {
      try {
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await agoraClientRef.current.publish([micTrack]);
        setTracks((prev) => ({ ...prev, mic: micTrack }));
        setLocalAudioEnabled(true);
      } catch {
        toast.error("Mic permission denied or error.");
      }
    }
  };

  const handleCamToggle = async () => {
    if (!agoraClientRef.current) return;
    if (localVideoEnabled) {
      tracks.cam?.stop();
      await agoraClientRef.current.unpublish(tracks.cam);
      setLocalVideoEnabled(false);
    } else {
      try {
        const camTrack = await AgoraRTC.createCameraVideoTrack();
        await agoraClientRef.current.publish([camTrack]);
        setTracks((prev) => ({ ...prev, cam: camTrack }));
        setLocalVideoEnabled(true);
      } catch {
        toast.error("Camera permission denied or error.");
      }
    }
  };

const handleRoomDisconnect = async (peoples) => {
  const amIStillHere = peoples.some(p => p.userDetails.uid === userId.uid);
  if (amIStillHere) return; // I'm still here, do nothing

  // I'm no longer in the room — disconnect
  socket.disconnect();
  setIsDisconnected(true);
  await leaveAgoraSession();
};


  const handleUserDisconnect = async () => {
    const remaining = usersJoined.filter(p => p.userDetails.uid !== userId.uid);
    setUsersJoined(remaining);
    socket.disconnect();
    setIsDisconnected(true);
    await leaveAgoraSession();
  };

  const rejoinRoom = () => {
    setIsDisconnected(false);
    joinRoom();
  };

  const sendMessage = (newMessage) => {
    if (!newMessage.trim()) return;

    socket.emit("send_message", {
      sender: {
        name: currentUserInfo.name,
        image: currentUserInfo.img,
        uid: userId.uid,
        time: new Date().toLocaleTimeString(),
      },
      roomId,
      message: newMessage,
    });
  };

  return (
    <div className="hidesilder w-full h-screen flex bg-gray-900 text-white p-2 rounded relative">
      {isDisconnected ? (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-[999]">
          <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
            <h2 className="text-xl font-bold mb-4">You have been disconnected</h2>
            <p className="text-gray-300 mb-4">Would you like to rejoin or go back?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate("/room")} className="bg-red-500 px-4 py-2 rounded">Back to Home</button>
              <button onClick={rejoinRoom} className="bg-blue-500 px-4 py-2 rounded">Rejoin Room</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full h-full flex-1 bg-gray-900 flex flex-col gap-1">
            <div className="w-full h-full flex flex-col items-center justify-end gap-1 relative">
              <div className="hidesilder w-full h-full overflow-y-auto ">
                {roomToken && usersJoined.length ? (
                  <VideoCall
                    roomId={roomId}
                    userId={userId}
                    cameraTrack={tracks.cam}
                    micTrack={tracks.mic}
                    remoteTracks={remoteTracks}
                    localVideoEnabled={localVideoEnabled}
                  />
                ) : (
                  <Loadingscreen />
                )}
              </div>

              <div className="w-full h-[170px] overflow-x-auto">
                <RoomPeople
                  LoginUser={userId}
                  peoples={usersJoined}
                  roomInfo={roomInfo}
                  roomId={roomId}
                  socket={socket}
                />
              </div>

              <div className="w-full h-[50px]">
                <RoomFeatures
                  handleUserDisconnect={handleUserDisconnect}
                  usersJoined={usersJoined}
                  handleMicToggle={handleMicToggle}
                  handleCamToggle={handleCamToggle}
                  isMicOn={localAudioEnabled}
                  isCamOn={localVideoEnabled}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsChatVisible(!isChatVisible)}
            className="cursor-pointer z-50 bottom-20 left-4 lg:hidden absolute bg-blue-500 p-2 rounded text-white"
          >
            <IoChatbubblesSharp size={25} />
          </button>

          <div className={`chat-panel ${isChatVisible ? "chat-panel-show" : "chat-panel-hide"}`}>
            <Inbox
              roomId={roomId}
              messages={messages}
              sendMessage={sendMessage}
              user={userId.uid}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;

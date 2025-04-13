import { useNavigate } from "react-router-dom";
import { getChatSocket } from "../../utils/socket";
import { useEffect, useRef, useState } from "react";
import RoomPeople from "./RoomPeople";
import RoomFeatures from "./RoomFeatures";
import { IoChatbubblesSharp } from "react-icons/io5";
import Inbox from "./Inbox";
import AgoraRTC from "agora-rtc-sdk-ng";
import Loadingscreen from "../LoadingScr/Loadingscreen";
import VideoCall from "./VideoCall";
import { toast } from "react-toastify";

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
  const navigate = useNavigate();
  const socket = getChatSocket();


  useEffect(() => {
    if (!socket || !userId || !roomId) return;

    const joinPayload = {
      uid: userId.uid,
      roomId,
      userDetails: {
        name: currentUserInfo.name,
        image: currentUserInfo.img,
        uid: userId.uid,
      },
    };

    socket.connect();
    socket.emit("join_room", joinPayload);

    socket.on("user_joined", ({ users, joinedUser, token }) => {
      setUsersJoined(users);
      setRoomToken(token);
      toast.info(`${joinedUser.name} Joined.`)
    });

    socket.on("receive_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    socket.on("user_left", ({ users , message}) => {
      handleRoomDisconnect(users);
      setUsersJoined(users);
      toast.info(`${message} left.`)
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

        setRemoteTracks((prev) => {
          const existing = prev[user.uid] || {};

          return {
            ...prev,
            [user.uid]: {
              ...existing,
              videoTrack: mediaType === "video" ? user.videoTrack : existing.videoTrack,
              displayName: displayName || `User ${uid}`,
            },
          };
        });

        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
        
        
      });


      client.on("user-unpublished", (user, mediaType) => {
        setRemoteTracks((prev) => {
          const updated = { ...prev };
          const userTrack = updated[user.uid];

          if (!userTrack) return prev;

          if (mediaType === "video") {
            userTrack.videoTrack = null;
          } else if (mediaType === "audio") {
            userTrack.audioTrack = null;
          }

          return {
            ...updated,
            [user.uid]: userTrack,
          };
        });
      });

    };

    initAgora();

    return () => {
      tracks?.mic?.stop(); tracks?.mic?.close();
      tracks?.cam?.stop(); tracks?.cam?.close();
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
       // micTrack.play(); // optionally play locally too
        setTracks((prev) => ({ ...prev, mic: micTrack }));
        setLocalAudioEnabled(true);
        
      } catch (err) {
        toast.error("Mic permission denied or error");
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
      } catch (err) {
        toast.error("Camera permission denied or error.");
      }
    }
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

  const handleRoomDisconnect = async (peoples) => {
    const isUserInRoom = peoples.some(
      (person) => person.userDetails.uid !== userId.uid
    );
    
    //console.log(isUserInRoom)
    
    if(!isUserInRoom) return 
    
    if (isUserInRoom) {
      socket.disconnect();
      setIsDisconnected(true);
    }

    try {
      if (tracks.cam) {
        tracks.cam.stop();
        tracks.cam.close();

        setLocalVideoEnabled(false)
        await agoraClientRef.current.unpublish(tracks.cam);
      }
      if (tracks.mic) {
        tracks.mic.stop();
        tracks.mic.close();

        setLocalAudioEnabled(false);
        await agoraClientRef.current.unpublish(tracks.mic);
      }

      if (agoraClientRef) {
        // setLocalAudioEnabled(false);
        // setLocalVideoEnabled(false)

        await agoraClientRef.current.leave();

        setRoomToken(null);
      }
    } catch (error) {
      toast.error("Error disconnecting.");
    }
  };

  const handleUserDisconnect = async () => {
    const remainingUsers = usersJoined.filter(
      (person) => person.userDetails.uid !== userId.uid
    );
    
    setUsersJoined(remainingUsers);
    socket.disconnect();
    setIsDisconnected(true);

    try {
      if (tracks.cam) {
        tracks.cam.stop();
        tracks.cam.close();
        setLocalVideoEnabled(false)
      }
      if (tracks.mic) {
        tracks.mic.stop();
        tracks.mic.close();
        setLocalAudioEnabled(false);
      }

      if (agoraClientRef) {
        // setLocalAudioEnabled(false);
        // setLocalVideoEnabled(false)

        await agoraClientRef.current.leave();
                setRoomToken(null);
      }
    } catch (error) {
      toast.error("Error disconnecting.");
    }
  };

  const rejoinRoom = () => {
    setIsDisconnected(false);
    socket.connect();
    socket.emit("join_room", {
      uid: userId.uid,
      roomId,
      userDetails: {
        name: currentUserInfo.name,
        image: currentUserInfo.img,
        uid: userId.uid,
      },
    });
  };

  const goBackToHome = () => navigate("/room");

  return (
    <div className="hidesilder w-full h-screen flex bg-gray-900 text-white p-2 rounded relative">
      <div className="w-full h-full flex-1 bg-gray-900 flex flex-col gap-1">
        <div className="w-full h-full flex flex-col items-center justify-end gap-1 relative">
          <div className="hidesilder w-full h-full overflow-y-auto">
            {roomToken && usersJoined.length ? (
              <VideoCall
                roomId={roomId}
                userId={userId}
                cameraTrack={tracks.cam}
                micTrack={tracks.mic}
                remoteTracks={remoteTracks}
              />
            ) : (
              <Loadingscreen />
            )}
          </div>

          <div className="w-full h-[170px] overflow-x-auto ">
            <RoomPeople LoginUser={userId} peoples={usersJoined}
             roomInfo={roomInfo} roomId={roomId} socket={socket}/>
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

      {isDisconnected && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
            <h2 className="text-xl font-bold mb-4">You have been disconnected</h2>
            <p className="text-gray-300 mb-4">Would you like to rejoin or go back?</p>
            <div className="flex justify-center gap-4">
              <button onClick={goBackToHome} className="bg-red-500 px-4 py-2 rounded">Back to Home</button>
              <button onClick={rejoinRoom} className="bg-blue-500 px-4 py-2 rounded">Rejoin Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;

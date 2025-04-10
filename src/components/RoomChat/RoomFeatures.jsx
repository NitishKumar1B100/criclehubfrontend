import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";

import Loadingscreen from "../LoadingScr/Loadingscreen";

function RoomFeatures({
  handleUserDisconnect,
  usersJoined,
  handleMicToggle,
  handleCamToggle,
  isCamOn,
  isMicOn }) {
    
  return (
    <div className="w-full h-full">
      {usersJoined.length ? (
        <div className="flex justify-center gap-4 p-1 bg-gray-800 rounded-lg">

          {/* Mic Button */}
          <button
            onClick={handleMicToggle}
            className="cursor-pointer p-3 rounded-full text-white bg-gray-700 hover:bg-gray-600 transition"
          >
            {isMicOn ? (
              <FaMicrophone size={24} />
            ) : (
              <FaMicrophoneSlash size={24} className="text-red-500" />
            )}
          </button>

          {/* Video Button */}
          <button
            onClick={handleCamToggle}
            className="cursor-pointer p-3 rounded-full text-white bg-gray-700 hover:bg-gray-600 transition"
          >
            {isCamOn ? (
              <FaVideo size={24} />
            ) : (
              <FaVideoSlash size={24} className="text-red-500" />
            )}
          </button>

          {/* Hang-up Button */}
          <button
            className="cursor-pointer p-3 rounded-full bg-red-600 text-white hover:bg-red-500 transition"
            onClick={handleUserDisconnect}
          >
            <FaPhoneSlash size={24} />
          </button>
        </div>
      ) : (<Loadingscreen />)}
    </div>
  );
}

export default RoomFeatures;

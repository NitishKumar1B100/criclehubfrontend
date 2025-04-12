import { useState } from "react";
import RoomFullNotice from "./RoomFullNotice ";

const ClickToStart = ({ roomData, currentUserInfo, children }) => {
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
  };

  if (started) return <>{children}</>;
  
  if(roomData.room.joinedUsers.length >= roomData.room.size) return <RoomFullNotice/>
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
      <div className="bg-gray-700 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
        <img
          src={currentUserInfo.img}
          alt="User"
          className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-indigo-500"
        />
        <h2 className="text-xl font-semibold text-gray-200">Welcome, {currentUserInfo.name} 👋</h2>
        <p className="text-gray-300">Click below to start</p>
        <button
          onClick={handleStart}
          className="cursor-pointer mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition"
        >
          Click to Start
        </button>
      </div>
    </div>
  );
};

export default ClickToStart;

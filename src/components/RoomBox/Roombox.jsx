import { useEffect, useState } from 'react'
import { CiCircleInfo } from "react-icons/ci";
import { useLoginPopUp } from '../../contexts/Loginpopup/Loginpopup';
import { useLogin } from '../../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';

const Roombox = ({ roomData }) => {
  const [members, setMembers] = useState([])
  const { setLoginPopUp } = useLoginPopUp()
  const { LoginData } = useLogin()

  const openRoomWindow = () => {
    if (LoginData === null) {
      setLoginPopUp(true)
      return
    }
    const roomId = roomData.id
    if (!roomId) {
      toast.error("Room ID is required in the URL.");
      return;
    }
    const url = `/room/${roomId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    setMembers(roomData.room.joinedUsers);
  }, [roomData])

  return (
    <div className="bg-gray-700 w-full h-[350px] rounded-lg shadow-lg overflow-hidden
      room-boxes">
      {/* Room Header */}
      <div className="w-full h-[45px] flex items-center justify-between px-4 border-b border-[#ffffff90]">
        <span className='text-[#ffffffd5] font-bold'>Topic:</span>
        <p className='text-[#ffffff91]'> {roomData.room.topic}</p>
        <button className='text-2xl text-white cursor-pointer'>
          <CiCircleInfo />
        </button>
      </div>

      {/* People in the Room */}
      <div className="hidesilder w-full h-[calc(100%-100px)] overflow-y-auto p-4">
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="relative">
                <img
                  src={`${member.userDetails.image}?w=50&h=50&fit=crop&crop=faces`}
                  alt={member.userDetails.name}
                  className="w-10 h-10 rounded-full"
                />

              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{member.userDetails.name}</span>
                  {roomData.room.owner === member.uid && (
                    <span className="text-xs text-blue-300 bg-blue-900 px-2 py-1 rounded-full">Host</span>
                  )}
                </div>
                {/* <p className="text-sm text-gray-300 capitalize">{member.role}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Button */}
      <div className="w-full h-[54px]">
        <button
          onClick={() => openRoomWindow()}
          className='w-full h-full cursor-pointer bg-blue-600 text-white text-[18px] rounded-b-lg hover:bg-blue-700 transition-colors'>
          Join the Group
        </button>
      </div>
    </div>
  );
};


export default Roombox
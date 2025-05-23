import { useEffect, useState } from 'react'
import { CiCircleInfo } from "react-icons/ci";
import { useLoginPopUp } from '../../contexts/Loginpopup/Loginpopup';
import { useLogin } from '../../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Loadingscreen from '../LoadingScr/Loadingscreen';

const Roombox = ({ roomData, roomInfoShow, SetRoomInfoSHow }) => {
  const [members, setMembers] = useState([]);
  const { setLoginPopUp } = useLoginPopUp();
  const { LoginData } = useLogin();

  const [ownerInfo, setOwnerInfo] = useState({ name: '', img: '' })
  const [loadownerInfo, setLoadingOwnerInfo] = useState(false)

  const openRoomWindow = () => {
    if (LoginData === null) {
      setLoginPopUp(true);
      return;
    }

    const roomId = roomData.id;
    if (!roomId) {
      toast.error("Room ID is required in the URL.");
      return;
    }

    const url = `/room/${roomId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    setMembers(roomData.room.joinedUsers);
  }, [roomData]);

  const handleShowOnwerInfo = async () => {
    
    SetRoomInfoSHow(prev => prev === roomData.id ? '' : roomData.id)
    setLoadingOwnerInfo(true)
    
    const docRef = doc(db, "users", roomData.createdBy.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data()
      setOwnerInfo(prev => ({
        ...prev,
        img: data.image,
        name: data.name
      }));
    } else {
      toast.error('User not exist.')
    }
    
    setLoadingOwnerInfo(false)
  }

  const isFull = members.length >= roomData.room.size;
  const isOwner = LoginData && roomData.room.owner === LoginData.uid;

  return (
    <div
      className={`w-full h-[350px] rounded-lg shadow-lg overflow-hidden room-boxes 
    ${isOwner ? 'border-2 border-blue-600' : 'bg-gray-700'} 
    ${isFull ? 'hover:border-red-600 border-2' : ''}`}
    >

      {/* Room Header */}
      <div className={`w-full h-[45px] flex items-center justify-between px-4 border-b border-[#ffffff90] relative`}>
        <div className="flex items-center justify-start gap-2">
          <span className='text-[#ffffffd5] font-bold'>Topic:</span>
          <p className='text-[#ffffff91]'> {roomData.room.topic}</p>
        </div>
        <button className='text-2xl text-white cursor-pointer' onClick={handleShowOnwerInfo}>
          <CiCircleInfo />
        </button>

        {roomInfoShow === roomData.id && (
          <div className="absolute top-7 right-8 z-50 bg-gray-800 text-white rounded-xl shadow-lg p-4 w-64 sm:w-72 transition-all">
            {
              loadownerInfo ? (<Loadingscreen/>): (<div className="flex flex-col items-center text-center space-y-3">

                {/* Creator Info */}
                <h4 className="text-sm font-semibold text-gray-300">Created By</h4>
                <img
                  src={ownerInfo.img}
                  alt={ownerInfo.name}
                  className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
                />
                <p className="text-base font-medium">{ownerInfo.name}</p>
  
                {/* Divider */}
                <hr className="w-full border-gray-600" />
  
                {/* Creation Time */}
                <h4 className="text-sm font-semibold text-gray-300">Created At</h4>
                <p className="text-xs text-gray-400">{roomData.createdAt}</p>
              </div>)
            }
          </div>
        )}

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
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs text-blue-300 bg-blue-900 px-2 py-1 rounded-full">Host</span>
                      {roomData.room.owner === LoginData.uid && <span className='text-white'>You</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Button */}
      <div className={`w-full h-[58px]`}>
        {
          isFull ? (
            <button
              className={`w-full h-full text-white text-[18px] hover:text-red-600
               bg-gray-800 rounded-b-lg cursor-not-allowed `}
              disabled
            >
              Room is Full
            </button>
          ) : (
            <button
              onClick={openRoomWindow}
              className={`w-full h-full text-white text-[18px]
              bg-blue-600 rounded-b-lg cursor-pointer`}>
              Join the Room
            </button>
          )
        }
      </div>
    </div>
  );
};

export default Roombox;

import { useEffect, useState } from 'react'
import { CiCircleInfo } from "react-icons/ci";
import { useLoginPopUp } from '../../contexts/Loginpopup/Loginpopup';
import { useLogin } from '../../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Loadingscreen from '../LoadingScr/Loadingscreen';
import { MdPeopleAlt } from "react-icons/md";

const Roombox = ({ roomData, roomInfoShow, SetRoomInfoSHow }) => {

  const [members, setMembers] = useState([]);
  const { setLoginPopUp } = useLoginPopUp();
  const { LoginData } = useLogin();

  const [ownerInfo, setOwnerInfo] = useState({ name: '', img: '' })
  const [loadownerInfo, setLoadingOwnerInfo] = useState(false)

  const openRoomWindow = () => {
    if (!LoginData) {
      setLoginPopUp(true);
      return;
    }
    window.open(`/room/${roomData.id}`, '_blank', 'noopener,noreferrer');
  };

  const onDelete = async (roomId) => {
    if (!LoginData) return;

    if (roomData.room.owner !== LoginData.uid) {
      toast.error("Only owner can delete this room");
      return;
    }

    const confirmDelete = window.confirm("Delete this room permanently?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "rooms", roomId));
      toast.success("Room deleted");
      SetRoomInfoSHow('');
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  useEffect(() => {
    setMembers(roomData.room.joinedUsers || []);
  }, [roomData]);

  const handleShowOnwerInfo = async () => {
    SetRoomInfoSHow(prev => prev === roomData.id ? '' : roomData.id)
    setLoadingOwnerInfo(true)

    try {
      const docRef = doc(db, "users", roomData.createdBy.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setOwnerInfo({ img: data.image, name: data.name });
      } else {
        toast.error('User not found');
      }
    } catch {
      toast.error("Failed to load owner info");
    }

    setLoadingOwnerInfo(false)
  };

  const isFull = members.length >= roomData.room.size;
  const isOwner = LoginData && roomData.room.owner === LoginData.uid;

  return (
    <div
      className={`w-full h-[350px] rounded-lg shadow-lg overflow-hidden
      ${isOwner ? 'border-2 border-blue-600' : 'bg-gray-700'}
      ${isFull ? 'border-2 border-red-600' : ''}`}
    >

      {/* HEADER */}
      <div className="w-full h-[45px] flex items-center justify-between px-4 border-b border-[#ffffff90] relative">
        <div className="flex gap-2">
          <span className="text-white font-bold">Topic:</span>
          <span className="text-white/70">{roomData.room.topic}</span>
        </div>

        <button onClick={handleShowOnwerInfo} className="text-2xl text-white">
          <CiCircleInfo />
        </button>

        {roomInfoShow === roomData.id && (
          <div className="absolute top-7 right-8 z-50 w-64 bg-gray-800 rounded-2xl shadow-xl p-4">
            {loadownerInfo ? <Loadingscreen /> : (
              <div className="flex flex-col gap-3">

                <div className="flex items-center gap-3">
                  <img
                    src={ownerInfo.img}
                    alt={ownerInfo.name}
                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                  />
                  <div>
                    <p className="text-[10px] text-gray-400">Created By</p>
                    <p className="text-sm font-semibold text-white">{ownerInfo.name}</p>
                  </div>
                </div>

                <hr className="border-gray-700" />

                <div>
                  <p className="text-[10px] text-gray-400">Created At</p>
                  <p className="text-xs text-gray-300">{roomData.createdAt}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `https://circlehub-4520b.web.app/room/${roomData.id}`
                      )
                    }
                    className="flex-1 text-xs py-1.5 rounded-lg bg-blue-600"
                  >
                    Copy Link
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => onDelete(roomData.id)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* MEMBERS */}
      <div className="h-[calc(100%-90px)] overflow-y-auto p-4 space-y-3">
        {members.map((member, index) => (
          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-600">
            <img
              src={member.userDetails.image}
              alt={member.userDetails.name}
              className="w-10 h-10 rounded-full"
            />
            <span className="text-white">{member.userDetails.name}</span>
            {member.uid === roomData.room.owner && (
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                Host
              </span>
            )}
          </div>
        ))}
      </div>

      {/* JOIN */}
      <div className="relative">
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-1 text-white">
          <MdPeopleAlt size={18} />
          <span>{roomData.room.size}</span>
        </div>

        <button
          onClick={!isFull ? openRoomWindow : undefined}
          disabled={isFull}
          className={`w-full h-[48px] text-white text-lg rounded-b-lg
            ${isFull ? 'bg-gray-800 cursor-not-allowed' : 'bg-blue-600'}`}
        >
          {isFull ? 'Room is Full' : 'Join the Room'}
        </button>
      </div>

    </div>
  );
};

export default Roombox;

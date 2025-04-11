import { useState, useEffect } from 'react';
import CreateRoom from '../components/CreateRoomPopUp';
import Roombox from '../components/RoomBox/Roombox';
import { getRoomSocket } from '../utils/socket';
import { useLoginPopUp } from '../contexts/Loginpopup/Loginpopup';
import { useLogin } from '../contexts/LoginCreadentialContext';
import Loadingscreen from '../components/LoadingScr/Loadingscreen';
import { toast } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
function Rooms() {
  const [formPopUp, setFormPopUp] = useState(false);
  const [rooms, setRooms] = useState([]); // Store rooms from Firestore
  const { setLoginPopUp } = useLoginPopUp()
  const { LoginData } = useLogin()
  const [LoadingRooms, setLoadingRooms] = useState(true)

  

  useEffect(() => {
    if (!LoginData) {
      setLoadingRooms(false);
      return; // Prevent running socket code if LoginData is null
    }

    const socket = getRoomSocket();
  
    const handleRoomList = (rooms) => {
      try {
        setRooms(rooms);
      } catch (err) {
        toast.error("Failed to update room list.");
      } finally {
        setLoadingRooms(false);
      }
    };
  
    const checkUserExist = async () => {
      try {
        if (!LoginData || !LoginData.uid) {
          toast.error("User data is missing. Please login again.");
          return false;
        }
  
        const docRef = doc(db, "users", LoginData.uid);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          toast.error("User not found in database. Please relogin.");
          return false;
        }
  
        return true;
      } catch (err) {
        toast.error("Error verifying user. Try again later.");
        return false;
      }
    };
  
    const setupSocket = async () => {
      const userIsValid = await checkUserExist();
      if (!userIsValid) {
        setLoadingRooms(false);
        return; // Do not proceed if user is invalid
      }
  
      try {
        socket.on("roomList", handleRoomList);
        socket.emit("getRoomList");
      } catch (err) {
        toast.error("Failed to connect to server.");
        setLoadingRooms(false);
      }
    };
  
    setupSocket();
  
    return () => {
      try {
        socket.off("roomList", handleRoomList);
      } catch (err) {
        toast.error("Socket cleanup error:", err)
      }
    };
  }, [LoginData]); // Ensure LoginData is in the dependency list
  
  

  const handleCreatingRoom = () => {
    try {
      if (!LoginData) {
        setLoginPopUp(true);
        return;
      }
      setFormPopUp(true);
    } catch (err) {
      toast.error("Something went wrong while creating a room.");
    }
  };
  

  return (
    <div className='w-screen h-[calc(100vh-60px)] bg-gray-900'>
      <div className="w-full h-full">
        <div className="w-[100%] h-[calc(100vh-60px)]">

          <div className="w-full h-[80px] flex justify-start items-center p-2">
            <div className="w-[100px] h-[50px] flex gap-3 text-white text-[19px]">
              <button
                onClick={handleCreatingRoom}
                className='w-full h-full cursor-pointer bg-blue-700 rounded'>Create</button>
            </div>
          </div>
          {/* Room List */}
          <div className="w-full h-[calc(100vh-180px)]">
            {
              LoadingRooms ? (<Loadingscreen />) : (
                <div className="hidesilder w-full h-full overflow-auto gap-5 flex flex-wrap items-start justify-start p-2">
                  {rooms.map((room) => (
                    <Roombox key={room.id} roomData={room} />
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {formPopUp && (
        <div className="w-screen h-screen absolute top-0 left-0 bg-[#00000272]">
          <CreateRoom setFormPopUp={setFormPopUp} />
        </div>
      )}
    </div>
  );
}

export default Rooms;
import { useState, useEffect } from 'react';
import CreateRoom from '../components/CreateRoomPopUp';
import Roombox from '../components/RoomBox/Roombox';
import { getRoomSocket } from '../utils/socket';
import { useLoginPopUp } from '../contexts/Loginpopup/Loginpopup';
import { useLogin } from '../contexts/LoginCreadentialContext';
import Loadingscreen from '../components/LoadingScr/Loadingscreen';
function Rooms() {
  const [formPopUp, setFormPopUp] = useState(false);
  const [rooms, setRooms] = useState([]); // Store rooms from Firestore
  const { setLoginPopUp } = useLoginPopUp()
  const { LoginData } = useLogin()

  const [LoadingRooms, setLoadingRooms] = useState(true)


  useEffect(() => {
    const socket = getRoomSocket()
    const handleRoomList = (rooms) => {
      setRooms(rooms);
      setLoadingRooms(false)
    };

    socket.on("roomList", handleRoomList);

    // ✨ Ask server to send room list again (in case it's a re-entry)
    socket.emit("getRoomList");

    return () => {
      socket.off("roomList", handleRoomList);
    };
  }, []);

  const handleCreatingRoom = () => {
    if (LoginData === null) {
      setLoginPopUp(true)
      return
    }
    setFormPopUp(true);
  }

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
        <div className="w-screen h-screen absolute top-0 bg-[#00000272]">
          <CreateRoom setFormPopUp={setFormPopUp} />
        </div>
      )}
    </div>
  );
}

export default Rooms;




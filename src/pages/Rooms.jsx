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
  const [rooms, setRooms] = useState([]);
  const [LoadingRooms, setLoadingRooms] = useState(true);

  const [roomInfoShow, SetRoomInfoSHow] = useState('');

  const [searchTopic, setSearchTopic] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); 

  const { setLoginPopUp } = useLoginPopUp();
  const { LoginData } = useLogin();

  useEffect(() => {
    if (!LoginData) {
      setLoadingRooms(false);
      return;
    }

    const socket = getRoomSocket();

    const handleRoomList = (roomList) => {
      try {
        const sortedByOwner = [...roomList].sort((a, b) => {
          const aOwner = a.room.owner === LoginData.uid;
          const bOwner = b.room.owner === LoginData.uid;
          return bOwner - aOwner;
        });

        setRooms(sortedByOwner);
      } catch {
        toast.error("Failed to update room list");
      } finally {
        setLoadingRooms(false);
      }
    };

    const checkUserExist = async () => {
      try {
        const snap = await getDoc(doc(db, "users", LoginData.uid));
        return snap.exists();
      } catch {
        return false;
      }
    };

    const setupSocket = async () => {
      const valid = await checkUserExist();
      if (!valid) {
        toast.error("User verification failed");
        setLoadingRooms(false);
        return;
      }

      socket.on("roomList", handleRoomList);
      socket.emit("getRoomList");
    };

    setupSocket();

    return () => {
      socket.off("roomList", handleRoomList);
    };
  }, [LoginData]);

  const handleCreatingRoom = () => {
    if (!LoginData) {
      setLoginPopUp(true);
      return;
    }
    setFormPopUp(true);
  };

  /* FILTER + SORT (FINAL LOGIC) */
  const filteredAndSortedRooms = [...rooms]
    // SEARCH BY TOPIC
    .filter(room =>
      room.room.topic
        .toLowerCase()
        .includes(searchTopic.toLowerCase())
    )
    // OWN ROOMS FILTER
    .filter(room => {
      if (sortOrder !== 'own') return true;
      return LoginData && room.room.owner === LoginData.uid;
    })
    // SORT BY MEMBERS
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.room.joinedUsers.length - b.room.joinedUsers.length;
      }

      if (sortOrder === 'desc') {
        return b.room.joinedUsers.length - a.room.joinedUsers.length;
      }

      return 0; // none | own → keep current order
    });

  return (
    <div className="w-screen h-[calc(100vh-60px)] bg-gray-900">
      <div className="w-full h-full flex flex-col">

        {/* TOP BAR */}
        <div className="w-full h-[60px] flex items-center px-3  md:justify-center">

          <button
            onClick={handleCreatingRoom}
            className="h-[45px] px-4 bg-blue-700 text-white rounded-tl-md rounded-bl-md cursor-pointer hover:bg-blue-600 transition-flex items-center justify-center"
          >
            Create
          </button>

          <input
            type="text"
            placeholder="Search topic"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            className="w-[60%] h-[45px] px-3 bg-gray-800 text-white text-sm outline-none"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-[45px] px-3 bg-gray-700 text-white text-sm border-none outline-none rounded-tr-md rounded-br-md"
          >
            <option value="none">No Sort</option>
            <option value="asc">Members ↑</option>
            <option value="desc">Members ↓</option>
            <option value="own">Own Rooms</option>
          </select>

        </div>

        {/* ROOMS */}
        <div className="w-full h-[calc(100vh-120px)]">
          {LoadingRooms ? (
            <Loadingscreen />
          ) : (
            <div className="hidesilder w-full lg:w-[80%] h-full overflow-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 p-3">
              {filteredAndSortedRooms.map(room => (
                <Roombox
                  key={room.id}
                  roomData={room}
                  roomInfoShow={roomInfoShow}
                  SetRoomInfoSHow={SetRoomInfoSHow}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {formPopUp && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <CreateRoom setFormPopUp={setFormPopUp} />
        </div>
      )}
    </div>
  );
}

export default Rooms;

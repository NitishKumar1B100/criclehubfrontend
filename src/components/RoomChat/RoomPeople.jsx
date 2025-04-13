import { useEffect, useRef, useState } from 'react'
import RoompeopleBox from './RoompeopleBox';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Loadingscreen from '../LoadingScr/Loadingscreen';
import { toast } from 'react-toastify';

const RoomPeople = ({ peoples, roomInfo, LoginUser, roomId, socket}) => {
  const [people, setPeople] = useState([]);
  
    const [friendList, setFriendList] = useState([]);
    const [following, setFollowing] = useState([]);
    const scrollRef = useRef();
    const [RoomInfo, setRoomInfo] = useState(null)

    useEffect(() => {
      if (!LoginUser || !LoginUser.uid) return;
    
      const userId = LoginUser.uid;
      const userRef = doc(db, "users", userId);
    
      const unsubscribe = onSnapshot(
        userRef,
        (docSnap) => {
          try {
            if (!docSnap.exists()) return;
    
            const data = docSnap.data();
            const following = data.following || [];
            const followers = data.followers || [];
    
            const mutualIds = following.filter(id => followers.includes(id));
    
            setFriendList(mutualIds);
            setFollowing(following);
          } catch (error) {
            toast.error("Failed to load friend data.");
          }
        },
        (error) => {
          toast.error("Something went wrong while fetching user data.");
        }
      );
    
      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn("Error during Firestore unsubscribe:", error);
        }
      };
    }, [LoginUser]);

  useEffect(() => {
    setPeople(peoples);  // Update state with the new user list
  }, [peoples]);  // Runs whenever peoples changes
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.room?.joinedUsers) {
          setPeople(data.room.joinedUsers); // 👈 update people list in real-time
          setRoomInfo(data)
        }
      } else {
        toast.error("Room does not exist.");
      }
    }, (error) => {
      toast.error("Something went wrong while fetching room info.");
    });

    return () => unsubscribe();
  }, [roomId]);
  
  
  useEffect(()=> {
    setRoomInfo(roomInfo)
  },[roomInfo])
  
  
  const RemoveFriend = (id, name) => {
    socket.emit("kick_user", { uid:id,name: name, roomId: roomId});
  }

  return (
    <div
    ref={scrollRef}
    className="w-full h-full bg-gray-800 rounded p-2 
    flex flex-row gap-4 overflow-x-auto items-center justify-center hidesilder scroll-smooth "
  >
    {people.length ? (
      people.map((person, index) => (
        <div key={index} className="w-[160px] h-full flex-shrink-0 select-none">
          <RoompeopleBox 
          roomId={roomId}
            person={person} 
            roomInfo={RoomInfo} 
            friendList={friendList} 
            following={following}
            LoginUser={LoginUser}
            RemoveFriend={RemoveFriend}
            
          />
        </div>
      ))
    ) : (
      <Loadingscreen />
    )}
  </div>

  );
  
  
}

export default RoomPeople
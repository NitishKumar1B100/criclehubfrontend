import { useEffect, useRef, useState } from 'react'
import RoompeopleBox from './RoompeopleBox';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Loadingscreen from '../LoadingScr/Loadingscreen';
import { toast } from 'react-toastify';

const RoomPeople = ({ peoples, roomInfo, LoginUser }) => {
  const [people, setPeople] = useState([]);
  
    const [friendList, setFriendList] = useState([]);
    const [following, setFollowing] = useState([]);
    const scrollRef = useRef();

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
            person={person} 
            roomInfo={roomInfo} 
            friendList={friendList} 
            following={following}
            LoginUser={LoginUser}
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
import { useEffect, useState } from 'react'
import RoompeopleBox from './RoompeopleBox';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Loadingscreen from '../LoadingScr/Loadingscreen';
import { toast } from 'react-toastify';

const RoomPeople = ({ peoples, roomInfo, LoginUser }) => {
  const [people, setPeople] = useState([]);
  
    const [friendList, setFriendList] = useState([]);
    const [following, setFollowing] = useState([]);

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

  return (
    <div className="w-full h-[150px]
      bg-gray-800 rounded p-4 
      flex flex-row gap-4 items-center justify-center
      ">
      
      {people.length ? (people.map((person, index) => {
        return (
          <div key={index} className={`h-[150px]`}>
            <RoompeopleBox 
              person={person} 
              roomInfo={roomInfo} 
              friendList={friendList} 
              following={following}
              LoginUser={LoginUser}
            />
          </div>
        );
      })) : (<Loadingscreen/>)}
    </div>
  );
  
  
}

export default RoomPeople
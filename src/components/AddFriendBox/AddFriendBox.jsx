import {doc, getDoc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../utils/firebase'
import FriendBox from './FriendBox'
import { toast } from 'react-toastify'
import Loadingscreen from '../LoadingScr/Loadingscreen'

function AddFriendBox({ communityId, userId }) {
  const [friendList, setFriendList] = useState([])
  const [communityMembers, setCommunityMembers] = useState([])
  const [following, setFolowing] = useState([])

  const [fetchingFriend, setFetchingFriend] = useState(true)
  const [fetchingCommunity, setFetchingCommunity] = useState(true)
  
  const [owner, setOwner] = useState(null)
  
  
  // Fetch mutual friends (followers & following)
  useEffect(() => {
    if (!userId) return;
  
    const userRef = doc(db, 'users', userId);
  
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      try {
        if (!docSnap.exists()) return;
  
        const data = docSnap.data();
        const following = data.following || [];
        const followers = data.followers || [];
  
        setFolowing(following);
  
        const mutualIds = following.filter(id => followers.includes(id));
  
        setFriendList(mutualIds);
        setFetchingFriend(false);
      } catch (error) {
        toast.error("coudn't the friends please try again later.")
      }
    });
  
    return () => unsubscribe();
  }, [userId]);
  

  useEffect(() => {
    if (!communityId) return;
  
    const communityRef = doc(db, 'community', communityId);
    const unsubscribe = onSnapshot(communityRef, async (docSnap) => {
      try {
        if (!docSnap.exists()) return;
  
        const data = docSnap.data();
        const memberIds = data.joinedUsers || [];
  
        // Fetch member details
        const memberInfoPromises = memberIds.map(async (id) => {
          const userRef = doc(db, 'users', id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const { name, image } = userSnap.data();
            return { id, name, image };
          }
          return null;
        });
  
        const memberInfos = await Promise.all(memberInfoPromises);
        const filteredMembers = memberInfos.filter(Boolean); // remove nulls
  
        setCommunityMembers(filteredMembers); // ✅ Set full user info
  
        // Fetch owner info too
        const ownerInfo = await fetchOwnerInfo(data.owner);
        if (ownerInfo) {
          setOwner(ownerInfo);
        }
  
        setFetchingCommunity(false);
      } catch (error) {
        toast.error("Failed to load community data. Please try again.");
        setFetchingCommunity(false); // still stop loading spinner if needed
      }
    });
  
    return () => unsubscribe(); // Cleanup
  }, [communityId]);
  
  
  
  const fetchOwnerInfo = async (id) => {
    try {
      if (id) {
        const ownerRef = doc(db, 'users', id);
        const ownerSnap = await getDoc(ownerRef);
        if (ownerSnap.exists()) {
          const { name, image } = ownerSnap.data();
          return { id: id, name, image };
        }
      }
      return null;
    } catch (error) {
      toast.error("Failed to load community owner info.");
      return null;
    }
  };

  if (fetchingFriend || fetchingCommunity) return (<Loadingscreen/>)

  return (
    <div className=''>
      <h2 className='pb-2 text-white'>Member List</h2>
      {/* Host */}
{owner && (
        <div className="flex flex-row items-center bg-gray-600 p-2 rounded-lg">
        <img src={owner.image || '/default-avatar.png'} alt={owner.name}
          className="w-10 h-10 rounded-full mr-2" />
        <span className='text-white'>{owner.name}</span>
        <span className='text-gray-200 text-[12px] ml-2 bg-blue-700 p-1 rounded-full '>Host</span>
      </div>
)}
      
      <div className="flex flex-col gap-2 mt-2">
              {communityMembers.map(member => (
          <FriendBox
          key={member.id}
          member={member}
          isFriend={friendList.includes(member.id)}
          communityId={communityId}
          ownerId={owner ? owner.id : null} 
          following={following.includes(member.id)}
        />
        
      ))}
      </div>
    </div>
  )
}

export default AddFriendBox

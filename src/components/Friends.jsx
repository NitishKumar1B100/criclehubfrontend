import { useEffect, useState } from 'react';
import { useFriendList } from '../contexts/FriendList/FirendListContext';
import { useLogin } from '../contexts/LoginCreadentialContext';
import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import FriendsBox from './FriendBox/FriendsBox';
import { toast } from 'react-toastify';


function Friends() {
  const { FriendList, setFriendList } = useFriendList()

  const [showOptions, setShowOptions] = useState(null)
  const [showCommunity, setShowCommunity] = useState(null)
  const [loadingCommunity, setLoadingCommunity] = useState(true)
  const [ownedCommunitiesList, setOwnedCommunitiesList] = useState([])
  const [addFriendloading, setAddFriendloading] = useState(false)
  const [addFriendloadingId, setAddFriendloadingId] = useState('')


  const { LoginData } = useLogin()

  useEffect(() => {
    if (!LoginData || !LoginData.uid) return;
  
    const userId = LoginData.uid;
    const userRef = doc(db, "users", userId);
  
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          toast.error("User data not found.");
          return;
        }
  
        try {
          const data = docSnap.data();
          const following = data.following || [];
          const followers = data.followers || [];
  
          const mutualIds = following.filter(id => followers.includes(id));
          const mutuals = mutualIds.map(id => ({ id }));
  
          setFriendList(mutuals);
        } catch (err) {
          toast.error("Failed to load mutual friends.");
        }
      },
      (error) => {
        toast.error("Error fetching user data.");
      }
    );
  
    return () => unsubscribe();
  }, [LoginData, setFriendList]);
  

  const handleAddCommunity = async (e, addFriend) => {
    e.stopPropagation();
    setShowCommunity(prev => !prev);
    setShowOptions(false);

    try {
      // 1. Get current user's data
      const currentUserRef = doc(db, 'users', LoginData.uid);
      const CurrUserSnap = await getDoc(currentUserRef);

      if (!CurrUserSnap.exists()) return toast.error("User not found.");

      const currentUserData = CurrUserSnap.data();
      const joinedCommunities = currentUserData.community || [];

      if (joinedCommunities.length === 0) {
        setShowCommunity(prev => !prev);
        return toast.error("You haven't joined any communities yet.");
      }

      // 2. Query for communities owned by current user
      const q = query(collection(db, "community"), where("owner", "==", LoginData.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setShowCommunity(prev => !prev);
        return toast.error("You don't own any communities.");
      }

      // 1. Get data of the user you're trying to add (addFriend)
      const userToAddRef = doc(db, 'users', addFriend);
      const userToAddSnap = await getDoc(userToAddRef);

      if (!userToAddSnap.exists()) {
        setLoadingCommunity(false);
        return toast.error("The user you're trying to add does not exist.");
      }

      const userToAddData = userToAddSnap.data();
      const communitiesTheyJoined = userToAddData.community || [];

      // 2. Loop through communities you own and check if this user already joined
      const ownedCommunities = [];

      for (const docSnap of querySnapshot.docs) {
        const communityData = docSnap.data();
        const communityId = docSnap.id;

        const alreadyJoined = communitiesTheyJoined.includes(communityId); // ✅ simpler check

        ownedCommunities.push({
          id: communityId,
          anotherUserId: addFriend,
          ...communityData,
          alreadyJoined,
        });
      }
      // Now you can show these in a modal/dropdown etc.
      setOwnedCommunitiesList(ownedCommunities); // ← if you want to store this in state
      setLoadingCommunity(false);
      setAddFriendloading(false)

    } catch (error) {
      toast.error("Something went wrong while fetching communities.");
      setLoadingCommunity(false);
      setShowCommunity(prev => !prev);
      setAddFriendloading(false)
    }
  };
  
  const handleAddFriendInCommunity = async (communityId, anotherUserId, alreadyJoined) => {
    if (alreadyJoined) {
      return toast.error("User already joined this community.");
    }
    
    try {
      setAddFriendloading(true);
      setAddFriendloadingId(communityId)
      // 1. Reference to the community document
      const communityRef = doc(db, "community", communityId);
      const communitySnap = await getDoc(communityRef);
  
      if (!communitySnap.exists()) {
        return toast.error("Community not found.");
      }
  
      // 2. Reference to the user you're trying to add
      const userRef = doc(db, "users", anotherUserId);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        return toast.error("User not found.");
      }
  
      const userData = userSnap.data();
      const userCommunities = userData.community || [];
  
      // 3. Add community to user's joined list (if not already there)
      if (!userCommunities.includes(communityId)) {
        await updateDoc(userRef, {
          community: arrayUnion(communityId)
        });
      }
  
      // 4. Add user to the community's joinedUsers array (if not already there)
      const communityData = communitySnap.data();
      const joinedUsers = communityData.joinedUsers || [];
  
      if (!joinedUsers.includes(anotherUserId)) {
        await updateDoc(communityRef, {
          joinedUsers: arrayUnion(anotherUserId)
        });
      }
  
    } catch (error) {
      toast.error("Error adding user to community.");
    }
  };
  


  return (
    <div className="w-full h-full bg-gray-900 ">

      {/* Friends List */}
      <div className="w-full h-[calc(100vh-60px)] flex flex-col space-y-2 overflow-y-auto hidesilder p-2">
        {FriendList.map((item) => (
          <FriendsBox
            key={item.id}
            user={item}
            setShowOptions={setShowOptions}
            showOptions={showOptions}
            handleAddCommunity={handleAddCommunity} 
            />
        ))}
      </div>

      {
        showCommunity && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800 flex items-center justify-center z-[999] opacity-90">
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg relative">
            <button
            className="absolute top-0 right-1 text-red-500 cursor-pointer text-[18px]"
            onClick={() => setShowCommunity(false)}
            >X</button>
              {
                loadingCommunity ? (
                  <div className="ml-2 flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="text-white p-2 flex flex-col items-center justify-between gap-2">

                    {
                      ownedCommunitiesList.map((community, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg gap-3 
                        min-w-[280px] max-w-[350px] ">

                          <div className="flex items-center">
                            <span>{community.name}</span>
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                          onClick={() => handleAddFriendInCommunity(community.id, community.anotherUserId, community.alreadyJoined)}
                          >
                            {(addFriendloading && addFriendloadingId === community.id) ?(<div className="ml-2 flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                  </div>): community.alreadyJoined ? "Already Joined" : "Add"}
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )
              }
            </div>
          </div>
        )
      }
    </div>
  );
}

export default Friends;

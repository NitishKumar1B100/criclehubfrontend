import { useEffect, useState } from 'react';
import { useFriendList } from '../contexts/FriendList/FirendListContext';
import { useLogin } from '../contexts/LoginCreadentialContext';
import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import FriendsBox from './FriendBox/FriendsBox';
import { toast } from 'react-toastify';
import Loadingscreen from './LoadingScr/Loadingscreen';
import { FaUserFriends, FaPlus, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';

function Friends() {
  const { FriendList, setFriendList } = useFriendList()

  const [showOptions, setShowOptions] = useState(null)
  const [showCommunity, setShowCommunity] = useState(null)
  const [loadingCommunity, setLoadingCommunity] = useState(true)
  const [ownedCommunitiesList, setOwnedCommunitiesList] = useState([])
  const [addFriendloading, setAddFriendloading] = useState(false)
  const [addFriendloadingId, setAddFriendloadingId] = useState('')

  const [chooseShowOption, setChooseShowOption] = useState(null)
  
  const [loadingFriend, setLoadingFriend] = useState(false)
  


  const { LoginData } = useLogin()

  useEffect(() => {
    if (!LoginData) {
      setFriendList([])
    }
  }, [LoginData])

  useEffect(() => {
    if (!LoginData || !LoginData.uid) return;

    setLoadingFriend(true)
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
          setLoadingFriend(false)
          
        }
        setLoadingFriend(false)
        
      },
      (error) => {
        toast.error("Error fetching user data.");
        setLoadingFriend(false)
      }
    );

    return () => unsubscribe();
  }, [LoginData, setFriendList]);


  const handleAddCommunity = async (e, addFriend) => {
    e.stopPropagation();
    setLoadingCommunity(true)
    setOwnedCommunitiesList([])
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

      setAddFriendloading(false);
      setOwnedCommunitiesList([])
      setShowCommunity(false);
      setShowOptions(false);
      setChooseShowOption(null)
      setLoadingCommunity(false);
    } catch (error) {
      toast.error("Error adding user to community.");
      setAddFriendloading(false);
    }
  };

  const handleCloseAddCommunityWdw = () => {

    setAddFriendloading(false);
    setOwnedCommunitiesList([])
    setShowCommunity(false);
    setShowOptions(false);
    setChooseShowOption(null)
    setLoadingCommunity(false);

  }

  return (
    <div className={` w-full ${loadingFriend ?'bg-gray-800 ':'bg-gray-900'}`}>

      {/* Friends List */}
      {loadingFriend ?(  <Loadingscreen/>)
  :
  (<div className="w-full h-[calc(100vh-60px)] flex flex-col space-y-2 overflow-y-auto hidesilder p-2">
        {FriendList.map((item) => (
          <FriendsBox
            key={item.id}
            user={item}
            setShowOptions={setShowOptions}
            showOptions={showOptions}
            handleAddCommunity={handleAddCommunity}
            chooseShowOption={chooseShowOption}
            setChooseShowOption={setChooseShowOption}
          />
        ))}
      </div>)}

      {
        showCommunity && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800 flex items-center justify-center z-[999] opacity-90">
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg relative">
              <button
                className="absolute top-0 right-1 text-red-500 cursor-pointer text-[18px]"
                onClick={handleCloseAddCommunityWdw}
              >  <FaTimes size={18} /></button>
              {
                loadingCommunity ? (
                  <Loadingscreen />
                ) : (
                  <div className="text-white p-4 flex flex-col items-center gap-4 w-full">
                    {ownedCommunitiesList.map((community, index) => (
                      <div
                        key={index}
                        className="w-full max-w-md flex flex-row sm:flex-row sm:items-center justify-between bg-gray-800 p-4 rounded-xl shadow-md transition hover:shadow-lg gap-3 sm:gap-0"
                      >
                        {/* Community Info */}
                        <div className="flex items-center gap-3">
                          <FaUserFriends className="text-blue-400" size={20} />
                          <span className="text-lg font-medium text-gray-100 truncate mr-2">
                            {community.name}
                          </span>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() =>
                            handleAddFriendInCommunity(
                              community.id,
                              community.anotherUserId,
                              community.alreadyJoined
                            )
                          }
                          className={` flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition duration-300 ${community.alreadyJoined
                              ? "bg-green-700 text-white cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            }`}
                          disabled={
                            community.alreadyJoined ||
                            (addFriendloading && addFriendloadingId === community.id)
                          }
                        >
                          {addFriendloading && addFriendloadingId === community.id ? (
                            <FaSpinner className="animate-spin" size={16} />
                          ) : community.alreadyJoined ? (
                            <>
                              <FaCheckCircle size={16} />
                              Already Joined
                            </>
                          ) : (
                            <>
                              <FaPlus size={16} />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    ))}
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

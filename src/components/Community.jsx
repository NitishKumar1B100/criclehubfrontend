import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '../utils/firebase'
import CommunityBox from './CommunityBox.jsx/CommunityBox'
import AddFriendBox from './AddFriendBox/AddFriendBox'
import { useLogin } from '../contexts/LoginCreadentialContext'
import { toast } from 'react-toastify'
import { IoCloseSharp } from 'react-icons/io5'

function Community() {
  const [CreateCommunity, setCreateCommunity] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [servers, setServers] = useState([])

  const [comSetting, setComSetting] = useState(null)
  const [AddFriend, setAddFriend] = useState(false)
  const [addFriendComId, setAddFriendComId] = useState(null)

  const { LoginData } = useLogin()
  
  useEffect(()=>{
    if(!LoginData){
      setServers([])
    }
  },[LoginData])

  useEffect(() => {
    if (!LoginData?.uid) return;

    let userRef 
    
    
    try{
      const getuser = async () => {
        userRef = doc(db, 'users', LoginData.uid);
        const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            toast.error("Community: user id doesn't exit.")
          }
      }
      getuser()
    }catch(err){
      toast.error("Community: Coudn't find the user data.")
    }
    
    
    let communityUnsubs = [];

    const unsubUser = onSnapshot(userRef, async (userSnap) => {
      try {
        const userData = userSnap.data();
        const communityIds = userData?.community || [];

        // Clean up previous listeners
        communityUnsubs.forEach(unsub => unsub());
        communityUnsubs = [];

        // Clear current server state
        setServers([]);

        // Set up real-time listeners for each community
        communityIds.forEach((communityId) => {
          try {
            const communityRef = doc(db, 'community', communityId);

            const unsubCommunity = onSnapshot(communityRef, (communitySnap) => {
              try {
                if (communitySnap.exists()) {
                  const updatedCommunity = { id: communityId, ...communitySnap.data() };
                  setServers(prev => {
                    const filtered = prev.filter(c => c.id !== communityId);
                    return [...filtered, updatedCommunity];
                  });
                } else {
                  setServers(prev => prev.filter(c => c.id !== communityId));
                }
              } catch (err) {
                toast.error(`Failed to load community (${communityId})`);
              }
            });

            communityUnsubs.push(unsubCommunity);
          } catch (err) {
            toast.error("Error joining a community.");
          }
        });
      } catch (err) {
        toast.error("Failed to load your communities.");
      }
    }, (error) => {
      toast.error("Real-time connection error.");
    });

    return () => {
      unsubUser();
      communityUnsubs.forEach(unsub => unsub());
    };
  }, [LoginData]);





  const handleCreateCommunity = async () => {
    if (!communityName.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    try {
      // Step 1: Create a new community reference
      const newCommunityRef = doc(collection(db, 'community'));
      const communityData = {
        id: newCommunityRef.id,
        name: communityName.trim(),
        owner: LoginData.uid,
        createdAt: serverTimestamp(),
        joinedUsers: [LoginData.uid],
      };

      // Step 2: Set the new community in Firestore
      await setDoc(newCommunityRef, communityData);

      // Step 3: Add the community to the user's joined list
      const userRef = doc(db, 'users', LoginData.uid);
      await updateDoc(userRef, {
        community: arrayUnion(newCommunityRef.id),
      });

      // Step 4: Reset UI states
      setCreateCommunity(false);
      setCommunityName('');
      toast.success("Community created successfully!");
    } catch (err) {
      toast.error("Failed to create community. Please try again.");
    }
  };

  const handleCunmmunityName = (e) => {
    if (e.target.value.length < 26) {
      setCommunityName(e.target.value)
    }

  }
  return (
    <div className='w-full h-[calc(100vh-60px)] flex flex-row gap-1 bg-gray-700 border-r-2 border-gray-500'>
      {/* Sidebar with community list */}
      <div className="w-full flex flex-col gap-3 bg-gray-900 p-2">
        <div
          className="w-full h-[50px] cursor-pointer bg-gray-600 rounded 
                    text-gray-200 flex items-center justify-center text-3xl "
          onClick={() => setCreateCommunity(true)}
        >
          +
        </div>
        {servers.map((item, index) => (
          <CommunityBox
            key={index} items={item}
            setAddFriendComId={setAddFriendComId}
            setAddFriend={setAddFriend}
            setComSetting={setComSetting}
            comSetting={comSetting} />
        ))}
      </div>

      {/* Create Community Modal */}
      {CreateCommunity && (
        <div className="w-full h-screen z-[999] fixed top-0 left-0 flex items-center justify-center bg-gray-700 bg-opacity-90">
          <div className="w-[350px] bg-gray-800 rounded p-2">
            <input
              onChange={(e) => handleCunmmunityName(e)}
              placeholder='Community Name'
              type="text"
              className='w-full h-[50px] text-white border-none outline-none bg-gray-900 p-2 mt-3'
              value={communityName}
            />

            <div className="w-full h-[50px] flex flex-row gap-2 items-center justify-between p-1 mt-4">
              <button
                className='bg-blue-700 p-2 w-[50%] rounded cursor-pointer text-white'
                onClick={handleCreateCommunity}
              >
                Submit
              </button>
              <button
                className='bg-red-700 p-2 w-[50%] rounded cursor-pointer text-white'
                onClick={() => {
                  setCreateCommunity(false)
                  setCommunityName('')
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add friend in community*/}
      {
  AddFriend && (
    <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md max-h-[80vh] bg-gray-800 rounded-2xl p-5 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={() => setAddFriend(false)}
          aria-label="Close modal"
          className="cursor-pointer absolute top-1 right-1 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-full shadow-md transition"
        >
          <IoCloseSharp size={18} />
        </button>

        {/* Modal Content */}
        <div className="pt-2">
          <AddFriendBox communityId={addFriendComId} userId={LoginData.uid} />
        </div>
      </div>
    </div>
  )
}
    </div>
  )
}

export default Community

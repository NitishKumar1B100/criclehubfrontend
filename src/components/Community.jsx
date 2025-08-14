import { useEffect, useState, useCallback } from 'react';
import {
  collection, doc, onSnapshot, serverTimestamp,
  setDoc, updateDoc, arrayUnion, getDoc
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import CommunityBox from './CommunityBox.jsx/CommunityBox';
import AddFriendBox from './AddFriendBox/AddFriendBox';
import { useLogin } from '../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';
import { IoCloseSharp } from 'react-icons/io5';

function Community() {
  const [createCommunity, setCreateCommunity] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [servers, setServers] = useState([]);
  const [comSetting, setComSetting] = useState(null);
  const [addFriend, setAddFriend] = useState(false);
  const [addFriendComId, setAddFriendComId] = useState(null);
  const [communityCreating, setCommunityCreating] = useState(false);

  const { LoginData } = useLogin();

  // Clear community list when user logs out
  useEffect(() => {
    if (!LoginData) setServers([]);
  }, [LoginData]);

  // Check if user exists
  useEffect(() => {
    if (!LoginData?.uid) return;

    const userRef = doc(db, 'users', LoginData.uid);
    getDoc(userRef).then(docSnap => {
      if (!docSnap.exists()) {
        toast.error("Community: user ID doesn't exist.");
      }
    }).catch(() => {
      toast.error("Community: couldn't find user data.");
    });
  }, [LoginData]);

  // Realtime community updates
  useEffect(() => {
    if (!LoginData?.uid) return;

    const userRef = doc(db, 'users', LoginData.uid);
    let communityUnsubs = [];

    const unsubUser = onSnapshot(userRef, (userSnap) => {
      const userData = userSnap.data();
      const communityIds = userData?.community || [];

      // Clean up previous listeners
      communityUnsubs.forEach(unsub => unsub());
      communityUnsubs = [];
      setServers([]);

      // Set up new listeners
      communityIds.forEach((communityId) => {
        const communityRef = doc(db, 'community', communityId);
        const unsubCommunity = onSnapshot(communityRef, (communitySnap) => {
          if (communitySnap.exists()) {
            const updatedCommunity = { id: communityId, ...communitySnap.data() };
            setServers(prev => {
              const filtered = prev.filter(c => c.id !== communityId);
              return [...filtered, updatedCommunity];
            });
          } else {
            setServers(prev => prev.filter(c => c.id !== communityId));
          }
        }, () => {
          toast.error(`Failed to listen to community: ${communityId}`);
        });

        communityUnsubs.push(unsubCommunity);
      });
    }, () => {
      toast.error("Real-time connection error.");
    });

    return () => {
      unsubUser();
      communityUnsubs.forEach(unsub => unsub());
    };
  }, [LoginData]);

  // Create new community
  const handleCreateCommunity = async () => {
    if (!communityName.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    setCommunityCreating(true);

    try {
      const newCommunityRef = doc(collection(db, 'community'));
      const communityData = {
        id: newCommunityRef.id,
        name: communityName.trim(),
        owner: LoginData.uid,
        createdAt: serverTimestamp(),
        joinedUsers: [LoginData.uid],
      };

      await setDoc(newCommunityRef, communityData);

      const userRef = doc(db, 'users', LoginData.uid);
      await updateDoc(userRef, {
        community: arrayUnion(newCommunityRef.id),
      });

      setCreateCommunity(false);
      setCommunityName('');
      toast.success("Community created successfully!");
    } catch (err) {
      toast.error("Failed to create community. Please try again.");
    } finally {
      setCommunityCreating(false);
    }
  };

  const handleCommunityNameChange = (e) => {
    if (e.target.value.length < 26) {
      setCommunityName(e.target.value);
    }
  };

  return (
    <div className='w-full h-[calc(100vh-55px)] flex flex-row gap-1 bg-gray-700 border-r-2 border-gray-500'>
      
      {/* Sidebar */}
      <div className="w-full flex flex-col gap-3 bg-gray-900 p-2 ">
        <div
          className="w-full h-[60px] cursor-pointer bg-gray-600 rounded text-gray-200 flex items-center justify-center text-3xl "
          onClick={() => setCreateCommunity(true)}
        >
          +
        </div>

<div className='hidesilder w-full h-[calc(100vh-50px)] overflow-y-auto flex flex-col gap-3'>
          {servers.map((item, index) => (
          <CommunityBox
            key={index}
            items={item}
            setAddFriendComId={setAddFriendComId}
            setAddFriend={setAddFriend}
            setComSetting={setComSetting}
            comSetting={comSetting}
          />
        ))}
</div>
      </div>

      {/* Create Community Modal */}
      {createCommunity && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-700 bg-opacity-90">
          <div className="w-[350px] bg-gray-800 rounded p-4">
            <input
              onChange={handleCommunityNameChange}
              placeholder='Community Name'
              type="text"
              className='w-full h-[50px] text-white bg-gray-900 p-2 mt-3 outline-none'
              value={communityName}
            />

            <div className="flex gap-2 mt-4">
              <button
                className='bg-blue-700 p-2 w-[50%] rounded text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={handleCreateCommunity}
                disabled={communityCreating}
              >
                {communityCreating ? (
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : "Submit"}
              </button>

              <button
                className='bg-red-700 p-2 w-[50%] rounded text-white'
                onClick={() => {
                  setCreateCommunity(false);
                  setCommunityName('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {addFriend && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center px-4">
          <div className="relative w-full max-w-md max-h-[80vh] bg-gray-800 rounded-2xl p-5 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 transition-all duration-300">
            <button
              onClick={() => setAddFriend(false)}
              aria-label="Close modal"
              className="absolute top-1 right-1 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
            >
              <IoCloseSharp size={18} />
            </button>

            <div className="pt-2">
              <AddFriendBox communityId={addFriendComId} userId={LoginData.uid} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;

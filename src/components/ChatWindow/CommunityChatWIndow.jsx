import { useEffect, useState } from 'react'
import { useCommunity } from '../../contexts/CommunityContext'
import DefaultChat from './DefaultChat'
import { FaChevronLeft } from "react-icons/fa";
import { usePhoneChat } from '../../contexts/PhoneChatContext';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useLogin } from '../../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';

const CommunityChatBox = ({ CommunityName, CommunityId }) => {
  const { setSelectedPhoneChat } = usePhoneChat()
  const [messages, setMessages] = useState([])
  const [currentMsg, setCurrentMsg] = useState('')

  const [joinedUsers, setJoinedUsers] = useState([]);

  const { LoginData } = useLogin()

  const handleSelectType = () => {
    setSelectedPhoneChat(false)
  }

  useEffect(() => {
    if (!CommunityId) return;

    const communityDocRef = doc(db, 'community', CommunityId);

    const unsubscribe = onSnapshot(communityDocRef, async (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      const userIds = data.joinedUsers || [];

      try {
        const names = await Promise.all(
          userIds.map(async (uid) => {
            try {
              const userDocRef = doc(db, 'users', uid);
              const userSnap = await getDoc(userDocRef);
              const userData = userSnap.data();
              return userData?.name || 'Unknown';
            } catch (err) {
              //console.error("Error fetching user data for UID:", uid, err);
              toast.error('Error fetching user data for UID')
              return 'Unknown';
            }
          })
        );
        setJoinedUsers(names);
      } catch (err) {
        //console.error("Error fetching user names:", err);
        toast.error('Error fetching user names')
      }
    });

    return () => unsubscribe();
  }, [CommunityId]);

  // Real-time chat listener
  useEffect(() => {
    if (!CommunityId) return;

    let unsubscribe;

    try {
      const q = query(
        collection(db, 'community', CommunityId, 'messages'),
        orderBy('createdAt')
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const chatMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(chatMessages);
      });
    } catch (error) {
      toast.error("Failed to load community chat.");
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [CommunityId]);


  const handleSendMessage = async () => {
    if (!currentMsg.trim() || !LoginData?.uid) return
    
    let userInf 

    const googleProfile = LoginData.providerData.find(
      (provider) => provider.providerId === "google.com"
    );
    if (googleProfile) {
      userInf = {
        name: googleProfile.displayName || '',
        img: LoginData.photoURL || '',
      }
    }

    const messageData = {
      text: currentMsg,
      senderId: LoginData.uid,
      senderName: userInf.name || 'Anonymous',
      createdAt: serverTimestamp()
    }

    try {
      setCurrentMsg('')
      await addDoc(collection(db, 'community', CommunityId, 'messages'), messageData)
    } catch (err) {
      toast.error('Error sending message. Please try again.')
    }
  }

  // 💬 Optional: Send on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="hidesilder w-full h-full flex flex-col bg-gray-900 text-white">

      {/* Header */}
      <div className="w-full flex items-center justify-between text-xl border-b border-gray-700">
        <div className="w-full flex items-center gap-3 h-15">
          <div
            className="hide-chat-window-button cursor-pointer p-2"
            onClick={handleSelectType}
          >
            <FaChevronLeft />
          </div>
          <div className="select-none p-2 flex flex-col w-full">
            <div className="font-bold">{CommunityName}</div>
            <div className="text-sm truncate w-full">
              {joinedUsers.join(', ')}
            </div>

          </div>
        </div>

      </div>

      {/* Messages */}
      <div className="flex flex-col overflow-y-auto gap-2 p-2 hidesilder flex-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[300px] mt-2 bg-gray-800 rounded-md ${msg.senderId === LoginData.uid ? 'ml-auto' : ''
              }`}
          >
            <div className="p-2">
              <span>{msg.senderName || msg.senderId}</span>
              <p className="p-2 bg-gray-700">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center p-2 bg-gray-900">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full h-[60px] p-2 bg-gray-800 text-white outline-none"
          value={currentMsg}
          onChange={(e) => setCurrentMsg(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}


function CommunityChatWIndow() {
  const { selectedCommunity, setSelectedCommunity } = useCommunity()
  const { LoginData } = useLogin()

  useEffect(() => {
    if (!LoginData?.uid || !selectedCommunity?.id) return;

    const userRef = doc(db, 'users', LoginData.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const userData = docSnap.data();
      const joinedCommunities = userData.community || [];

      // If the user is no longer part of the selected community
      if (!joinedCommunities.includes(selectedCommunity.id)) {
        setSelectedCommunity({ id: '', name: '' }); // Reset selected community
      }
    });

    return () => unsubscribe();
  }, [LoginData?.uid, selectedCommunity?.id, setSelectedCommunity]);
  
  if(!LoginData) return <div className="hidesilder w-full h-full"></div>
  
  return (
    <div className="hidesilder w-full h-full ">
      {

        selectedCommunity.id ?

          <CommunityChatBox CommunityName={selectedCommunity.name} CommunityId={selectedCommunity.id} />

          :

          <DefaultChat />
      }
    </div>
  )
}

export default CommunityChatWIndow
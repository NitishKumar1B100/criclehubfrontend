import { useEffect, useRef, useState } from 'react'
import { useFriend } from '../../contexts/FriendContext'
import DefaultChat from './DefaultChat';
import { FaChevronLeft } from "react-icons/fa";
import { usePhoneChat } from '../../contexts/PhoneChatContext';
import { useLogin } from '../../contexts/LoginCreadentialContext';
import { arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useFreindChatId } from '../../contexts/FriendChatID/FriendChatID';
import { toast } from 'react-toastify';
import { IoCloseSharp } from "react-icons/io5";

const FriendMsgHeadLine = ({ selectedFriend, handleShowFriendDetails }) => {
  const { setSelectedPhoneChat } = usePhoneChat()

  const handleChatShow = () => {
    setSelectedPhoneChat(false)
  }

  return (
    <div className=" w-full h-full flex justify-between items-center">

      <div className="flex justify-center items-center">

        <div className="p-2">
          <div className="hide-chat-window-button text-2xl text-white cursor-pointer"
            onClick={handleChatShow}><FaChevronLeft /></div>
        </div>

        <div className="h-full flex justify-start items-center gap-2 p-2">
          <div className={`w-10 h-10 cursor-pointer rounded-[50%] bg-cover bg-center`}
            style={{ backgroundImage: `${`url(${selectedFriend.image})`}` }}
            onClick={handleShowFriendDetails}
          ></div>
          <div className="text-white text-[3vh] font-semibold">{selectedFriend.name}</div>
        </div>

      </div>

      <div className="h-full flex justify-end items-center gap-5 p-2 mr-2">
        {/* <div className="text-white text-[3vh] cursor-pointer"><IoCall /></div>
                <div className="text-white text-[3vh] cursor-pointer"><FaCircleInfo /></div> */}
      </div>
    </div>
  )
}


const FriendMsg = ({ FreindChatId }) => {
  const [messages, setMessages] = useState([]);
  const { LoginData } = useLogin()

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!FreindChatId) return;

    let unsubscribe;

    try {
      const chatDocRef = doc(db, 'friendChat', FreindChatId);

      unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setMessages(chatData.messages || []);
        } else {
          setMessages([]);
        }
      });
    } catch (error) {
      toast.error("Failed to load friend chat.");
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [FreindChatId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!LoginData) return <div></div>

  return (
    <div className="flex flex-col justify-start items-start gap-2 p-2">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`w-full flex ${msg.senderId === LoginData.uid ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`p-2 max-w-[300px] rounded ${msg.senderId === LoginData.uid ? 'bg-blue-700' : 'bg-gray-800'} text-white`}>
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const SendFriendMsg = ({ FreindChatId, selectedFriend }) => {
  const [message, setMessage] = useState('');
  const { LoginData } = useLogin()

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const newMessage = {
        senderId: LoginData.uid,
        receiverId: selectedFriend.id,
        text: message.trim(),
        createdAt: new Date().toISOString(), // Firebase doesn't support serverTimestamp in arrayUnion
      };

      const chatDocRef = doc(db, 'friendChat', FreindChatId);

      setMessage('');
      await updateDoc(chatDocRef, {
        messages: arrayUnion(newMessage),
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      toast.error("Error sending message. Please try again.");
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-row items-center">
      <div className="flex-1 h-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message"
          className="w-full h-full bg-gray-800 text-white text-[17px] border-none outline-none p-2"
        />
      </div>
    </div>
  );
};


const Allpartofchat = ({ handleShowFriendDetails, selectedFriend, FreindChatId }) => {
  return (
    <div className='w-full h-full flex 
    flex-col gap-1
   '>
      <div className="w-full h-16 border-b-gray-500 border-b-2 ">
        <FriendMsgHeadLine selectedFriend={selectedFriend} handleShowFriendDetails={handleShowFriendDetails} />
      </div>

      <div className="w-full h-full overflow-y-auto hidesilder">
        <FriendMsg FreindChatId={FreindChatId} />
      </div>

      <div className="w-full h-[80px] ">
        <SendFriendMsg FreindChatId={FreindChatId} selectedFriend={selectedFriend} />
      </div>
    </div>
  )
}

function FriendChatWindow() {
  const { selectedFriend, setSelectedFriend } = useFriend()
  const { LoginData } = useLogin()
  const { FreindChatId, setFreindChatId } = useFreindChatId()
  const [fetchingId, setFetchingId] = useState(false)

  const [showFriendDTL, setShowFriendDTL] = useState(false)
  const [showFriendDTLOBJ, setShowFriendDTLOBJ] = useState(null)


  useEffect(() => {
    let isMounted = true; //  protect state update after unmount

    const setupChat = async () => {
      if (!LoginData || !selectedFriend?.id) return;

      if (isMounted) setFetchingId(true);

      try {
        //  Step 1: Generate consistent chat ID
        const sorted = [LoginData.uid, selectedFriend.id].sort();
        const generatedChatId = `${sorted[0]}_${sorted[1]}`;
        if (isMounted) setFreindChatId(generatedChatId);

        //  Step 2: Check if chat exists
        const chatDocRef = doc(db, 'friendChat', generatedChatId);
        const chatDoc = await getDoc(chatDocRef);

        //  Step 3: Create chat if it doesn't exist
        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            users: [LoginData.uid, selectedFriend.id],
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }
      } catch (error) {
        toast.error("Something went wrong while starting the chat.");
      } finally {
        if (isMounted) setFetchingId(false);
      }
    };

    setupChat();

    return () => {
      isMounted = false; // cleanup
    };
  }, [selectedFriend, LoginData]);

  //  Live tracking: if selected friend is no longer a mutual connection
  useEffect(() => {
    if (!LoginData?.uid || !selectedFriend?.id) return;

    let isMounted = true;

    const userRef = doc(db, 'users', LoginData.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        try {
          if (!docSnap.exists()) return;

          const data = docSnap.data();
          const following = data.following || [];
          const followers = data.followers || [];

          const mutualFriends = following.filter(uid => followers.includes(uid));

          if (!mutualFriends.includes(selectedFriend.id)) {
            if (isMounted) {
              setSelectedFriend({ type: '', id: '', name: '', image: '' });
              toast.info("This user is no longer your mutual friend.");
            }
          }
        } catch (error) {
          toast.error("Error occurred while checking friend status.");
        }
      },
      (error) => {
        toast.error("Failed to listen to friend changes.");
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [LoginData?.uid, selectedFriend?.id]);

  const handleShowFriendDetails = async () => {
    try {
      const id = selectedFriend.id
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      const { name, image, followers, following } = docSnap.data()
      setShowFriendDTLOBJ({ name, image, followers: followers.length, following: following.length })

      setShowFriendDTL(prev => !prev)
    } catch (err) {
      toast.error("Coudn't find the user details, please try again.")
    }
  }

  const handlecloseOFShowDTL = () => {
    setShowFriendDTL(prev => !prev)
  }


  if (fetchingId) return (<div className="ml-2 flex items-center justify-center h-full">
    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>)

  if (!LoginData) return <div className="hidesilder w-full h-full bg-gray-700 relative"></div>

  return (
    <>
      <div className="hidesilder w-full h-full relative">
        {(selectedFriend.id) ?
          (<Allpartofchat
            handleShowFriendDetails={handleShowFriendDetails}
            FreindChatId={FreindChatId}
            selectedFriend={selectedFriend} />)
          : (<DefaultChat />)}

        {
          showFriendDTL && (
            <div className="bg-gray-800/50 absolute top-0 left-0 w-full h-full  flex items-center justify-center">
              <div className="w-[300px] h-[300px] relative p-5 rounded-xl bg-gray-800 flex flex-col items-center justify-center gap-3">
                <div className="w-40 h-40 bg-cover bg-contain " style={{ backgroundImage: `url(${showFriendDTLOBJ.image})` }}></div>
                <div
                  onClick={handlecloseOFShowDTL}
                  className="absolute top-0 right-0 bg-blue-900 w-7 h-7 cursor-pointer flex items-center justify-center text-gray-200 text-xl"><IoCloseSharp /></div>
                <div className="text-gray-200">
                  <p className='text-center'>{showFriendDTLOBJ.name}</p>
                  <p className='text-[8px]'>{selectedFriend.id}</p>
                </div>
                <div className="flex flex row text-gray-200">
                  <span>followers: {showFriendDTLOBJ.followers}  following: {showFriendDTLOBJ.following}</span>

                </div>
              </div>
            </div>
          )
        }
      </div>

    </>
  )
}

export default FriendChatWindow
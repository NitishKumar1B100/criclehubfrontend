import { useEffect, useState } from "react";
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useFriend } from "../../contexts/FriendContext";
import { usePhoneChat } from "../../contexts/PhoneChatContext";
import { useLogin } from "../../contexts/LoginCreadentialContext";
import { toast } from "react-toastify";
import { CgOptions } from "react-icons/cg";


const FriendsBox = ({ user, handleAddCommunity, chooseShowOption, setChooseShowOption }) => {
    const { selectedFriend, setSelectedFriend } = useFriend();
    const { setSelectedPhoneChat } = usePhoneChat();
    const [userInfo, setUserInfo] = useState(null);
    const [fetchingChat, setFetchingChat] = useState(false);
    const { LoginData } = useLogin()

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!user || !user.id) {
                toast.error("User ID is not available.");
                return;
            }
            
            try {
                const docRef = doc(db, "users", user.id);
                const docSnap = await getDoc(docRef);
    
                if (docSnap.exists()) {
                    setUserInfo(docSnap.data());
                } else {
                    toast.error("No data found for this user.");
                }
            } catch (error) {
                toast.error("Error fetching user info. Please try again later.");
            }
        };
    
        fetchUserInfo();
    }, [user]);
    

    const selectFriend = async () => {
        setFetchingChat(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/check-friend-status?uid=${LoginData.uid}&otherUid=${user.id}`);
            const result = await res.json();

            if (result.isFriend) {
                setFetchingChat(false)
                const data = {id: user.id, name: userInfo.name, image: userInfo.image };
                setSelectedFriend(data);
                setSelectedPhoneChat(true);
            } else {
                toast.error("You both need to follow each other to chat.");
                setFetchingChat(false)
                setSelectedPhoneChat(false);
            }
        } catch (err) {
            toast.error("Error fetching friend status. Please try again later.");
            setFetchingChat(false)
            setSelectedPhoneChat(false);
        }
    };

    const handleUnfollow = async (e) => {
        e.stopPropagation(); // Prevent default behavior of the button
        const confirmed = window.confirm(`Are you sure you want to unfollow ${user.name || 'this user'}?`);

        if (!confirmed) return;

        try {
            const currentUserRef = doc(db, 'users', LoginData.uid);
            const friendUserRef = doc(db, 'users', user.id);

            // Remove from current user's following
            await updateDoc(currentUserRef, {
                following: arrayRemove(user.id),
            });

            // Remove from friend's followers
            await updateDoc(friendUserRef, {
                followers: arrayRemove(LoginData.uid),
            });

            // Optionally: clear chat from frontend
            setSelectedFriend({});
            setSelectedFriend( { id:'', name: '', image: '' });
            setSelectedPhoneChat(false);
        } catch (error) {
            toast.error("Error unfollowing user")
            setSelectedPhoneChat(false);
        }
    };

    const ShowtheOptions = (e) => {
        e.stopPropagation(); // Prevent default behavior of the button
        if (chooseShowOption === user.id) {
            setChooseShowOption(null)
        } else {
            setChooseShowOption(user.id)
        }

    }

if(!userInfo) return <div></div>

    return (
        <div
            onClick={selectFriend}
            className={`relative cursor-pointer flex items-center justify-between p-2 rounded-lg transition-all w-full
        ${selectedFriend.id === user.id
                    ? 'bg-blue-800 shadow-md scale-[1.02]'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
        >
            <div className="ml-3 flex items-center gap-3 w-full">
                {/* Friend Avatar */}
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-gray-700 shrink-0">
                    <img
                        src={userInfo.image}
                        alt={userInfo.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Friend Name + Loading Spinner */}
                <div className="flex items-center justify-between w-full overflow-hidden">
                    <div
                        title={userInfo.name}
                        className="truncate text-white text-[16px] font-medium">
                        {userInfo.name}
                    </div>

                    {fetchingChat && (
                        <div className="mr-2 mt-1 flex items-center justify-center">
                            <div className="w-5 h-5 border-4 border-gray-100 border-dashed rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            <button className="cursor-pointer select-none text-2xl text-gray-200 absolute top-0 right-0"
                onClick={ShowtheOptions}
            ><CgOptions /></button>

            {chooseShowOption === user.id && (
                <div className="absolute top-5 right-5 bg-gray-900 rounded-xl shadow-xl z-[999] w-44 sm:w-52 md:w-56">
                    <button
                        onClick={handleUnfollow}
                        className="w-full text-left px-4 py-2 text-sm sm:text-[14px] text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:text-red-300 transition duration-200 rounded-t-xl"
                    >
                        Unfollow
                    </button>
                    <button
                        onClick={(e) => handleAddCommunity(e, user.id)}
                        className="w-full text-left px-4 py-2 text-sm sm:text-[14px] text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition duration-200 rounded-b-xl"
                    >
                        Add to Community
                    </button>
                </div>
            )}

        </div>
    );
};

export default FriendsBox;

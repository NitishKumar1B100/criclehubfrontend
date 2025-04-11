import { useEffect, useState } from "react";
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useFriend } from "../../contexts/FriendContext";
import { usePhoneChat } from "../../contexts/PhoneChatContext";
import { useLogin } from "../../contexts/LoginCreadentialContext";
import { toast } from "react-toastify";
import Loadingscreen from "../LoadingScr/Loadingscreen";
import { CgOptions } from "react-icons/cg";


const FriendsBox = ({ user, handleAddCommunity, chooseShowOption, setChooseShowOption }) => {
    const { selectedFriend, setSelectedFriend } = useFriend();
    const { setSelectedPhoneChat } = usePhoneChat();
    const [userInfo, setUserInfo] = useState(null);
    const [fetchingChat, setFetchingChat] = useState(false);
    const { LoginData } = useLogin()

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const docRef = doc(db, "users", user.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserInfo(docSnap.data());
                }
            } catch (error) {
                toast.error('Error fetching user info. Please try again later.');
            }
        };

        fetchUserInfo();
    }, [user.id]);

    const selectFriend = async () => {
        setFetchingChat(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/check-friend-status?uid=${LoginData.uid}&otherUid=${user.id}`);
            const result = await res.json();

            if (result.isFriend) {
                setFetchingChat(false)
                const data = { type: 'friend', id: user.id, name: userInfo.name, image: userInfo.image };
                setSelectedFriend(data);
                setSelectedPhoneChat(true);
            } else {
                toast.error("You both need to follow each other to chat.");
                setFetchingChat(false)
            }
        } catch (err) {
            toast.error("Error fetching friend status. Please try again later.");
            setFetchingChat(false)
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
        } catch (error) {
            toast.error("Error unfollowing user")
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



    if (!userInfo) return (<Loadingscreen />); // or a loading spinner

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

            {
                chooseShowOption === user.id && (
                    <div className="absolute top-7 right-1 bg-gray-800 rounded shadow-lg z-[999]
                    flex flex-col gap-2">
                        <button
                            onClick={handleUnfollow}
                            className="text-red-500 hover:text-red-700 border-white border-b-1 p-2 text-[10px]"
                        >
                            Unfollow
                        </button>
                        <button
                            onClick={(e) => handleAddCommunity(e, user.id)}
                            className="text-blue-500 hover:text-blue-700 p-2 text-[10px]"
                        >
                            Add in Community
                        </button>
                    </div>
                )
            }
        </div>
    );
};

export default FriendsBox;

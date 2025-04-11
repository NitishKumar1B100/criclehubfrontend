import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../utils/firebase'
import { toast } from 'react-toastify'
import { FaHeart } from "react-icons/fa";
import { FaHeartBroken } from "react-icons/fa";

function RoompeopleBox({roomInfo, person, friendList, following, LoginUser }) {
    const [isFollowing, setIsFollwing] = useState(false)
    const [isFreindList, setIsFriendList] = useState(false)

    useEffect(() => {
        setIsFollwing(following.includes(person.uid))
        setIsFriendList(friendList.includes(person.uid))
    }, [friendList, following])
    
    

    const handleFollow = async (targetUid) => {
      if (!LoginUser?.uid || !targetUid) return;
    
      const currentUserRef = doc(db, "users", LoginUser.uid);
      const targetUserRef = doc(db, "users", targetUid);
    
      try {
        await Promise.all([
          updateDoc(currentUserRef, {
            following: arrayUnion(targetUid),
          }),
          updateDoc(targetUserRef, {
            followers: arrayUnion(LoginUser.uid),
          }),
        ]);
    
        setIsFollwing(true);
        toast.success("Followed successfully!");
      } catch (err) {
        toast.error("Failed to follow the user.");
      }
    };
    

    
      const handleUnFollow = async (targetUid) => {
        if (!LoginUser?.uid) return;
      
        const currentUserRef = doc(db, "users", LoginUser.uid);
        const targetUserRef = doc(db, "users", targetUid);
      
        try {
          // Remove targetUid from current user's following list
          await updateDoc(currentUserRef, {
            following: arrayRemove(targetUid),
          });
      
          // Remove current user from target user's followers list
          await updateDoc(targetUserRef, {
            followers: arrayRemove(LoginUser.uid),
          });
      
          setIsFollwing(false);
          toast.success("Unfollowed successfully")
        } catch (err) {
          toast.error("Error unfollowing user")
        }
      };
      
    return (
        <div
            className={`w-full h-full ${(isFreindList)  ? "border-blue-700 border-2" : "bg-gray-900"}  inline-block rounded p-1`}>

            <div className={`w-full h-full `}>
                <div
                    className={`h-full w-full relative
                  rounded bg-cover bg-center bg-no-repeat
                  flex items-center justify-center`}
                  style={{backgroundImage:`url(${person.userDetails.image})`,
                backgroundSize:'38% 50%'}}
                >
                  {/* <img src={`${person.userDetails.image}`} alt="" /> */}
                    <div className="absolute left-0 bottom-0 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-[10px]">
                        {person.userDetails.name}
                    </div>

                    {
                        roomInfo.room.owner === person.uid && (
                            <div className="absolute right-0 top-0 bg-blue-900 text-white px-2 py-1 rounded text-sm">
                                Host
                            </div>
                        )
                    }

                    {
                        LoginUser.uid !== person.uid && (
                            isFollowing ? (
                                <div 
                                onClick={() => handleUnFollow(person.uid)}
                                className="select-none cursor-pointer absolute right-0 bottom-0 bg-gray-900 text-red-400 px-2 py-1 rounded text-sm">
                                    <FaHeartBroken/>
                                </div>
                            ) : (
                                <div 
                                onClick={() => handleFollow(person.uid)}
                                className="select-none cursor-pointer absolute right-0 bottom-0 bg-gray-900 text-blue-400 px-2 py-1 rounded text-sm">
                                   <FaHeart/>
                                </div>
                            )
                        )
                    }

                </div>
            </div>
        </div>
    )
}

export default RoompeopleBox

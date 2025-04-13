import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../utils/firebase'
import { toast } from 'react-toastify'
import { FaHeart } from "react-icons/fa";
import { FaHeartBroken } from "react-icons/fa";

function RoompeopleBox({ roomInfo, person, friendList, following, LoginUser, roomId, RemoveFriend}) {
  const [isFollowing, setIsFollwing] = useState(false)
  const [isFreindList, setIsFriendList] = useState(false)
  const [showOptions, setShowOptions] = useState(false);

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
  
  const handleMouseEnter = () => {
    if(LoginUser.uid !== person.uid){
      setShowOptions(true)
    }
  }
  
  const handleRemovePerson = (name) => {
    RemoveFriend(person.uid, name)
  }
  
  const handleTransferOwnership = async () => {
    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);
  
      if (!roomSnap.exists()) {
        toast.error("Room not found.");
        return;
      }
  
      const roomData = roomSnap.data();
  
      // Correct comparison
      if (roomData.room.owner === LoginUser.uid) {
        // Transfer ownership
        await updateDoc(roomRef, {
          'room.owner': person.uid,
        });
        toast.success("Ownership successfully transferred.");
      } else {
        toast.error("Only the current owner can transfer ownership.");
      }
    } catch (error) {
      toast.error("Something went wrong during ownership transfer.");
    }
  };
  
  

  return (
    <div
      className={`w-full h-full ${(isFreindList) ? "border-blue-700 border-2" : "bg-gray-900"}  inline-block rounded p-1 relative`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowOptions(false)}>

      <div className={`w-full h-full `}>
        <div
          className={`h-full w-full relative
                  rounded bg-cover bg-center bg-no-repeat
                  flex items-center justify-center`}
          style={{
            backgroundImage: `url(${person.userDetails.image})`,
            backgroundSize: '38% 54%'
          }}
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
                  <FaHeartBroken />
                </div>
              ) : (
                <div
                  onClick={() => handleFollow(person.uid)}
                  className="select-none cursor-pointer absolute right-0 bottom-0 bg-gray-900 text-blue-400 px-2 py-1 rounded text-sm">
                  <FaHeart />
                </div>
              )
            )
          }

        </div>
      </div>
      {showOptions && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-gray-800/70 text-white rounded-lg shadow-lg z-[999] 
        transition-all duration-200 ease-in-out opacity-100 rounded-sm items-center justify-center"
        >
          {
            LoginUser.uid !== person.uid && (
              isFollowing ? (
                <button
                  onClick={() => handleUnFollow(person.uid)}
                  className="w-full select-none cursor-pointer bg-gray-900 text-red-400 text-sm p-[7px] hover:bg-gray-800">
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(person.uid)}
                  className="w-full select-none cursor-pointer bg-gray-900 text-blue-400 text-sm p-[7px] hover:bg-gray-800">
                  Follow
                </button>
              )
            )
          }
         {
          LoginUser.uid === roomInfo.room.owner && (<>
           <button className="block w-full cursor-pointer p-[7px] hover:bg-gray-800 text-sm  bg-gray-900" onClick={() => handleRemovePerson(person.userDetails.name)}>Remove</button>
           <button className="block w-full cursor-pointer p-[7px] hover:bg-gray-800 text-sm  bg-gray-900" onClick={handleTransferOwnership}>Transfer the ownership</button>
          </>) 
         }
        </div>
      )}
    </div>
  )
}

export default RoompeopleBox

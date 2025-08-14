import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../utils/firebase'
import { toast } from 'react-toastify'
import { FaHeart } from "react-icons/fa";
import { FaHeartBroken } from "react-icons/fa";

function RoompeopleBox({ roomInfo, person, friendList, following, LoginUser, roomId, RemoveFriend }) {
  const [isFollowing, setIsFollwing] = useState(false)
  const [isFreindList, setIsFriendList] = useState(false)
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setIsFollwing(Array.isArray(following) && following.includes(person.uid));
    setIsFriendList(Array.isArray(friendList) && friendList.includes(person.uid));
  }, [friendList, following, person.uid]);


  const handleFollow = async (targetUid) => {
    if (!LoginUser?.uid || !targetUid) return;

    setIsFollwing(true); // ✅ Update instantly for UI

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
      toast.success("Followed successfully!");
    } catch (err) {
      setIsFollwing(false); // rollback if failed
      toast.error("Failed to follow the user.");
    }
  };

  const handleUnFollow = async (targetUid) => {
    if (!LoginUser?.uid) return;

    setIsFollwing(false); // ✅ Update instantly for UI

    const currentUserRef = doc(db, "users", LoginUser.uid);
    const targetUserRef = doc(db, "users", targetUid);

    try {
      await Promise.all([
        updateDoc(currentUserRef, {
          following: arrayRemove(targetUid),
        }),
        updateDoc(targetUserRef, {
          followers: arrayRemove(LoginUser.uid),
        }),
      ]);
      toast.success("Unfollowed successfully");
    } catch (err) {
      setIsFollwing(true); // rollback if failed
      toast.error("Error unfollowing user");
    }
  };

  const handleMouseEnter = () => {
    if (LoginUser.uid !== person.uid) {
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
    className={`w-full h-full ${
      isFreindList 
        ? "border-green-500 border-2"  
        : "border-gray-500 border-2"   
    } ${roomInfo.room.owner === person.uid ? 'bg-yellow-900/40' : 'bg-gray-800'}  
    inline-block rounded p-1 relative`}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={() => setShowOptions(false)}
  >
    <div className="w-full h-full relative">
      <div
        className="h-full w-full relative rounded bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `url(${person.userDetails.image})`,
          backgroundSize: '38% 54%'
        }}
      >
        {/* Name tag */}
        <div className="absolute left-0 bottom-0 bg-black/60 text-white px-2 py-1 rounded text-[10px]">
          {person.userDetails.name}
        </div>

        {/* Host badge */}
        {roomInfo.room.owner === person.uid && (
          <div className="absolute right-0 top-0 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold shadow-md">
            Host
          </div>
        )}

        {/* Follow / Unfollow Quick Action */}
        {LoginUser.uid !== person.uid && (
          isFollowing ? (
            <div
              onClick={() => handleUnFollow(person.uid)}
              className="select-none cursor-pointer absolute right-0 bottom-0 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm shadow-md"
              title="Unfollow"
            >
              <FaHeartBroken />
            </div>
          ) : (
            <div
              onClick={() => handleFollow(person.uid)}
              className="select-none cursor-pointer absolute right-0 bottom-0 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm shadow-md"
              title="Follow"
            >
              <FaHeart />
            </div>
          )
        )}

        {/* Floating menu (appears on hover) */}
        {showOptions && (
          <div
            className="absolute bg-gray-900/90 backdrop-blur-sm text-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-fadeIn"
          >
            {LoginUser.uid !== person.uid && (
              isFollowing ? (
                <button
                  onClick={() => handleUnFollow(person.uid)}
                  className="px-3 py-1 hover:bg-red-600 text-sm"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(person.uid)}
                  className="px-3 py-1 hover:bg-blue-600 text-sm"
                >
                  Follow
                </button>
              )
            )}

            {LoginUser.uid === roomInfo.room.owner && (
              <>
                <button
                  className="px-3 py-1 hover:bg-red-600 text-sm"
                  onClick={() => handleRemovePerson(person.userDetails.name)}
                >
                  Remove
                </button>
                <button
                  className="px-3 py-1 hover:bg-purple-600 text-sm"
                  onClick={handleTransferOwnership}
                >
                  Transfer Ownership
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);


}

export default RoompeopleBox

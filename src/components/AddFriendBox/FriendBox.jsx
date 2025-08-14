import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { db } from "../../utils/firebase"
import { useLogin } from "../../contexts/LoginCreadentialContext"
import { toast } from "react-toastify"


const FriendBox = ({ member, isFriend, communityId, ownerId, following}) => {
    
    const { LoginData } = useLogin()
  
    const handleRemoveFriend = async () => {
      if(ownerId !== LoginData.uid) {
        alert("You are not the owner of this community, you can't remove members.")
        return
      } 
      try {
        const communityRef = doc(db, 'community', communityId)
        const userRef = doc(db, 'users', member.id)
  
        // Remove user from community's members list
        await updateDoc(communityRef, {
          joinedUsers: arrayRemove(member.id)
        })
  
        // Remove community from user's joined list
        await updateDoc(userRef, {
          community: arrayRemove(communityId)
        })
      } catch (error) {
        toast.error("Error removing member from community")
      }
    }
    
    const handleTransferHost = async () => {
      if(ownerId !== LoginData.uid) {
        alert("You are not the owner of this community, you can't transfer host.")
        return
      } 
      const confirm = window.confirm(`Are you sure you want to transfer host to ${member.name}?`);
      if (!confirm) return;
  
      try {
        const communityRef = doc(db, 'community', communityId);
        await updateDoc(communityRef, {
          owner: member.id
        });
      } catch (error) {
        toast.error("Error transferring host")
      }
    };
    
    const handleUnfollow = async (e) => {
        e.stopPropagation(); // Prevent default behavior of the button
        
        try {
          const currentUserRef = doc(db, 'users', LoginData.uid);
          const friendUserRef = doc(db, 'users', member.id);
      
          // Remove from current user's following
          await updateDoc(currentUserRef, {
            following: arrayRemove(member.id),
          });
      
          // Remove from friend's followers
          await updateDoc(friendUserRef, {
            followers: arrayRemove(LoginData.uid),
          });
        } catch (error) {
        toast.error("Error unfollowing user")
        }
      };
      
      const handleFollow = async (e) => {
        e.stopPropagation(); // Prevent default behavior of the button
      
        try {
          const currentUserRef = doc(db, 'users', LoginData.uid);
          const friendUserRef = doc(db, 'users', member.id);
      
          // Add to current user's following list
          await updateDoc(currentUserRef, {
            following: arrayUnion(member.id),
          });
      
          // Add to friend's followers list
          await updateDoc(friendUserRef, {
            followers: arrayUnion(LoginData.uid),
          });
        } catch (error) {
          toast.error("Error following user")
        }
      };
      
    return (
      <div
        className={`flex flex-row items-center justify-between p-2 rounded-lg transition-all w-full
          ${isFriend ? 'bg-blue-900' : 'bg-gray-700'}
        `}
      >
        <div className="flex flex-row items-center">
          <img src={member.image || '/default-avatar.png'} alt={member.name}
            className="w-10 h-10 rounded-full mr-2" />
            <span 
            title={member.name}
            className="text-white text-[13px]
            px-2 py-1 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {member.name}
          </span>
          
        </div>
        
        {
            LoginData.uid !== member.id ? (
                <div className="">
                {following ? (
                  <span
                    className='text-red-300 text-sm ml-1 cursor-pointer select-none'
                    onClick={handleUnfollow}
                  >
                    unfollow
                  </span>
                ) : (
                  <span
                    className='text-green-500 text-sm mr-1 cursor-pointer select-none'
                    onClick={handleFollow}
                  >
                    follow
                  </span>
                )}
                
                {
                    ownerId ==  LoginData.uid && (
                      <span className='text-red-300 text-sm ml-1 cursor-pointer select-none'
                      onClick={handleRemoveFriend}>remove</span>
                    )
                }
                
                {
                  ownerId ==  LoginData.uid && (
                    <span className='text-green-400 text-sm ml-2 cursor-pointer select-none'
                    onClick={handleTransferHost}>Host</span>
                  )
                }
                </div>
            ):<div className="text-white">You</div>
        }
      </div>
    )
  }

export default FriendBox
import { useCommunity } from "../../contexts/CommunityContext"
import { IoSettingsOutline } from "react-icons/io5";
import { useLogin } from "../../contexts/LoginCreadentialContext";
import { arrayRemove, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { toast } from "react-toastify";

const CommunityBox = ({ items, setComSetting, comSetting, setAddFriend, setAddFriendComId }) => {
    const { selectedCommunity, setSelectedCommunity } = useCommunity()
    const { LoginData } = useLogin()

    const handleShowsetting = (e) => {
        e.stopPropagation()
        setComSetting(prev => prev == items.id ? null : items.id)
    }

    const handleSelectCommunity = (e) => {
        e.stopPropagation()
        setSelectedCommunity(prev => ({ ...prev, id: items.id, name: items.name }))
    }

    const handleAddFriendShow = (e) => {
        e.stopPropagation()
        setAddFriendComId(items.id)
        setAddFriend(true)
        setComSetting(null)
    }
    
    const handleLeaveCommunity = async (e) => {
        e.stopPropagation()
        try {
          const communityRef = doc(db, 'community', items.id);
          const communitySnap = await getDoc(communityRef);
      
          if (!communitySnap.exists()) return toast.error("Community not found.");
      
          const communityData = communitySnap.data();
      
          // 1. Check if current user is the owner
          const isOwner = communityData.owner === LoginData.uid;
      
          if (isOwner) {
            // Prevent direct leave
            return toast.error("You cannot leave the community as an owner. Please transfer ownership or delete the community.");
            
          }
      
          // 2. If not owner, remove user from community
          const updatedJoinedUsers = (communityData.joinedUsers || []).filter(uid => uid !== LoginData.uid);
      
          await updateDoc(communityRef, {
            joinedUsers: updatedJoinedUsers
          });
      
          // 3. Remove community from user's data
          const userRef = doc(db, 'users', LoginData.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
      
          const updatedUserCommunities = (userData.community || []).filter(id => id !== items.id);
      
          await updateDoc(userRef, {
            community: updatedUserCommunities
          });
      
          toast.success("Successfully left the community.");
      
        } catch (error) {
          toast.error("Failed to leave the community.");
        }
      };
      
      const handleDeleteCommunity = async (communityId) => {
        try {
          const communityRef = doc(db, 'community', communityId);
          const communitySnap = await getDoc(communityRef);
      
          if (!communitySnap.exists()) {
            return toast.error("Community not found.");
          }
      
          const communityData = communitySnap.data();
      
          // 1. Ownership Check
          if (communityData.owner !== LoginData.uid) {
            return toast.error("You are not the owner of this community.");
          }
      
          // 2. Get joined users
          const joinedUsers = communityData.joinedUsers || [];
      
          // 3. Remove communityId from each joined user's 'community' array
          const batch = writeBatch(db);
      
          for (const userId of joinedUsers) {
            const userRef = doc(db, 'users', userId);
            batch.update(userRef, {
              community: arrayRemove(communityId)
            });
          }
      
          // 4. Also remove from owner's record (optional cleanup)
          const ownerRef = doc(db, 'users', LoginData.uid);
          batch.update(ownerRef, {
            community: arrayRemove(communityId)
          });
      
          // 5. Delete the community
          batch.delete(communityRef);
      
          // 6. Commit batch
          await batch.commit();
      
          toast.success("Community deleted successfully.");
        } catch (error) {
          toast.error("Failed to delete community.");
        }
      };
      
      
    return (
        <div
            onClick={(e) => handleSelectCommunity(e)}
            className={`w-full h-[60px] relative cursor-pointer rounded p-2 text-white flex justify-between items-center p-1
        ${selectedCommunity.id === items.id ? 'bg-blue-800' : 'bg-gray-800'}`}>
            <div className="">
                {items.name}
            </div>
            <div
                className="relative top-[-10px] text-[18px]"
                onClick={handleShowsetting}
            ><IoSettingsOutline /></div>

            {
                (comSetting == items.id) && (<div
                    className="select-none w-[130px] 
                z-[999] rounded bg-gray-800 flex flex-col justify-center items-center 
                absolute top-8 right-3 ">


                    <button
                        className="p-2 w-full h-full cursor-pointer"
                        onClick={handleAddFriendShow}>See</button>

                    <button 
                    className="p-2 w-full h-full text-red-600 cursor-pointer"
                    onClick={handleLeaveCommunity}
                    >Leave</button>

                   {items.owner === LoginData.uid && (<button 
                   className="p-2 w-full h-full text-red-600 cursor-pointer"
                   onClick={() => handleDeleteCommunity(items.id)}
                   >Delete</button>)}
                </div>)
            }
        </div>


    )
}
export default CommunityBox
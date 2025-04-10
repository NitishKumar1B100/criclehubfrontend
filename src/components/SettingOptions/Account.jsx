import { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import Loadingscreen from "../LoadingScr/Loadingscreen";

function Account() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white">
                <Loadingscreen />
            </div>
        );
    }

    const { name, image, followers = [], following = [], community = [] } = userData;

    // Mutuals = friend count = users who follow each other
    const friendCount = followers.filter((follower) => following.includes(follower)).length;

    return (
        <div className="w-full h-full p-4 text-white flex flex-col">
          {/* Profile Card */}
          <div className="w-full h-full  max-h-[350px] bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col lg:flex-row items-center gap-6 relative">
            
            {/* Since text */}
            <div className="absolute top-2 right-4 text-[12px] text-gray-400">
              Since:
            </div>
   
      
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={image}
                alt="Profile"
                className="w-42 h-42 rounded-full border-4 border-gray-600"
              />
            </div>
      
            {/* Info Area */}
            <div className="flex-1 w-full">
              <h2 className="text-xl font-semibold text-center lg:text-left">{name}</h2>
      
              {/* Stats Section */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 w-full mt-6 text-[12px] sm:text-base">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="font-bold">{followers.length}</span>
                  <span className="text-gray-300">Followers</span>
                </div>
                <div className="flex flex-col items-center min-w-[20px] sm:min-w-[80px]">
                  <span className="font-bold">{following.length}</span>
                  <span className="text-gray-300">Following</span>
                </div>
                <div className="flex flex-col items-center min-w-[20px] sm:min-w-[80px]">
                  <span className="font-bold">{friendCount}</span>
                  <span className="text-gray-300">Friends</span>
                </div>
                <div className="flex flex-col items-center min-w-[20px] sm:min-w-[80px]">
                  <span className="font-bold">{community.length}</span>
                  <span className="text-gray-300">Community</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className=""></div>
        </div>
      );
      
}

export default Account;

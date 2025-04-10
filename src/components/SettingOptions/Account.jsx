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
                <Loadingscreen/>
            </div>
        );
    }

    const { name, image, followers = [], following = [], community = [] } = userData;

    // Mutuals = friend count = users who follow each other
    const friendCount = followers.filter((follower) => following.includes(follower)).length;

    return (
        <div className="w-full h-full p-4 text-white">
            {/* Profile Card */}
            <div className="w-full h-fullmax-w-md bg-gray-800 rounded-xl p-6 shadow-lg flex 
            flex-col items-center gap-3 relative lg:flex-row">
                <div className="w-full h-[50px] p-2 text-right absolute top-0 right-0">
                    Since: 
                </div>
                <div className="">
                    <img
                        src={image}
                        alt="Profile"
                        className="w-54 h-54 rounded-full border-4 border-gray-600 mb-4"
                    />
                </div>

                <div className="">
                    <h2 className="w-full text-xl font-semibold text-center lg:text-left">{name}</h2>
                    {/* Stats */}
                    <div className="flex justify-around gap-5 w-full mt-6 text-sm sm:text-base">
                        <div className="flex flex-col items-center">
                            <span className="font-bold">{followers.length}</span>
                            <span>Followers</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold">{following.length}</span>
                            <span>Following</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold">{friendCount}</span>
                            <span>Friends</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <span className="font-bold">{community.length}</span>
                            <span>Community</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;

import { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import Loadingscreen from "../LoadingScr/Loadingscreen";
import { toast } from "react-toastify";

function Account() {
  const [userData, setUserData] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true)
  const [userloader, setUserLoader] = useState(false)
  
  const [contentType, setContentType] = useState('')

  useEffect(() => {
    
      const fetchUserData = async () => {
        try{
        const user = auth.currentUser;
        if (!user) return;
  
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
    
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }else{
            toast.error("Account: user id doesn't exit")
          }

      }catch(err){
        toast.error("Account: Coudn't load the data.")
      }
      };
  
      fetchUserData();
 
  }, []);

  if (!userData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
      </div>
    );
  }

  const { name, image, followers = [], following = [], community = [], uid, since } = userData;

  const friendList = followers.filter((f) => following.includes(f));

  // Handles click on section (followers, following, etc.)
  const handleSectionClick = async (type) => {
    setLoading(false)

    try{
      setSelectedSection(type);
      let searchType = 'users'
      let ids = [];
  
      if (type === "followers") ids = followers;
      else if (type === "following") ids = following;
      else if (type === "friends") ids = friendList;
      else if (type === "community") {
        setDisplayData(community);
        searchType = 'community'
        ids = community
      }
      setContentType(type)
      let data = []
      for (let id of ids) {
          const docRef = doc(db, searchType, id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            if (searchType === 'community') {
              const { name } = docSnap.data();
              data.push(name); // just push name string for community
            } else {
              const { name, image } = docSnap.data();
              data.push({ name, image }); // push full object for users
            }
          }
        }
  
      setDisplayData(data);
    }catch(err){
    toast.error(`Account: Failed to fetch ${type}`)
    }
    setLoading(true)
  };

  return (

<div className="w-full h-[calc(100vh-110px)] text-white flex flex-col overflow-auto hidesilder">
{/* Profile Card */}
<div className="w-full bg-gray-800 rounded-xl shadow-lg flex flex-col p-3 lg:flex-row items-center gap-6 relative">
  {/* Since text */}
  <div className="absolute top-2 right-4 text-[12px] text-gray-400">{since}</div>

  {/* Profile Image */}
  <div className="flex-shrink-0">
    <img src={image} alt="Profile" className="w-42 h-42 rounded-full border-4 border-gray-600" />
  </div>

  {/* Info Area */}
  <div className="flex-1 w-full">
    <h2 className="text-xl text-center font-semibold lg:text-left">
      {name}
      <br />
      <span className="text-[9px] text-gray-400">{uid}</span>
    </h2>

    {/* Stats Section */}
    <div className="select-none flex flex-wrap justify-center lg:justify-start gap-6 w-full mt-6 text-[12px] sm:text-base">
      <div onClick={() => handleSectionClick("followers")} className="cursor-pointer flex flex-col items-center min-w-[80px] hover:text-yellow-300">
        <span className="font-bold">{followers.length}</span>
        <span className="text-gray-300">Followers</span>
      </div>
      <div onClick={() => handleSectionClick("following")} className="cursor-pointer flex flex-col items-center min-w-[80px] hover:text-yellow-300">
        <span className="font-bold">{following.length}</span>
        <span className="text-gray-300">Following</span>
      </div>
      <div onClick={() => handleSectionClick("friends")} className="cursor-pointer flex flex-col items-center min-w-[80px] hover:text-yellow-300">
        <span className="font-bold">{friendList.length}</span>
        <span className="text-gray-300">Friends</span>
      </div>
      <div onClick={() => handleSectionClick("community")} className="cursor-pointer flex flex-col items-center min-w-[80px] hover:text-yellow-300">
        <span className="font-bold">{community.length}</span>
        <span className="text-gray-300">Community</span>
      </div>
    </div>
  </div>
</div>
      {/* Notice */}
      <div className="mt-6 w-full bg-yellow-100 text-yellow-800 text-sm p-4 rounded-lg border border-yellow-300">
        <strong className="font-semibold">Heads up!</strong> If you want to change your name, please update your name in your Google Account first, then re-login here to see the change.
      </div>

      {/* Display Data */}
      <div className="mt-6 bg-gray-800 rounded-xl p-4 ">
      {loading ? (selectedSection && (
  <>
    <h3 className="text-lg font-semibold mb-4 capitalize text-white">{selectedSection}</h3>
    <div className="flex flex-wrap gap-4  overflow-y-auto scrollbar-hide">
      {displayData.length > 0 ? (
        selectedSection === "community" ? (
          displayData.map((com, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg shadow-md text-white min-w-[120px] text-center">
              {com}
            </div>
          ))
        ) : (
          displayData.map((user, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg shadow-md flex items-center gap-3 min-w-[200px]">
              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border border-gray-500" />
              <span>{user.name}</span>
            </div>
          ))
        )
      ) : (
        <p className="text-gray-400">No {contentType}.</p>
      )}
    </div>
  </>
)) : (<Loadingscreen/>)}

      </div>
    </div>
  );
}

export default Account;

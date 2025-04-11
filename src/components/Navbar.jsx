import { NavLink } from "react-router-dom";
import { auth, logout } from "../utils/firebase";
import { useEffect, useState } from "react";
import { useLogin } from "../contexts/LoginCreadentialContext";
import { onAuthStateChanged } from "firebase/auth";
import Login from "../components/Login/Login";
import { toast } from "react-toastify";
import { useDashboard } from "../contexts/DashboardLeftcontext";
import { usePhoneChat } from "../contexts/PhoneChatContext";
import { useCurrentSettings } from "../contexts/CurrentSettingsContext";

function Navbar() {

  const { LoginData, setLoginData } = useLogin()
  const [imageUrl, setImageUrl] = useState('')
  const { setActiveOption } = useDashboard();
  const {setSelectedPhoneChat} = usePhoneChat()
  const {  setSelectedCurrentSettings } = useCurrentSettings();

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          const providerInfo = currentUser.providerData.find(
            (provider) => provider.providerId === "google.com"
          );
          if (providerInfo) {
            setImageUrl(providerInfo.displayName);
          }
          setLoginData(currentUser);
        } else {
          // User is logged out
          setImageUrl('');
          setLoginData(null);
        }
      },
      (error) => {
        toast.error("Failed to track authentication state.");
      }
    );
  
    return () => unsubscribe();
  }, []);
  
  
  const handleShowTheAccount = () => {
    setActiveOption('settings')
    setSelectedPhoneChat(false)
    setSelectedCurrentSettings({ type: 'account'})
    
  }
  
  
  return (
    <div className="w-screen h-[60px] bg-gray-800 ">
      <div className="w-full h-full">
        <div className="flex justify-between items-center h-full @container">
          <div className="text-white font-bold text-[28px] p-2 ">CircleHub</div>
          <div className=" w-[160px] flex justify-between items-center text-white ">
            <div className="p-1 ">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-blue-400 font-bold" : "text-white"
                }
              >
                Dashboard
              </NavLink>
            </div>

            <span className="text-[25px] mb-1">/</span>

            <div className="p-1">
              <NavLink
                to="/room"
                className={({ isActive }) =>
                  isActive ? "text-blue-400 font-bold" : "text-white"
                }
              >
                Rooms
              </NavLink>
            </div>
          </div>
          {!LoginData ? (<Login />)
          :( <div
    
            className="relative w-[50px] h-[50px] mr-8 border border-white rounded-full cursor-pointer overflow-hidden"
            onClick={ handleShowTheAccount}
            >
            <img src={LoginData.photoURL ? LoginData.photoURL : ''} 
            className="w-full h-full" 
            referrerPolicy="no-referrer"
            onError={(e) => (e.target.src = "/fallback-image.png")}
            alt="" />
          </div>)}
        </div>
      </div>
    </div>
  );
}

export default Navbar;

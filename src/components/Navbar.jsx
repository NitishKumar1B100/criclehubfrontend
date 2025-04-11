import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { useEffect} from "react";
import { useLogin } from "../contexts/LoginCreadentialContext";
import { onAuthStateChanged } from "firebase/auth";
import Login from "../components/Login/Login";
import { toast } from "react-toastify";
import { useDashboard } from "../contexts/DashboardLeftcontext";
import { usePhoneChat } from "../contexts/PhoneChatContext";
import { useCurrentSettings } from "../contexts/CurrentSettingsContext";


import { MdDashboard, MdMeetingRoom } from "react-icons/md";

function Navbar() {

  const { LoginData, setLoginData } = useLogin()
  const { setActiveOption } = useDashboard();
  const {setSelectedPhoneChat} = usePhoneChat()
  const {  setSelectedCurrentSettings } = useCurrentSettings();
  
  const navigate = useNavigate();


  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          setLoginData(null);
          setSelectedPhoneChat(false);
          return;
        }
        setLoginData(currentUser);
      },
      (error) => {
        toast.error("Failed to track authentication state.");
      }
    );
  
    return () => unsubscribe();
  }, []);
  
  
  
  const handleShowTheAccount = () => {
    setActiveOption('settings');
    setSelectedPhoneChat(false);
    setSelectedCurrentSettings({ type: 'account' });
    setSelectedPhoneChat(true);
    
    // Navigate to /room
    navigate('/');
  };
  
  
  
  return (
    <div className="w-screen h-[50px] bg-gray-800 sm:h-[60px]">
  <div className="w-full h-full">
    <div className="flex justify-between items-center h-full px-4">

      {/* Logo */}
      <div className="text-white font-bold text-[22px] sm:text-[28px] p-2">
        <span className="hidden sm:block" onClick={() => navigate('/')}>CircleHub</span>
      </div>

      {/* Nav Links */}
      <div className={`${!LoginData ? 'w-[50%]':'w-[100%]'} flex items-center text-white justify-between sm:gap-0 sm:w-0  `}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-1 p-1 ml-4 ${isActive ? "text-blue-400 font-bold" : "text-white"}`
          }
        >
          <MdDashboard className="text-[27px] sm:hidden" />
          <span className="hidden sm:inline">Dashboard</span>
        </NavLink>

        <span className="text-[20px] hidden sm:block">/</span>

        <NavLink
          to="/room"
          className={({ isActive }) =>
            `flex items-center gap-1 p-1 mr-4 ${isActive ? "text-blue-400 font-bold" : "text-white"}`
          }
        >
          <MdMeetingRoom className="text-[27px] sm:hidden" />
          <span className="hidden sm:inline">Rooms</span>
        </NavLink>
        {
          LoginData && (
            <div
            className="relative w-[42px] h-[42px] border border-white rounded-full 
            cursor-pointer overflow-hidden bg-cover bg-contain sm:hidden"
            onClick={handleShowTheAccount}
            style={{backgroundImage:`url(${LoginData.photoURL || ""})`}}
            
          > </div>
          )
        }
        
      </div>

      {/* Profile / Login */}
      {!LoginData ? (
        <Login />
      ) : (
        <div
          className="relative w-[42px] h-[42px] border border-white rounded-full 
          cursor-pointer overflow-hidden bg-cover bg-contain hidden sm:block"
          onClick={handleShowTheAccount}
          style={{backgroundImage:`url(${LoginData.photoURL || ""})`}}
          
        > </div>
      )}
    </div>
  </div>
</div>

  );
}

export default Navbar;

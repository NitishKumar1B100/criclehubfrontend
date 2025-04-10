import { NavLink } from "react-router-dom";
import { auth, logout } from "../utils/firebase";
import { useEffect, useState } from "react";
import { useLogin } from "../contexts/LoginCreadentialContext";
import { onAuthStateChanged } from "firebase/auth";
import Login from "../components/Login/Login";
import { toast } from "react-toastify";



const  Logout = ({setShowDetails, LoginData, showDetails, handleLogout}) => {
  return(
    <div>
    <div

      className="relative w-[50px] h-[50px] mr-8 border border-white rounded-full cursor-pointer overflow-hidden"
      onClick={() => setShowDetails(prev => !prev)}>
      <img src={LoginData.photoURL ? LoginData.photoURL : ''} 
      className="w-full h-full" 
      referrerPolicy="no-referrer"
      onError={(e) => (e.target.src = "/fallback-image.png")}
      alt="" />
    </div>
    <div className="">
      {showDetails && (
        <div className="absolute bg-gray-600 right-[-30px] top-[47px] transform -translate-x-1/2 mt-2 text-white p-3 rounded shadow-lg flex flex-col items-center">
          <span className="text-sm">{LoginData.displayName ? LoginData.displayName : ''}</span>
          <button
            onClick={handleLogout}
            className="mt-2 px-3 cursor-pointer py-1 bg-red-500 text-white rounded text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
  )
}


function Navbar() {

  const { LoginData, setLoginData } = useLogin()
  const [showDetails, setShowDetails] = useState(false);


  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to log out. Please try again.");
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setLoginData(currentUser);
      },
      (error) => {
        toast.error("Failed to track authentication state.");
      }
    );
  
    return () => unsubscribe();
  }, []);
  
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
          :(<Logout setShowDetails={setShowDetails} LoginData={LoginData} 
          showDetails={showDetails} handleLogout={handleLogout}/>)}
        </div>
      </div>
    </div>
  );
}

export default Navbar;

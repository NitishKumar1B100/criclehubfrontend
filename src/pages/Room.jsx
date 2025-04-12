import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle } from "../utils/firebase";
import Chat from "../components/RoomChat/Chat";
import { toast } from "react-toastify";
import { useLogin } from "../contexts/LoginCreadentialContext";
import ClickToStart from "../components/RoomChat/ClickToStart";
import RoomNotFound from "./RoomNotFound";
import LoginPage from "./Login";

const Room = () => {
  const { id } = useParams();
  const [roomExists, setRoomExists] = useState(false); // null = loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState({ name: '', img: '' })
  const [isLoading, setIsLoading] = useState(true)

  const { setLoginData } = useLogin()

  useEffect(() => {
    const checkUserLogined = async () => {

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setIsLoggedIn(true);
          setUsername(currentUser)
          setLoginData(currentUser)

          const googleProfile = currentUser.providerData.find(
            (provider) => provider.providerId === "google.com"
          );
          if (googleProfile) {
            setCurrentUserInfo({
              name: googleProfile.displayName || '',
              img: currentUser.photoURL || '',
            });
          }

          checkRoomExists()
        } else {
          setIsLoggedIn(false);

          setIsLoading(false)
        }
      })

      return () => unsubscribe();
    };

    const checkRoomExists = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/rooms/${id}`);
        const data = await response.json();
        setRoomExists(data.exists);
        setRoomData(data.roomData);

        setIsLoading(false)
      } catch (error) {

        setIsLoading(false)
        toast.error("Error checking room.");
        setRoomExists(false);
      }
    };

    checkUserLogined();
  }, []);


  if (isLoading) return (<div className="flex items-center justify-center h-screen w-full">
    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>); // Show loading while checking login

  if (!isLoggedIn) return (<LoginPage/>);


  if (!roomExists) return <RoomNotFound/>; // Room doesn't exist

  return (<ClickToStart currentUserInfo={currentUserInfo} roomData={roomData}>
    <Chat roomId={id} userId={username} roomInfo={roomData} currentUserInfo={currentUserInfo} />
  </ClickToStart>); // Render chat if room exists
};

export default Room;
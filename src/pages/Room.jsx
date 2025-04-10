import { useEffect, useState } from "react";
import {useParams } from "react-router-dom"; 
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle } from "../utils/firebase";
import Chat from "../components/RoomChat/Chat";
import { toast } from "react-toastify";

const Room = () => {
  const { id } = useParams();
  const [roomExists, setRoomExists] = useState(false); // null = loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const checkUserLogined = async () => {
        
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setIsLoggedIn(true);
            setUsername(currentUser)
            checkRoomExists()
          } else {
            setIsLoggedIn(false);
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
      } catch (error) {
        toast.error("Error checking room.");
        setRoomExists(false);
      }
    };

    checkUserLogined();
  }, []);
  
  const handleLogin = async () => {
    try{
      await signInWithGoogle();
    }catch(err){
      toast.error("Login failed please try again.")
    }
  }

  if (isLoggedIn === null) return <p>Loading...</p>; // Show loading while checking login
  if (!isLoggedIn) {
    return (
      <div className="text-center mt-10 bg-gray-800">
        <p className="text-red-500">You need to log in to access this room.</p>
        <button onClick={handleLogin} className="cursor-pointer outline-none border-none w-[200px] mt-4 px-4 py-2 bg-blue-800 text-white rounded">
          Login
        </button>
      </div>
    );
  }

  if (roomExists === null) return <p>Loading...</p>; // Show loading state
  if (!roomExists) return <p className="text-red-500 text-center mt-10">Room not found</p>; // Room doesn't exist

  return <Chat roomId={id} userId={username} roomInfo={roomData}/>; // Render chat if room exists
};

export default Room;
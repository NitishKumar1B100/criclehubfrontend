import { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { auth } from "../utils/firebase"; // Import Firebase Auth
import { toast } from "react-toastify";
import { useLogin } from "../contexts/LoginCreadentialContext";
import Loadingscreen from "./LoadingScr/Loadingscreen";

const CreateRoom = ({ setFormPopUp }) => {
      const { LoginData } = useLogin()
    
      
      const [loading, setLoading] = useState(false)
      
      useEffect(()=>{
        if(!LoginData){
          setFormPopUp(false);
        }
      },[LoginData])
  
  const [formData, setFormData] = useState({
    topic: "",
    language: "English",
    level: "Beginner",
    size: 2,
  });

  const user = auth.currentUser; // Get the current authenticated user

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!user) {
      toast.error("You are not logged in");
      return;
    }
  
    try {
      // Ensure the formData contains `roomName` and `size`
      setLoading(true)
      if (!formData.size) {
        toast.error(`Room name and size are required`);
        return;
      }
  
      const roomData = {
        room:{...formData, owner: user.uid,joinedUsers: []},
        createdBy: {uid: user.uid, createdAt: new Date().toISOString()},
      };
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });
  
      //const result = await response.json();
      if (response.ok) {
        setFormPopUp(false);
        setLoading(false)
      } else {
        toast.error("Error creating room");
      }
    } 
    
    catch (error) {
      toast.error("Error creating room");
    }
  };
  
  

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#000000af] text-white"
      onClick={() => setFormPopUp(false)}
    >
      <div
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-[50px] flex items-center justify-between">
          <h2 className="text-2xl font-semibold mb-4">{loading ? <Loadingscreen/> : 'Create a Room'}</h2>
          <button
            className="text-3xl cursor-pointer"
            onClick={() => setFormPopUp(false)}
          >
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Discussion Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Enter your discussion topic"
              className="w-full p-2 border border-gray-500 rounded-lg bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full p-2 border border-gray-500 rounded-lg bg-gray-700"
            >
              <option value="English">English</option>
              <option value="Spanish">Hindi</option>
              <option value="French">Urdu</option>
              <option value="German">Punjabi</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Language Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2 border border-gray-500 rounded-lg bg-gray-700"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Room Size</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              min="2"
              max="100"
              className="w-full p-2 border border-gray-500 rounded-lg bg-gray-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            <FaLock size={16} />
            Create Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;

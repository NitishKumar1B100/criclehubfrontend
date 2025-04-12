import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { usePhoneChat } from '../contexts/PhoneChatContext';
import { useLogin } from '../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';

function WithNavbarLayout() {
  
  const {setSelectedPhoneChat} = usePhoneChat()    
  const {setLoginData } = useLogin()
  
  const [isloading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          setLoginData(null);
          setSelectedPhoneChat(false);
          setLoading(false)
          return;
        }
        setLoginData(currentUser);
        setLoading(false)
      },
      (error) => {
        setLoading(false)
        toast.error("Failed to track authentication state.");
      }
    );
  
    return () => unsubscribe();
  }, []);
  
  
  
  if (isloading) return(<div className="flex items-center justify-center h-screen w-full">
    <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
  )
  
  
  return (
    <div className='flex flex-col-reverse sm:flex-col'>
        <Navbar/>
        <Outlet/>
    </div>
  )
}

export default WithNavbarLayout
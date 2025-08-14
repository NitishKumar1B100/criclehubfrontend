import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { usePhoneChat } from '../contexts/PhoneChatContext';
import { useLogin } from '../contexts/LoginCreadentialContext';
import { toast } from 'react-toastify';
import { doc, onSnapshot } from 'firebase/firestore';
import { useBanned } from '../contexts/BannedContext';

function WithNavbarLayout() {
  const { setSelectedPhoneChat } = usePhoneChat();
  const { setLoginData } = useLogin();
  const [isloading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setSelectedBanned } = useBanned();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setLoginData(null);
          setSelectedPhoneChat(false);
          setLoading(false);
          return;
        }

        // Subscribe to user document in real-time
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeSnapshot = onSnapshot(
          userRef,
          (userSnap) => {
            if (!userSnap.exists()) {
              setLoginData(null);
              setSelectedPhoneChat(false);
              setLoading(false);
              toast.error("User data not found.");
              return;
            }

            const userData = { uid: currentUser.uid, ...userSnap.data() };

            if (userData.banned) {
              toast.error("You are banned from this platform. Please contact support.");
              setSelectedBanned(userData);
              setLoginData(null);
              setSelectedPhoneChat(false);
              setLoading(false);
              navigate("/banned");
              return;
            }

            setLoginData(userData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching real-time user data:", error);
            setLoginData(null);
            setSelectedPhoneChat(false);
            setLoading(false);
            toast.error("Failed to fetch real-time user data.");
          }
        );
      },
      (error) => {
        setLoading(false);
        toast.error("Failed to track authentication state.");
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (isloading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse sm:flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default WithNavbarLayout;

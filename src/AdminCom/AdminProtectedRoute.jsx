import { createContext, useContext, useEffect, useState } from "react";
import Adminlayout from "./adminLayout/Adminlayout";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";

// Create Context
const AdminContext = createContext();

// Hook for using the context
export const useAdminData = () => useContext(AdminContext);

function AdminProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);

  // Realtime counts
  const [stats, setStats] = useState({
    usersCount: 0,
    communityCount: 0,
    activeRoomsCount: 0,
    reportsCount: 0, // placeholder for now
  });

  useEffect(() => {
    let unsubUsers = null;
    let unsubCommunity = null;
    let unsubRooms = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Check admin privileges
          const adminDocRef = doc(db, "admin", user.uid);
          const adminSnap = await getDoc(adminDocRef);

          if (adminSnap.exists() && adminSnap.data().isAdmin === true) {
            setIsAdmin(true);
            setError("");

            // Fetch admin details from `users` collection
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);


            if (userSnap.exists()) {
              setAdminData(userSnap.data());
            } else {
              setAdminData(null);
              toast.error("No user data found.");
            }

            // Set up realtime listeners
            unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
              setStats((prev) => ({ ...prev, usersCount: snapshot.size }));
            });

            unsubCommunity = onSnapshot(collection(db, "community"), (snapshot) => {
              setStats((prev) => ({ ...prev, communityCount: snapshot.size }));
            });

            unsubRooms = onSnapshot(collection(db, "rooms"), (snapshot) => {
              setStats((prev) => ({ ...prev, activeRoomsCount: snapshot.size }));
            });
          } else {
            setIsAdmin(false);
            setError("You do not have admin privileges.");
          }
        } else {
          setIsAdmin(false);
          setError("You are not logged in.");
        }
      } catch (err) {
        setIsAdmin(false);
        setError("Error checking admin privileges. Please try again later.");
      } finally {
        setLoading(false); // ✅ Always runs
      }
    });

    // Cleanup: unsubscribe from everything
    return () => {
      unsubscribeAuth();
      if (unsubUsers) unsubUsers();
      if (unsubCommunity) unsubCommunity();
      if (unsubRooms) unsubRooms();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white flex justify-center items-center h-screen">
        <h1 className="text-xl">{error}</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 w-screen h-screen">
      <AdminContext.Provider value={{ adminData, isAdmin, stats }}>
        <Adminlayout adminData={adminData}>
          <Outlet />
        </Adminlayout>
      </AdminContext.Provider>
    </div>
  );
}

export default AdminProtectedRoute;

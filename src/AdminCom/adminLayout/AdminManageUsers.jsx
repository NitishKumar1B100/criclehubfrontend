import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { FiSettings, FiUsers, FiUserPlus, FiUserCheck } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { db } from "../../utils/firebase";
import UserDetailModal from "./components/UserDetailModal";
import { useNavigate, useParams } from "react-router-dom";

function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { uid } = useParams(); // user id from URL

  // Get the selected user from UID in URL
  const selectedUser = users.find((u) => u.uid === uid) || null;

  // Realtime listener for users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // Get friends (mutual followers)
  const getFriends = (user) => {
    if (!user?.following || !user?.followers) return [];
    return user.following.filter((id) => user.followers.includes(id));
  };

  // Get user data by UID
  const getUserById = (id) => users.find((u) => u.uid === id);

  return (
    <div className="hidesilder w-full p-4 sm:p-6 text-white overflow-y-auto">
      {/* User list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const friends = getFriends(user);
          return (
            <div
              key={user.uid}
              className="bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition relative"
            >
              <img
                src={user.image}
                alt={user.name}
                className="w-16 h-16 rounded-full border border-gray-600 object-cover"
              />
              <h2 className="mt-2 font-semibold">{user.name}</h2>
              <p className="text-gray-400 text-sm">Joined {user.since}</p>

              {/* Stats */}
              <div className="flex gap-4 mt-3 text-sm flex-wrap justify-center">
                <span className="flex items-center gap-1 hover:text-blue-400">
                  <FiUsers /> {user.followers?.length || 0}
                </span>
                <span className="flex items-center gap-1 hover:text-blue-400">
                  <FiUserPlus /> {user.following?.length || 0}
                </span>
                <span className="flex items-center gap-1 hover:text-blue-400">
                  <FiUserCheck /> {friends.length}
                </span>
                <span className="flex items-center gap-1 hover:text-blue-400">
                  <FaUsers /> {user.community?.length || 0}
                </span>
              </div>

              {/* Settings Button */}
              <button
                onClick={() => navigate(`/admin/users/${user.uid}`)}
                className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 transition"
              >
                <FiSettings size={20} />
              </button>
            </div>
          );
        })}
      </div>

      {/* User detail modal (controlled by URL) */}
      {selectedUser && (
        <UserDetailModal
          selectedUser={selectedUser}
          getUserById={getUserById}
          setSelectedUser={() => navigate("/admin/users")}
          getFriends={getFriends}
        />
      )}
    </div>
  );
}

export default AdminManageUsers;

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { FiSettings, FiUsers, FiGlobe } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function AdminRoom() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const navigate = useNavigate();

    // Realtime rooms listener
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "rooms"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setRooms(data);
        });
        return () => unsub();
    }, []);

    return (
        <div className="hidesilder w-full p-4 sm:p-6 text-white overflow-y-auto">
            {/* Room list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition relative"
                    >
                        <h2 className="font-semibold text-lg truncate">{room.channelName}</h2>
                        <p className="text-gray-400 text-sm">
                            Created:{" "}
                            {room.createdAt
                                ? new Date(room.createdAt).toLocaleDateString()
                                : "Unknown"}
                        </p>

                        {/* Room info */}
                        <div className="mt-3 space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                <FiGlobe /> {room.room?.language} • {room.room?.level}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiUsers /> {room.room?.joinedUsers?.length || 0} / {room.room?.size}
                            </div>
                            <div className="truncate">
                                Topic: <span className="text-gray-300">{room.room?.topic || "N/A"}</span>
                            </div>
                        </div>

                        {/* Settings button */}
                        <button
                            onClick={() => setSelectedRoom(room)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 transition"
                        >
                            <FiSettings size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative">
                        <button
                            onClick={() => setSelectedRoom(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-2">{selectedRoom.channelName}</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Created:{" "}
                            {selectedRoom.createdAt
                                ? new Date(selectedRoom.createdAt).toLocaleString()
                                : "Unknown"}
                        </p>

                        <div className="space-y-2">
                            <p>
                                <strong>Room ID:</strong> {selectedRoom.id}
                            </p>

                            {/* Owner UID */}
                            <p>
                                <strong>Owner UID:</strong>{" "}
                                <button
                                    className="text-blue-400 hover:underline"
                                    onClick={() =>
                                        navigate(`/admin/users/${selectedRoom.room?.owner}`)
                                    }
                                >
                                    {selectedRoom.room?.owner || "N/A"}
                                </button>
                            </p>

                            <p>
                                <strong>Language:</strong> {selectedRoom.room?.language}
                            </p>
                            <p>
                                <strong>Level:</strong> {selectedRoom.room?.level}
                            </p>
                            <p>
                                <strong>Topic:</strong> {selectedRoom.room?.topic}
                            </p>
                            <p>
                                <strong>Size:</strong> {selectedRoom.room?.size}
                            </p>

                            {/* Joined Users UIDs */}
                            <div>
                                <strong>Joined Users:</strong>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedRoom.room?.joinedUsers?.length > 0 ? (
                                        selectedRoom.room.joinedUsers.map((userObj) => (
                                            <button
                                                key={userObj.uid}
                                                className="bg-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-700"
                                                onClick={() => navigate(`/admin/users/${userObj.uid}`)}
                                            >
                                                {userObj.uid} {/* or userObj.userDetails.name if you want a name */}
                                            </button>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 ml-1">No users</span>
                                    )}

                                </div>
                            </div>

                            <p>
                                <strong>Privilege Expiry:</strong>{" "}
                                {selectedRoom.privilegeExpireTime
                                    ? new Date(selectedRoom.privilegeExpireTime * 1000).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminRoom;

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase";
import { toast } from "react-toastify";

function UserDetailModal({ selectedUser, setSelectedUser, getUserById, getFriends }) {
    const [expandedSections, setExpandedSections] = useState({
        followers: false,
        following: false,
        friends: false,
        communities: false,
    });

    const navigate = useNavigate();

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggelSelectUser = (uid) => {
        navigate(`/admin/users/${uid}`)
        setExpandedSections({
            followers: false,
            following: false,
            friends: false,
            communities: false,
        })
    }

    const toggelSelectCommunity = (cid) => {
        navigate(`/admin/community/${cid}`)
        setExpandedSections({
            followers: false,
            following: false,
            friends: false,
            communities: false,
        })
    }

    const toggleBanUser = async (uid, currentlyBanned) => {
        const action = currentlyBanned ? "unban" : "ban";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const userRef = doc(db, "users", uid);
            if (currentlyBanned) {
                // Unban user
                await updateDoc(userRef, {
                    banned: false,
                    banReason: "",
                    bannedAt: null,
                });
                toast.success("User unbanned successfully");
            } else {
                // Ban user
                await updateDoc(userRef, {
                    banned: true,
                    banReason: "Violation of rules",
                    bannedAt: serverTimestamp(),
                });
                toast.success("User banned successfully");
            }

            // Optionally close modal or refresh user data
            setSelectedUser((prev) => ({
                ...prev,
                banned: !currentlyBanned,
            }));
        } catch (error) {
            toast.error(`Failed to ${action} user. Check console for details.`);
        }
    };


    if (!selectedUser) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="hidesilder bg-gray-900 p-6 rounded-lg w-[80%] max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={() => toggelSelectUser(null)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                >
                    ✕
                </button>

                {/* Profile header */}
                <div className="flex items-center gap-4">
                    <img
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        className="w-20 h-20 rounded-full border border-gray-600 object-cover"
                    />
                    <div>
                        <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                        <p className="text-gray-400 text-sm">
                            Joined {selectedUser.since}
                        </p>
                    </div>
                </div>

                {/* Lists inside modal */}
                <div className="mt-6 space-y-4">
                    {/* Followers */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
                            onClick={() => toggleSection("followers")}
                        >
                            Followers {selectedUser.followers?.length || 0}
                            <span className="text-sm text-gray-400">
                                {expandedSections.followers ? "▲" : "▼"}
                            </span>
                        </h3>
                        {expandedSections.followers && (
                            <div className="space-y-1">
                                {selectedUser.followers?.length > 0 ? (
                                    selectedUser.followers.map((uid) => {
                                        const u = getUserById(uid);
                                        return (
                                            <div
                                                key={uid}
                                                className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded cursor-pointer"
                                                onClick={() => toggelSelectUser(uid)}
                                            >
                                                <img
                                                    src={u?.image}
                                                    alt={u?.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span>{u?.name || "Unknown User"}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">No followers</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Following */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
                            onClick={() => toggleSection("following")}
                        >
                            Following {selectedUser.following?.length || 0}
                            <span className="text-sm text-gray-400">
                                {expandedSections.following ? "▲" : "▼"}
                            </span>
                        </h3>
                        {expandedSections.following && (
                            <div className="space-y-1">
                                {selectedUser.following?.length > 0 ? (
                                    selectedUser.following.map((uid) => {
                                        const u = getUserById(uid);
                                        return (
                                            <div
                                                key={uid}
                                                className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded cursor-pointer"
                                                onClick={() => toggelSelectUser(uid)}
                                            >
                                                <img
                                                    src={u?.image}
                                                    alt={u?.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span>{u?.name || "Unknown User"}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">Not following anyone</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Friends */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
                            onClick={() => toggleSection("friends")}
                        >
                            Friends {getFriends(selectedUser).length}
                            <span className="text-sm text-gray-400">
                                {expandedSections.friends ? "▲" : "▼"}
                            </span>
                        </h3>
                        {expandedSections.friends && (
                            <div className="space-y-1">
                                {getFriends(selectedUser).length > 0 ? (
                                    getFriends(selectedUser).map((uid) => {
                                        const u = getUserById(uid);
                                        return (
                                            <div
                                                key={uid}
                                                className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded cursor-pointer"
                                                onClick={() => toggelSelectUser(uid)}
                                            >
                                                <img
                                                    src={u?.image}
                                                    alt={u?.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span>{u?.name || "Unknown User"}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">No friends</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Communities */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
                            onClick={() => toggleSection("communities")}
                        >
                            Communities {selectedUser.community?.length || 0}
                            <span className="text-sm text-gray-400">
                                {expandedSections.communities ? "▲" : "▼"}
                            </span>
                        </h3>
                        {expandedSections.communities && (
                            <div className="space-y-1">
                                {selectedUser.community?.length > 0 ? (
                                    selectedUser.community.map((cid) => (
                                        <div
                                            key={cid}
                                            className="p-1 hover:bg-gray-800 rounded cursor-pointer"

                                            onClick={() => toggelSelectCommunity(cid)}

                                        >
                                            Community ID: {cid}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No communities</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                        onClick={() => toggleBanUser(selectedUser.id, selectedUser?.banned)}
                    >
                        {!selectedUser?.banned ? 'Ban User' : 'Unban User'}
                    </button>
                    {/* <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                        Edit
                    </button> */}
                </div>
            </div>
        </div>
    );
}

export default UserDetailModal;

import React, { useEffect, useState } from "react";
import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { FiSettings, FiUser, FiUsers } from "react-icons/fi";
import { MdMessage } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function AdminCommunity() {
    const [communities, setCommunities] = useState([]);
    const [communityDetail, setCommunityDetail] = useState(null);

    const [ownerData, setOwnerData] = useState(null);
    const [joinedUsersData, setJoinedUsersData] = useState([]);

    // messages
    const [messages, setMessages] = useState([]);
    const [messagesCount, setMessagesCount] = useState(0);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState("");
    const [senderMap, setSenderMap] = useState({});

    const [editing, setEditing] = useState(false);
    const [addingUid, setAddingUid] = useState(""); // for adding a new user
    const [editLoading, setEditLoading] = useState(false);
    

    const [expanded, setExpanded] = useState({
        owner: false,
        joined: false,
        messages: false,
    });

    const navigate = useNavigate();
    const { id } = useParams();

    const toggle = (k) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

    const formatTs = (raw) => {
        try {
            if (raw && typeof raw.toDate === "function") return raw.toDate().getTime();
            if (typeof raw === "string") return Date.parse(raw) || 0;
            if (typeof raw === "number") return raw;
        } catch { }
        return 0;
    };
    
    const toggleEditing = () => setEditing((p) => !p);

// Add new user by UID
const addUserToCommunity = async () => {
  if (!addingUid.trim()) return toast.error("Please enter a UID");

  try {
    setEditLoading(true);
    const userRef = doc(db, "users", addingUid.trim());
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      toast.error("User not found");
      setEditLoading(false);
      return;
    }

    // Add community ID to user's document
    await updateDoc(userRef, {
      community: arrayUnion(communityDetail.id),
    });

    // Update community's joinedUsers array
    const communityRef = doc(db, "community", communityDetail.id);
    await updateDoc(communityRef, {
      joinedUsers: arrayUnion(addingUid.trim()),
    });

    toast.success("User added to community");
    setAddingUid("");
    setEditLoading(false);

    // Reload joined users
    const updatedJoinedUsers = [...joinedUsersData, { id: userSnap.id, ...userSnap.data() }];
    setJoinedUsersData(updatedJoinedUsers);
  } catch (err) {
    console.error(err);
    toast.error("Failed to add user");
    setEditLoading(false);
  }
};

// Remove user from community
const removeUserFromCommunity = async (uid) => {
  if (!window.confirm("Are you sure you want to remove this user?")) return;

  try {
    setEditLoading(true);
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      community: arrayRemove(communityDetail.id),
    });

    const communityRef = doc(db, "community", communityDetail.id);
    await updateDoc(communityRef, {
      joinedUsers: arrayRemove(uid),
    });

    toast.success("User removed");
    setEditLoading(false);

    setJoinedUsersData((prev) => prev.filter((u) => u.id !== uid));
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove user");
    setEditLoading(false);
  }
};

// Make another user host (owner)
const makeHost = async (uid) => {
  if (!window.confirm("Are you sure you want to make this user the host?")) return;

  try {
    setEditLoading(true);
    const communityRef = doc(db, "community", communityDetail.id);
    await updateDoc(communityRef, {
      owner: uid,
    });

    toast.success("New host assigned");
    setCommunityDetail((prev) => ({ ...prev, owner: uid }));

    setEditLoading(false);
  } catch (err) {
    console.error(err);
    toast.error("Failed to assign host");
    setEditLoading(false);
  }
};

    // LIST VIEW
    useEffect(() => {
        if (id) return;
        const unsub = onSnapshot(collection(db, "community"), (snap) => {
            setCommunities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [id]);

    // DETAIL: load core community + owner + joined
    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        (async () => {
            // clear detail state immediately when switching
            setCommunityDetail(null);
            setOwnerData(null);
            setJoinedUsersData([]);

            const cRef = doc(db, "community", id);
            const cSnap = await getDoc(cRef);
            if (!cSnap.exists() || cancelled) return;

            const cData = { id: cSnap.id, ...cSnap.data() };
            setCommunityDetail(cData);

            // owner
            if (cData.owner) {
                const oSnap = await getDoc(doc(db, "users", cData.owner));
                if (!cancelled && oSnap.exists()) {
                    setOwnerData({ id: oSnap.id, ...oSnap.data() });
                }
            }

            // joined list
            if (Array.isArray(cData.joinedUsers) && cData.joinedUsers.length) {
                const out = [];
                for (const uid of cData.joinedUsers) {
                    const uSnap = await getDoc(doc(db, "users", uid));
                    if (uSnap.exists()) out.push({ id: uSnap.id, ...uSnap.data() });
                }
                if (!cancelled) setJoinedUsersData(out);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // DETAIL: realtime messages (no orderBy -> include all, sort locally)
    useEffect(() => {
        if (!id) return;

        // reset immediately to avoid showing previous community's numbers
        setMessages([]);
        setMessagesCount(0);
        setMessagesLoading(true);
        setMessagesError("");
        setSenderMap({}); // optional: clear cached senders between communities

        const msgsRef = collection(db, "community", id, "messages");
        const unsub = onSnapshot(
            msgsRef,
            (snap) => {
                const rows = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                    _ts: formatTs(d.data().createdAt),
                }));
                setMessages(rows);
                setMessagesCount(snap.size);
                setMessagesLoading(false);

            },
            (err) => {
                console.error("messages onSnapshot error:", err);
                setMessagesError("Failed to load messages.");
                setMessagesLoading(false);
            }
        );

        return () => unsub();
    }, [id]);

    // fetch sender profiles for avatars (best-effort)
    useEffect(() => {
        const need = new Set(messages.map((m) => m.senderId).filter((uid) => uid && !senderMap[uid]));
        if (!need.size) return;

        let cancelled = false;
        (async () => {
            const updates = {};
            for (const uid of need) {
                try {
                    const s = await getDoc(doc(db, "users", uid));
                    if (s.exists()) updates[uid] = { id: s.id, ...s.data() };
                } catch { }
            }
            if (!cancelled && Object.keys(updates).length) {
                setSenderMap((prev) => ({ ...prev, ...updates }));
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [messages, senderMap]);

    const aetailsCommunity = (cid) => {

        navigate(`/admin/community/${cid}`)
        setExpanded({
            owner: false,
            joined: false,
            messages: false,
        })
    }

    async function deleteCommunity(communityId) {
        if (!window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
            return;
        }

        try {
            // Get the community doc to access joinedUsers
            const communityRef = doc(db, "community", communityId);
            const communitySnap = await getDoc(communityRef);

            if (!communitySnap.exists()) {
                alert("Community not found.");
                return;
            }

            const { joinedUsers = [] } = communitySnap.data();

            // Step 1: Delete all messages in subcollection
            const msgsRef = collection(db, "community", communityId, "messages");
            const msgsSnap = await getDocs(msgsRef);

            const deleteMessages = msgsSnap.docs.map((msgDoc) => deleteDoc(msgDoc.ref));
            await Promise.all(deleteMessages);

            // Step 2: Remove community from each joined user's data
            const removeFromUsers = joinedUsers.map(async (userId) => {
                const userRef = doc(db, "users", userId);
                await updateDoc(userRef, {
                    community: arrayRemove(communityId),
                });
            });
            await Promise.all(removeFromUsers);

            // Step 3: Delete the community document
            await deleteDoc(communityRef);

            alert("Community deleted successfully.");
            navigate("/admin/community"); // change to your admin panel route
        } catch (error) {
            toast.error("Error deleting community:", error);
        }
    }

    // LIST VIEW UI
    if (!id) {
        return (
            <div className="w-full p-4 sm:p-6 text-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communities.map((com) => (
                        <div
                            key={com.id}
                            className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition relative"
                        >
                            <h2 className="font-semibold text-lg">{com.name}</h2>
                            <p className="text-gray-400 text-sm">
                                Created:{" "}
                                {com.createdAt?.toDate
                                    ? com.createdAt.toDate().toLocaleDateString()
                                    : "Unknown"}
                            </p>

                            <div className="flex gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-1">
                                    <FiUsers /> {com.joinedUsers?.length || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FiUser /> Owner
                                </div>
                            </div>

                            <button
                                onClick={() => aetailsCommunity(com.id)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 transition"
                                title="Open settings"
                            >
                                <FiSettings size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // DETAIL VIEW UI
    if (id && communityDetail) {
        return (
            <div className="hidesilder w-full p-4 sm:p-6 text-white bg-gray-800 overflow-y-auto">
                <button
                    onClick={() => navigate("/admin/community")}
                    className="mb-4 bg-gray-900 hover:bg-gray-600 px-4 py-2 rounded"
                >
                    ← Back
                </button>

                <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold">{communityDetail.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Created:{" "}
                        {communityDetail.createdAt?.toDate
                            ? communityDetail.createdAt.toDate().toLocaleString()
                            : "Unknown"}
                    </p>

                    <div className="mt-4 space-y-3">
                        <p><strong>Community ID:</strong> {communityDetail.id}</p>

                        {/* Owner (expand) */}
                        <div>
                            <button
                                type="button"
                                className="cursor-pointer text-blue-400 hover:underline"
                                onClick={() => toggle("owner")}
                            >
                                <strong>Owner:</strong> {communityDetail.owner}
                                <span className="ml-2 text-xs text-gray-400">
                                    {expanded.owner ? "▲" : "▼"}
                                </span>
                            </button>
                            {expanded.owner && ownerData && (
                                <div className="mt-2 flex items-center gap-3 p-2 bg-gray-800 rounded cursor-pointer"
                                    onClick={() => navigate(`/admin/users/${ownerData.id}`)}>
                                    <img
                                        src={ownerData.image}
                                        alt={ownerData.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{ownerData.name}</p>
                                        <p className="text-xs text-gray-400">{ownerData.id}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Joined Users (expand) */}
                        <div>
                            <button
                                type="button"
                                className="cursor-pointer text-blue-400 hover:underline"
                                onClick={() => toggle("joined")}
                            >
                                <strong>Joined Users:</strong>{" "}
                                {communityDetail.joinedUsers?.length || 0}
                                <span className="ml-2 text-xs text-gray-400">
                                    {expanded.joined ? "▲" : "▼"}
                                </span>
                            </button>
                            {expanded.joined && (
                                <div className="mt-2 space-y-2">
                                    {joinedUsersData.length > 0 ? (
                                        joinedUsersData.map((u) => (
                                            <div key={u.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded cursor-pointer"
                                                onClick={() => navigate(`/admin/users/${u.id}`)}>
                                                <img
                                                    src={u.image}
                                                    alt={u.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold">{u.name}</p>
                                                    <p className="text-xs text-gray-400">{u.id}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm">No users joined</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Messages (expand, realtime) */}
                        <div>
                            <button
                                type="button"
                                className="cursor-pointer text-blue-400 hover:underline flex items-center gap-2"
                                onClick={() => toggle("messages")}
                            >
                                <MdMessage />
                                <span>
                                    <strong>Messages:</strong>{" "}
                                    {messagesLoading ? "…" : messagesCount}
                                </span>
                                <span className="ml-1 text-xs text-gray-400">
                                    {expanded.messages ? "▲" : "▼"}
                                </span>
                            </button>

                            {expanded.messages && (
                                <div className="mt-2 space-y-3">
                                    {messagesError && (
                                        <p className="text-red-400 text-sm">{messagesError}</p>
                                    )}

                                    {messagesLoading && !messagesError && (
                                        <p className="text-gray-400 text-sm">Loading…</p>
                                    )}

                                    {!messagesLoading &&
                                        !messagesError &&
                                        messages.length === 0 && (
                                            <p className="text-gray-400 text-sm">No messages</p>
                                        )}

                                    {!messagesLoading &&
                                        !messagesError &&
                                        messages.length > 0 &&
                                        messages.map((msg) => {
                                            const sender = senderMap[msg.senderId];
                                            return (
                                                <div key={msg.id} className="bg-gray-800 p-3 rounded">
                                                    <div className="flex items-center gap-3">
                                                        {sender?.image && (
                                                            <img
                                                                src={sender.image}
                                                                alt={sender?.name || msg.senderName}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-semibold">
                                                                    {sender?.name || msg.senderName || "Unknown"}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(msg._ts || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-300 mt-1">{msg.text}</p>
                                                            <p className="text-xs text-gray-500 mt-1">UID: {msg.senderId}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                            onClick={() => deleteCommunity(communityDetail.id)}>
                            Delete Community
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                            onClick={toggleEditing}
                        >
                            {editing ? "Close Edit" : "Edit"}
                        </button>
                    </div>
                    
                    {editing && (
  <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
    <h3 className="text-lg font-bold mb-3">Edit Community</h3>

    {/* Add user */}
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Enter user UID"
        value={addingUid}
        onChange={(e) => setAddingUid(e.target.value)}
        className="flex-1 px-3 py-2 rounded bg-gray-800 text-white"
      />
      <button
        onClick={addUserToCommunity}
        disabled={editLoading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Add
      </button>
    </div>

    {/* Joined users list */}
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {joinedUsersData.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between p-2 bg-gray-800 rounded"
        >
          <div className="flex items-center gap-3">
            <img
              src={u.image}
              alt={u.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-gray-400">{u.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {communityDetail.owner !== u.id && (
              <button
                onClick={() => makeHost(u.id)}
                disabled={editLoading}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
              >
                Make Host
              </button>
            )}

            <button
              onClick={() => removeUserFromCommunity(u.id)}
              disabled={editLoading || communityDetail.owner === u.id}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                </div>
            </div>
        );
    }

    return <p className="text-white p-6">Loading...</p>;
}

export default AdminCommunity;

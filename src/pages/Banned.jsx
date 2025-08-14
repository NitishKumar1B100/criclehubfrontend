import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBan } from "react-icons/fa";
import { useBanned } from "../contexts/BannedContext";
import { db } from "../utils/firebase";
import {
  addDoc,
  collection,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

function Banned() {
  const navigate = useNavigate();
  const { selectedBanned, setSelectedBanned } = useBanned();
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestRequest, setLatestRequest] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  // Real-time banned user data
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        setLoadingData(false);
        navigate("/");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const unsubscribeUser = onSnapshot(
        userRef,
        (userSnap) => {
          if (!userSnap.exists()) {
            navigate("/");
            setLoadingData(false);
            return;
          }

          const userData = { uid: currentUser.uid, ...userSnap.data() };

          if (!userData.banned) {
            navigate("/");
          } else {
            setSelectedBanned(userData);
          }

          setLoadingData(false);
        },
        (err) => {
          console.error("Error fetching banned user data:", err);
          navigate("/");
          setLoadingData(false);
        }
      );

      return () => unsubscribeUser();
    });

    return () => unsubscribeAuth();
  }, [setSelectedBanned, navigate]);

  // Real-time latest unban request
  useEffect(() => {
    if (!user) return;

const q = query(
  collection(db, "report"),
  where("uid", "==", user.uid),
  orderBy("requestedAt", "desc")
);

    const unsubscribeRequests = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data();
          setLatestRequest({
            id: snapshot.docs[0].id,
            ...latest,
          });
          setDescription(latest.description || "");
        } else {
          setLatestRequest(null);
          setDescription("");
        }
      },
      (err) => {
        console.error("Error fetching unban requests:", err);
      }
    );

    return () => unsubscribeRequests();
  }, [user]);

  if (loadingData || !selectedBanned) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const { name, image, banned, banReason, bannedAt } = selectedBanned;

  const formattedDate = bannedAt?.toDate
    ? bannedAt.toDate().toLocaleString()
    : bannedAt
    ? new Date(bannedAt).toLocaleString()
    : "Unknown";

  const handleRequestSubmit = async () => {
    if (!description.trim()) {
      alert("Please enter a reason for your unban request.");
      return;
    }

    setLoading(true);

    try {
      if (latestRequest && !latestRequest.handled) {
        // Update existing pending request
        const requestRef = doc(db, "report", latestRequest.id);
        await updateDoc(requestRef, {
          description,
          updatedAt: serverTimestamp(),
        });
        setLatestRequest({ ...latestRequest, description });
        alert("Unban request updated successfully!");
      } else {
        // Create new request
        const docRef = await addDoc(collection(db, "report"), {
          uid: user.uid,
          name: user.displayName || name,
          image: user.photoURL || image || "",
          description,
          requestedAt: serverTimestamp(),
          handled: false,
        });

        setLatestRequest({
          id: docRef.id,
          uid: user.uid,
          name: user.displayName || name,
          image: user.photoURL || image || "",
          description,
          requestedAt: new Date(),
          handled: false,
        });

        alert("Unban request submitted successfully!");
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error submitting unban request:", error);
      alert("Failed to submit request. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6 transform transition-all duration-500 relative">
        <div className="flex justify-center">
          <div className="bg-red-700 p-6 sm:p-8 rounded-full shadow-lg animate-pulse flex items-center justify-center">
            <FaBan className="text-white text-5xl sm:text-6xl" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          You Are Banned
        </h1>

        <p className="text-gray-300 text-sm sm:text-base md:text-lg">
          Sorry <strong>{name}</strong>, your account has been banned from this platform.
        </p>

        <div className="bg-gray-900 p-4 sm:p-6 rounded-xl space-y-3 text-left border border-gray-700 relative">
          <p className="text-gray-400 text-sm sm:text-base">
            <strong>Reason:</strong> {banReason || "Not specified"}
          </p>
          <p className="text-gray-400 text-sm sm:text-base">
            <strong>Banned At:</strong> {formattedDate}
          </p>

          {latestRequest && (
            <span
              className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full font-semibold text-xs ${
                latestRequest.handled
                  ? "bg-green-500 text-black"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {latestRequest.handled ? "Handled" : "Pending"}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-4 w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition duration-300"
        >
          {!latestRequest || latestRequest.handled
            ? "Make a New Request"
            : "Update Unban Request"}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Unban Request</h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Please provide a reason why you should be unbanned.
            </p>
            <textarea
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
              rows={4}
              placeholder="Enter your reason..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSubmit}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : !latestRequest || latestRequest.handled
                  ? "Submit New Request"
                  : "Update Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Banned;

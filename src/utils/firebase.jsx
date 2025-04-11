import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { toast } from "react-toastify";



const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);
const storage = getStorage(app);

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    const providerInfo = user.providerData.find(
      (provider) => provider.providerId === "google.com"
    );
    
    const userData = {
      name: providerInfo.displayName,
      image: user.photoURL,
      uid: user.uid,
      since: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    };
    
    if (docSnap.exists()) {
      // User exists — update their name and image only
      await updateDoc(docRef, {
        name: providerInfo.displayName,
        image: userData.image,
      });
    } else {
      // New user — set all data and an empty friends array
      await setDoc(docRef, {
        ...userData,
        following: [],
        followers: [],
      });
    }

  } catch (error) {
    toast.error("Error signing in with Google. Please try again later.");
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    toast.error("Error logging out. Please try again later.");
  }
};

export { auth, signInWithGoogle, logout, db, storage};

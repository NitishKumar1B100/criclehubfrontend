import { toast } from "react-toastify";
import { db, logout, signInWithGoogle } from "../../utils/firebase";
import { useLogin } from "../../contexts/LoginCreadentialContext";
import { deleteDoc, doc } from "firebase/firestore";

function DangerZone() {
    const { LoginData, setLoginData } = useLogin();

    const handleLogout = async () => {
        await logout()
    };

    const handleSwitchAccount = async () => {
        try {
            await logout()
            await signInWithGoogle()
            setLoginData(null);
            toast.success("Switched account successfully.");
        } catch (error) {
            toast.error("Could not switch account.");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "⚠️ This will permanently delete your account and all data. Do you want to continue?"
        );
    
        if (confirmed && LoginData?.uid) {
            try {
                // Step 1: Delete Firestore user document
                const userDocRef = doc(db, "users", LoginData.uid);
                await deleteDoc(userDocRef);
    
                // Step 2: Logout the user
            
                await logout()
    
                toast.success("Account and user data deleted permanently.");
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Failed to delete account. Please re-login and try again.");
            }
        }
    };

    return (
        <div className="p-8 bg-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-red-600 opacity-10 rounded-full animate-ping"></div>
            {LoginData ? (
                <div className="space-y-5">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-600 transition-all duration-200 shadow-md"
                    >
                        Log Out
                    </button>

                    <button
                        onClick={handleSwitchAccount}
                        className="w-full py-3 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-700 transition-all duration-200 shadow-md"
                    >
                        Switch Account
                    </button>

                    <div className="bg-gray-900 text-gray-300 text-sm px-4 py-3 rounded-lg border border-gray-700">
  <strong className="text-red-400 font-semibold">⚠️ Important:</strong> This action is <span className="text-red-500 font-bold">irreversible</span>. 
  Your account and all associated data will be permanently deleted, including your profile, posts, chat history, followers, and following list. 
  Others will no longer be able to view or interact with your content, and you won’t appear in their followers or following anymore.
</div>


                    <button
                        onClick={handleDelete}
                        className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 shadow-md"
                    >
                        Delete Account
                    </button>

                </div>
            ) : (
                <p className="text-center text-gray-400">Please log in to manage your account settings.</p>
            )}
        </div>
    );
}

export default DangerZone;

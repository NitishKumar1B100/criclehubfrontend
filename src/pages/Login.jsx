import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle } from "../utils/firebase";
import { toast } from "react-toastify";

function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error("Google Sign-in error");
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="bg-gray-800 text-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md space-y-6 text-center">
        <p className="text-gray-400 text-sm sm:text-base">Login to continue</p>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-800 rounded-full font-semibold hover:bg-gray-200 transition duration-200 shadow-md"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-sm sm:text-base">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}

export default LoginPage;

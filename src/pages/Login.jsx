import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle } from "../utils/firebase"; // Replace with your Google auth function
import { toast } from "react-toastify";

function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle(); // Your actual sign-in function
    } catch (err) {
      toast.error("Google Sign-in error:", 'Login.jsx');
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="bg-gray-800 text-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome Back 👋</h1>
        <p className="text-gray-400">Login to continue to your account</p>

        <button
          onClick={handleGoogleLogin}
          className="cursor-pointer flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-800 rounded-full font-semibold hover:bg-gray-100 transition duration-200"
        >
          <FcGoogle className="text-2xl" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;

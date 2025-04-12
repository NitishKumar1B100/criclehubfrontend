import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

function RestrictedAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-600 p-5 rounded-full shadow-lg">
            <FaLock className="text-white text-4xl" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-300 text-base sm:text-lg">
          The port or page you’re trying to access is restricted or doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer mt-2 px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition duration-200"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default RestrictedAccess;

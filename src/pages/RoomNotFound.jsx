import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RoomNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl max-w-md w-full text-center space-y-5">
        <div className="flex justify-center">
          <div className="bg-yellow-500 p-4 rounded-full shadow-md">
            <FaQuestionCircle className="text-white text-3xl" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">Room Not Found</h2>
        <p className="text-gray-300 text-base sm:text-lg">
          The room you’re looking for doesn’t exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/room')}
          className="px-5 py-2 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600 transition cursor-pointer"
        >
          Go Back to Rooms
        </button>
      </div>
    </div>
  );
};

export default RoomNotFound;

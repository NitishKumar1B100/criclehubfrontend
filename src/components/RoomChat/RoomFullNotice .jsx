import React from 'react';
import { FaDoorClosed } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const RoomFullNotice = () => {

    const navigate = useNavigate();
    const goBackToHome = () => navigate("/room");
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md text-center space-y-5">
                <div className="flex justify-center">
                    <div className="bg-red-600 p-4 rounded-full shadow-lg">
                        <FaDoorClosed className="text-white text-3xl" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white">Room is Full</h2>
                <p className="text-gray-300 text-base sm:text-lg">
                    Sorry, this room has reached its maximum number of participants.
                </p>
                <button onClick={goBackToHome}
                className="px-5 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 cursor-pointer transition"
                >Back to Home</button>
            </div>
        </div>
    );
};

export default RoomFullNotice;

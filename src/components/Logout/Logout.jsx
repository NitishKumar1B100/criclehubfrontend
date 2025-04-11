function Logout({setShowDetails, LoginData, showDetails, handleLogout, imageUrl}) {
    return(
        <div>
        <div
    
          className="relative w-[50px] h-[50px] mr-8 border border-white rounded-full cursor-pointer overflow-hidden"
          onClick={() => setShowDetails(prev => !prev)}>
          <img src={LoginData.photoURL ? LoginData.photoURL : ''} 
          className="w-full h-full" 
          referrerPolicy="no-referrer"
          onError={(e) => (e.target.src = "/fallback-image.png")}
          alt="" />
        </div>
        <div className="">
          {showDetails && (
            <div className="absolute bg-gray-600 right-[-30px] top-[47px] transform -translate-x-1/2 mt-2 text-white p-3 rounded shadow-lg flex flex-col items-center z-[999]">
              <span className="text-sm">{imageUrl? imageUrl: ''}</span>
              <button
                onClick={handleLogout}
                className="mt-2 px-3 cursor-pointer py-1 bg-red-500 text-white rounded text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      )
}

export default Logout
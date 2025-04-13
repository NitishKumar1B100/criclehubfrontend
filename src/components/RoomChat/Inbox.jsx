import {useState } from 'react'


const Inbox = ({ messages, sendMessage, user}) => {
  const [input, setInput] = useState("");
  
  const handleSendMessage = () => {
    sendMessage(input)
    setInput('')
  }

  return (
    <div className={`relative h-full flex flex-col bg-gray-800 transition-all duration-300 w-full`}>

      <div className="w-full p-3 bg-gray-700 text-lg font-semibold flex items-center justify-start gap-2">
      
        <div className=''>Room Chat</div>
      </div>
      <div className=" h-[calc(100%-110px)] flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div className={`flex w-full ${msg.sender.uid == user ? 'flex-row-reverse' : 'flex-row'}`} key={index}>
              <div className="w-[50px] h-[50px] bg-gray-500 rounded-full bg-cover bg-center" style={{backgroundImage:`url(${msg.sender.image})`}}></div>
              <div className={`p-2 rounded-lg w-fit mt-6 ${msg.sender.uid == user ? "bg-blue-500 ml-auto" : "bg-gray-600"}`}>
                <span className="text-sm font-semibold ">{msg.sender.name}: </span>
                {msg.message}
                <div className="w-full h-[10px] flex items-center justify-end gap-3 p-2">
                  {msg.sender.uid === user ? <div className="text-[12px] text-red-600 font-semibold cursor-pointer">Delete</div> : <div className="cursor-pointer text-[12px] text-red-600 font-semibold">Report</div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 bg-gray-700 rounded-lg outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={()=> handleSendMessage()} className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default Inbox
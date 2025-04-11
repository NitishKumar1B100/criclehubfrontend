
import DashboardLeft from '../components/DashboardLeft'
import MainChatWindow from '../components/ChatWindow/MainChatWindow'
import { usePhoneChat } from '../contexts/PhoneChatContext'
import { FreindChatIdProvider } from '../contexts/FriendChatID/FriendChatID'


function Dashboard() {
  const { selectedPhoneChat } = usePhoneChat()

  return (
    <FreindChatIdProvider>
      <div className="w-screen h-[calc(100vh-60px)] bg-gray-900 flex">
        <div className="w-full h-full flex flex-row ">
          <div className="w-[26%] dashboard-left sm:w-[400px]">
            <DashboardLeft />
          </div>

          <div className={` ${selectedPhoneChat ? 'show-chat-window' : 'hide-chat-window'} w-[calc(100%-26%)]  bg-gray-700`}>
            <MainChatWindow />
          </div>
        </div>
      </div>
    </FreindChatIdProvider>
  )
}

export default Dashboard

import { useDashboard } from '../../contexts/DashboardLeftcontext'
import FriendChatWindow from './FriendChatWindow'
import CommunityChatWIndow from './CommunityChatWIndow'
import SettingsWindow from './SettingsWindow'


function MainChatWindow() {
  const {activeOption} = useDashboard()
  return (
    <div className={`hidesilder w-full h-full`}>
      {
        activeOption === 'friends' && <FriendChatWindow /> 
      }
      {
        activeOption === 'community' && <CommunityChatWIndow/>
      }
      {
        activeOption === 'settings' && <SettingsWindow/>
      }
    </div>
  )
}

export default MainChatWindow
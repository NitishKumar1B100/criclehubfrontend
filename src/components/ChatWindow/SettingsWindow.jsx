import { FaChevronLeft } from 'react-icons/fa';
import { useCurrentSettings } from '../../contexts/CurrentSettingsContext';
import { usePhoneChat } from '../../contexts/PhoneChatContext';
import DefaultChat from './DefaultChat';

function SettingsWindow() {
    
      const { selectedCurrentSettings  } = useCurrentSettings();
      const { setSelectedPhoneChat } = usePhoneChat()
      
      const hideSettingsOption = () => {
        setSelectedPhoneChat(false)
      };
      
  return (
   (
    selectedCurrentSettings.type === '' ? 
    
   <DefaultChat/>
   
   :
   
    ( <div className={`w-full p-6 text-white`}>
      <div 
      onClick={hideSettingsOption}
      className="p-2 ml-[-15px] text-2xl cursor-pointer hide-chat-window-button">
        <FaChevronLeft/>
      </div>
      
      {selectedCurrentSettings.type === "account" && (
        <div>
          <h3 className="text-2xl font-bold">Account Settings</h3>
          <p>Change your username, email, or password.</p>
        </div>
      )}
      {selectedCurrentSettings.type === "privacy" && (
        <div>
          <h3 className="text-2xl font-bold">Privacy & Security</h3>
          <p>Manage who can contact you, block users, and adjust data settings.</p>
        </div>
      )}
      {selectedCurrentSettings.type === "danger" && (
        <div>
          <h3 className="text-2xl font-bold text-red-500">Danger Zone</h3>
          <p>Delete your account or reset settings.</p>
        </div>
      )}
    </div>)
   ) 
  )
}

export default SettingsWindow
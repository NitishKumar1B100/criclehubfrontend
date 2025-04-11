import { useCurrentSettings } from '../../contexts/CurrentSettingsContext';
import { usePhoneChat } from '../../contexts/PhoneChatContext';
import DefaultChat from './DefaultChat';
import Account from '../SettingOptions/Account';
import { IoClose } from "react-icons/io5";
import { useLogin } from '../../contexts/LoginCreadentialContext';

function SettingsWindow() {
    
      const { selectedCurrentSettings  } = useCurrentSettings();
      const { setSelectedPhoneChat } = usePhoneChat()
      
      
           const { LoginData} = useLogin()
      
      const hideSettingsOption = () => {
        setSelectedPhoneChat(false)
      };
      
      
      if(!LoginData) return <div className="w-full p-6 text-white"></div>
    
      
      
  return (
   (
    selectedCurrentSettings.type === '' ? 
    
   <DefaultChat/>
   
   :
   
    ( <div className={`w-full p-6 text-white`}>
      <div 
      onClick={hideSettingsOption}
      className="p-2 ml-[-15px] text-2xl cursor-pointer hide-chat-window-button">
       <IoClose/>
      </div>
      
      {selectedCurrentSettings.type === "account" && (
        <Account/>
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
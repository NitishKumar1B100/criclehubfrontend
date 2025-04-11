import { useCurrentSettings } from '../../contexts/CurrentSettingsContext';
import { usePhoneChat } from '../../contexts/PhoneChatContext';
import DefaultChat from './DefaultChat';
import Account from '../SettingOptions/Account';
import { IoClose } from "react-icons/io5";
import { useLogin } from '../../contexts/LoginCreadentialContext';
import DangerZone from '../SettingOptions/DangerZone';
import PrivacyPolicy from '../SettingOptions/PrivacyPolicy';

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
   
    ( <div className={`w-full h-full p-6 text-white`}>
      <div 
      onClick={hideSettingsOption}
      className="p-2 ml-[-15px] text-3xl cursor-pointer hide-chat-window-button">
       <IoClose/>
      </div>
      
      {selectedCurrentSettings.type === "account" && (
        <Account/>
      )}

      {selectedCurrentSettings.type === "privacy" && (
        <PrivacyPolicy/>
      )}
      {selectedCurrentSettings.type === "danger" && (
        <DangerZone/>
      )}
    </div>)
   ) 
  )
}

export default SettingsWindow
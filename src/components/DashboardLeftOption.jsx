import { useDashboard } from '../contexts/DashboardLeftcontext';
import { useLogin } from '../contexts/LoginCreadentialContext';
import { useLoginPopUp } from '../contexts/Loginpopup/Loginpopup';
import { usePhoneChat } from '../contexts/PhoneChatContext';


const DashboardLeftOption = ({ children, type }) => {
    const { activeOption, setActiveOption } = useDashboard();
    const { setLoginPopUp } = useLoginPopUp()
    const { LoginData} = useLogin()
    const {setSelectedPhoneChat} = usePhoneChat()
    
      const handleSelectType = () => {
        if(LoginData === null){
            setLoginPopUp(true)
            return 
        }
        setActiveOption(type)
        setSelectedPhoneChat(false)
        
      }
    return (
        <div 
        onClick={handleSelectType}
        className={`w-[60px] h-[60px] bg-gray-800 rounded-[50%] text-[#ffffffb8] text-3xl cursor-pointer
            ${activeOption === type ? 'bg-[#ffffffb8] text-gray-200' : 'text-gray-500'}`}
            >
            <div className="w-full h-full flex justify-center items-center ">
                {children}
            </div>
        </div>
    )
}

export default DashboardLeftOption
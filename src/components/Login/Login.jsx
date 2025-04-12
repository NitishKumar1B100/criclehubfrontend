import { useEffect, useState } from 'react';
import { useLoginPopUp } from '../../contexts/Loginpopup/Loginpopup'
import LoginPage from '../../pages/Login'
import { IoClose } from 'react-icons/io5'; // Close icon

const Login = () => {
  const { LoginPopUp, setLoginPopUp } = useLoginPopUp()

  const [userData] = useState(null);

  useEffect(()=>{
    if(!userData){
      setLoginPopUp(true)
    }else{
      setLoginPopUp(false)
    }
  },[userData])


  const handleClose = () => {
    setLoginPopUp(prev => !prev)
  }
  return (
    <div
      className={`flex justify-center items-center text-white text-[19px] mr-2 
      ${LoginPopUp ? 'w-full h-screen fixed inset-0 bg-gray-800 z-[999]' : ''}`}>
{     LoginPopUp ?(<> <button
          onClick={handleClose}
          className="cursor-pointer absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-50"
          aria-label="Close"
        >
          <IoClose />
        </button>
      <LoginPage/></>):(<button className=' cursor-pointer bg-blue-600 pl-3 pr-3 p-1 tex-[15px] rounded-full text-white' onClick={handleClose}>Login</button>)}
    </div>
  )
}


export default Login
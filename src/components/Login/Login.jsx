import { toast } from 'react-toastify'
import { useLoginPopUp } from '../../contexts/Loginpopup/Loginpopup'
import { signInWithGoogle } from '../../utils/firebase'

const Login = () => {
  const { LoginPopUp, setLoginPopUp } = useLoginPopUp()

  const handleLogin = async () => {  try {

    
    await signInWithGoogle();

  } catch (error) {
    toast.error("Google sign-in failed. Please try again.");
  }
  }

  const handleClose = () => {
    setLoginPopUp(false)
  }
  return (
    <div
      className={`flex justify-center items-center text-white text-[19px] mr-2 
      ${LoginPopUp ? 'w-full h-screen fixed inset-0 bg-gray-800 z-[999]' : ''}`}>
      <div className={`${LoginPopUp ? 'relative flex flex-col justify-center items-center gap-3 p-5 rounded bg-gray-900' : ''}`}>
        {LoginPopUp && (
          <div className="">
            <h1 className="text-[30px] font-bold">Welcome to CircleHub</h1>
          </div>
        )}
        {
          LoginPopUp && (
            <>
              <button className="absolute top-0 right-1 cursor-pointer" onClick={handleClose}>X</button>
            </>
          )
        }
        <button onClick={handleLogin}
          className={`${LoginPopUp ? 'w-[200px]' : 'w-[100px]'} bg-blue-800 cursor-pointer p-2 h-[40px] rounded flex justify-center items-center`}>
          Login</button>
      </div>
    </div>
  )
}


export default Login
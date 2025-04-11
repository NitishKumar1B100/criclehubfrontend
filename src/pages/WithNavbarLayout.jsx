import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

function WithNavbarLayout() {
  return (
    <div className='flex flex-col-reverse sm:flex-col'>
        <Navbar/>
        <Outlet/>
    </div>
  )
}

export default WithNavbarLayout
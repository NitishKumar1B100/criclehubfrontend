import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

function WithNavbarLayout() {
  return (
    <div>
        <Navbar/>
        <Outlet/>
    </div>
  )
}

export default WithNavbarLayout
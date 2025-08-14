import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Login from '../../components/Login/Login'
import { useAdminData } from '../AdminProtectedRoute'

function AdminNavbar() {
    const { adminData } = useAdminData()
    const Navigate = useNavigate()
  return (
 <div className="w-screen h-[50px] bg-gray-800 sm:h-[60px]">
  <div className="w-full h-full">
    <div className="flex justify-between items-center h-full px-4">

      {/* Logo */}
      <div className="text-white font-bold text-[22px] sm:text-[28px] p-2">
<span 
  onClick={() => Navigate('/admin')} 
  className="text-xl font-bold text-white cursor-pointer hover:text-blue-500 transition"
>
  CircleHub
</span>
<span className="ml-2 text-sm text-gray-400">
  Admin Panel
</span>
      </div>

      {!adminData && (<Login/>)} 
    </div>
  </div>
</div>  )
}

export default AdminNavbar



import React from 'react'
import { NavLink } from 'react-router-dom'

function AdminBottomNav({ menuItems }) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 flex justify-around p-2">
            {menuItems.map((item, idx) => (
                <NavLink
                    key={idx}
                    to={item.path}
                    end={item.path === "/admin"}   // ✅ Fix for dashboard
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-2 rounded transition ${isActive ? "text-blue-500" : "text-white"
                        }`
                    }
                >
                    {item.icon}
                </NavLink>

            ))}
        </nav>
    )
}

export default AdminBottomNav

import React from "react";
import { NavLink } from "react-router-dom";
import { useAdminData } from "../../AdminProtectedRoute";

function AdminSidebar({ menuItems }) {
    return (
        <aside className="hidden md:flex md:flex-col w-64 bg-gray-800 p-4 border-r border-gray-700">

            <nav className="space-y-2">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        end={item.path === "/admin"}   // ✅ Only Dashboard should match exactly
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 p-2 rounded transition ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-700"
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>

                ))}
            </nav>
        </aside>
    );
}

export default AdminSidebar;

import React from "react";
import AdminNavbar from "./AdminNavbar";
import { FiHome, FiUsers, FiBarChart2, FiFlag, FiMonitor } from "react-icons/fi";
import AdminSidebar from "./components/AdminSidebar";
import AdminBottomNav from "./components/AdminBottomNav";
import { useAdminData } from "../AdminProtectedRoute";

function Adminlayout({children }) {
        const { adminData } = useAdminData()
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <FiHome size={22} /> },
    { name: "Manage Users", path: "/admin/users", icon: <FiUsers size={22} /> },
    { name: "Community", path: "/admin/community", icon: <FiBarChart2 size={22} /> },
    { name: "Rooms", path: "/admin/rooms", icon: <FiMonitor size={22} /> },
    { name: "Reports", path: "/admin/reports", icon: <FiFlag size={22} /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Navbar */}
      <AdminNavbar adminData={adminData} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <AdminSidebar menuItems={menuItems} />

        {/* Main Content */}
        {/* <AdminInfo adminData={adminData} className="flex-1 p-6 overflow-auto" /> */}
        {children}
      </div>

      {/* Bottom Nav for mobile */}
      <AdminBottomNav menuItems={menuItems} className="md:hidden" />
    </div>
  );
}

export default Adminlayout;

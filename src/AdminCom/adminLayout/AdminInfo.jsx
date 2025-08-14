import React from 'react'
import { useAdminData } from '../AdminProtectedRoute'

function AdminInfo() {
      const { adminData, stats } = useAdminData()
      // console.log(adminData)
  return (
    <main className="hidesilder flex-1 p-6 overflow-y-auto">
          {/* Admin Profile (Instagram style) */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
            {/* Profile Image */}
            <img
              src={adminData?.image}
              alt={adminData?.name || "Admin"}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-gray-700 object-cover"
            />

            {/* Profile Info */}
            <div className="flex flex-col items-center md:items-start">
              {/* Name */}
<h1 className="text-2xl font-bold text-white">
  {adminData?.name || "Admin"}
  <span className="ml-2 text-sm font-normal text-gray-400">
    Administrator
  </span>
</h1>
              <p className="text-gray-400 text-sm">
                Since {adminData?.since || "—"}
              </p>

              {/* Stats Row */}
              <div className="flex gap-6 mt-4 text-center md:text-left">
                <div>
                  <span className="font-bold text-lg">
                    {adminData?.community?.length || 0}
                  </span>
                  <p className="text-gray-400 text-sm">Communities</p>
                </div>
                <div>
                  <span className="font-bold text-lg">
                    {adminData?.followers?.length || 0}
                  </span>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div>
                  <span className="font-bold text-lg">
                    {adminData?.following?.length || 0}
                  </span>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">Total Users</h2>
              <p className="text-3xl font-bold mt-2">{stats.usersCount}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">Active Rooms</h2>
              <p className="text-3xl font-bold mt-2">{stats.activeRoomsCount}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">Community</h2>
              <p className="text-3xl font-bold mt-2">{stats.communityCount}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">Reports</h2>
              <p className="text-3xl font-bold mt-2">{stats.reportsCount}</p>
            </div>
          </div>
        </main>
)
}

export default AdminInfo
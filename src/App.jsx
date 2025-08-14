import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import { DashboardProvider } from "./contexts/DashboardLeftcontext";
import { FriendProvider } from "./contexts/FriendContext";
import { CommunityProvider } from "./contexts/CommunityContext";
import Room from "./pages/Room";
import { CurrentSettingsProvider } from "./contexts/CurrentSettingsContext";
import { PhoneChatProvider } from "./contexts/PhoneChatContext";
import { LoginProvider } from "./contexts/LoginCreadentialContext";
import { FriendListProvider } from "./contexts/FriendList/FirendListContext";
import { LoginPopUpProvider } from "./contexts/Loginpopup/Loginpopup";

// 🔔 Import react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WithNavbarLayout from "./pages/WithNavbarLayout";
import RestrictedAccess from "./pages/NotFound";
import AdminProtectedRoute from "./AdminCom/AdminProtectedRoute";
import AdminInfo from "./AdminCom/adminLayout/AdminInfo";
import AdminReports from "./AdminCom/adminLayout/AdminReports";
import AdminCommunity from "./AdminCom/adminLayout/AdminCommunity";
import AdminManageUsers from "./AdminCom/adminLayout/AdminManageUsers";
import AdminRoom from "./AdminCom/adminLayout/AdminRoom";
import Banned from "./pages/Banned";
import { BannedProvider } from "./contexts/BannedContext";

function Layout() {
  return (
    <Routes>
      {/* Routes with Navbar */}
      <Route element={<WithNavbarLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/room" element={<Rooms />} />
      </Route>

      {/* Routes without Navbar */}
      <Route path="/room/:id" element={<Room />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route index element={<AdminInfo />} />
        <Route path="users" element={<AdminManageUsers />} />
        <Route path="users/:uid" element={<AdminManageUsers />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="community/:id" element={<AdminCommunity />} />
        <Route path="rooms" element={<AdminRoom />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="/banned" element={<Banned />} />

      <Route path="*" element={<RestrictedAccess />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <LoginPopUpProvider>
        <CurrentSettingsProvider>
          <DashboardProvider>
            <FriendProvider>
              <CommunityProvider>
                <PhoneChatProvider>
                  <LoginProvider>
                    <FriendListProvider>
                      <BannedProvider>
                        <Layout />
                        <ToastContainer position="top-right" autoClose={3000} />
                      </BannedProvider>
                    </FriendListProvider>
                  </LoginProvider>
                </PhoneChatProvider>
              </CommunityProvider>
            </FriendProvider>
          </DashboardProvider>
        </CurrentSettingsProvider>
      </LoginPopUpProvider>
    </Router>
  );
}

export default App;

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
import NotFound from "./pages/NotFound";
import WithNavbarLayout from "./pages/WithNavbarLayout";

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
      <Route path="*" element={<NotFound />} />
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
                      <Layout />
                      <ToastContainer position="top-right" autoClose={3000} />
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

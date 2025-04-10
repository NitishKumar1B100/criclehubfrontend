import { useDashboard } from '../contexts/DashboardLeftcontext';
import Friends from './Friends';
import Community from './Community';
import Settings from './Settings';


function DashboardLeftContentType() {
    const { activeOption } = useDashboard();
    
  return (
    <div>
        <div className="w-full h-full @container">
            {activeOption === 'friends' && (
                <div className="w-full h-full">
                    <Friends/>
                </div>
            )}
            {activeOption === 'community' && (
                <div className="w-full h-full">
                    <Community/>
                </div>
            )}
            {activeOption === 'settings' && (
                <div className="w-full h-full">
                    <Settings/>
                </div>
            )}
        </div>
    </div>
  )
}

export default DashboardLeftContentType
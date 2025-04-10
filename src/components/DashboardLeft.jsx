import { FaUserFriends } from "react-icons/fa";
import { CgCommunity } from "react-icons/cg";
// import { CiSettings } from "react-icons/ci";
import DashboardLeftOption from './DashboardLeftOption';
import DashboardLeftContentType from './DashboardLeftContentType';
import { CiSettings } from "react-icons/ci";



function DashboardLeft() {

    return (
        <div className='w-[100%] h-[calc(100vh-60px)] flex'>
            <div className="w-[80px] h-full bg-gray-700 flex flex-col items-center justify-between">

                <div className="flex flex-col justify-between items-center gap-10 mt-2">
                    <DashboardLeftOption type={'friends'}>
                        <FaUserFriends />
                    </DashboardLeftOption>

                    <DashboardLeftOption type={'community'}>
                        <CgCommunity />
                    </DashboardLeftOption>
                </div>

                <div className="mb-2 flex flex-col gap-3 ">
                   
                        <DashboardLeftOption type={'settings'}>
                            <CiSettings />
                        </DashboardLeftOption>
                </div>
            </div>

            <div className={`w-full h-full bg-gray-800 overflow-y-auto hidesilder
            `}>
                <DashboardLeftContentType></DashboardLeftContentType>
            </div>

        </div>
    )
}

export default DashboardLeft
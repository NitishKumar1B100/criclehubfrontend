
import { useCurrentSettings } from "../contexts/CurrentSettingsContext";
import { usePhoneChat } from "../contexts/PhoneChatContext";

const Settings = () => {
  const { selectedCurrentSettings, setSelectedCurrentSettings } = useCurrentSettings();

  const {setSelectedPhoneChat } = usePhoneChat()

  const settingsTabs = [
    { id: "account", name: "Account" },
    { id: "privacy", name: "Privacy & Security" },
    { id: "danger", name: "Danger Zone" },
  ];

  const showSettingsOption = (tab) => {
    if (selectedCurrentSettings.type !== tab.id) {
      setSelectedCurrentSettings({ type: tab.id})
    }
    setSelectedPhoneChat(true)
    
  }

  return (
    <div className="w-full h-full flex bg-gray-900 text-white @container">
      {/* Sidebar */}
      <div className="w-full bg-gray-800">
        <div className="w-full p-2 flex items-center justify-start gap-3">
          <div className="text-xl font-bold text-[30px]">Settings</div>
        </div>
        <ul>
          {settingsTabs.map((tab) => (
            <li
              key={tab.id}
              onClick={() => showSettingsOption(tab)}
              className={`p-2 pl-4 m-2 cursor-pointer hover:bg-gray-700 rounded ${selectedCurrentSettings.type === tab.id ? "bg-gray-700" : ""
                }`}
            >
              {tab.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;

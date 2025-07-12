import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { themeClassMap } from "../constant";

const Home = () => {
  const { selectedUser } = useChatStore();
  const { theme } = useThemeStore();
  const themeClasses = themeClassMap[theme] || {};

  return (
    <div
      className={`h-screen overflow-hidden ${
        themeClasses.base || "bg-base-200"
      }`}
    >
      <div
        className={`flex w-100 h-full items-center justify-center px-4 ${themeClasses.primary}`}
      >
        <div className="relative top-[30px] bg-base-100 w-screen rounded-lg shadow-xl max-w-6xl h-[calc(100vh-8rem)] overflow-hidden">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className="w-fit border-r border-base-300">
              <Sidebar />
            </div>
            <div className="flex-1 min-w-0">
              {selectedUser ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
